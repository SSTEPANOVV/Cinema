const { getData, setData, removeData } = require('./firebase');

async function signUp(username, password) {
    let response = '';
    if (await getData(`Users/${username}`)) {
        response = 'user_exists';
    } else {
        let updates = {};
        updates[`Users/${username}/password`] = password;
        updates[`Users/${username}/money`] = 0;
        await setData(updates);
        response = 'User has just registered';
    }

    return response;
}

async function signIn(username, password, users, ws) {
    if (Object.keys(users).includes(username)) return 'user_logined';
    let response = '';
    const data = await getData(`Users/${username}`);
    if (data) {
        if (data.password == password) {
            users[username] = ws;
            response = `User ${username} has just logined`;
        }
        else {
            response = `wrong_password`;
        }
    } else {
        response = 'missing_login';
    }

    return response;
}

async function getFilms() {
    let response = '';
    const films = await getData(`Films`);
    Object.keys(films).forEach(film => response += `${film}\n`);
    return response.trim();
}

async function getFilmInformation(filmName) {
    let response = '';
    const film = await getData(`Films/${filmName}`);
    const { country, age, genre, director, actors, duration, description } = film;
    response += `Country: ${country}\n`;
    response += `Genre: ${genre}\n`;
    response += `Director: ${director}\n`;
    response += `Actors: ${actors}\n`;
    response += `Duration: ${duration} min\n`;
    response += `Description: ${description}\n`;
    response += `Age limit: ${age}+\n`;
    return response;
}

async function searchFilmsByGenre(genre) {
    let response = '';
    const films = await getData(`Films`);
    for (let film in films) {
        if (films[film].genre.includes(genre)) response += `${film}\n`;
    }
    return response.trim();
}

async function getOrder(filmName, date, time) {
    let response = '';
    const keyDate = date.replace(/\./g, '');
    const keyTime = time.replace(/\:/g, '');
    const order = await getData(`Order/${filmName}/${keyDate}/${keyTime}`);
    for (let place in order) response += `${place}-${order[place]}\n`;
    return response.trim();
}

async function addOrder(username, filmName, date, time, places, type, price, phone, client, age) {
    const keyDate = date.replace(/\./g, '');
    const keyTime = time.replace(/\:/g, '');
    let updates = {};
    places.split(' ').forEach(place => {
        updates[`Order/${filmName}/${keyDate}/${keyTime}/${place}`] = type;
    });
    await setData(updates);

    updates = {};
    const userMoney = await getData(`Users/${username}/money`);
    const remainMoney = userMoney - price;
    updates[`Users/${username}/money`] = remainMoney;
    await setData(updates);

    updates = {};
    const id = Math.round(1000 - 0.5 + Math.random() * (9999 - 1000 + 1));
    updates[`Users/${username}/Order/${id}`] = { filmName, date, time, places, type, price, phone, client, age };
    await setData(updates);
    return id;
}

async function getUserMoney(username) {
    const user = await getData(`Users/${username}`);
    return user.money;
}

async function getUserOrders(username) {
    let response = '';
    const order = await getData(`Users/${username}/Order`);
    for (let id in order) {
        const {type} = order[id];
        response += type == "paid" ? `Buying - ${id}\n` : `Booking - ${id}\n`;
    }
    return response;
}

async function cancelBooking(username, id) {
    const booking = await getData(`Users/${username}/Order/${id}`);
    const { filmName, date, time, places, price } = booking;
    
    let updates = {};
    const userMoney = await getData(`Users/${username}/money`);
    const remainMoney = userMoney + price;
    updates[`Users/${username}/money`] = remainMoney;
    await setData(updates);


    const keyDate = date.replace(/\./g, '');
    const keyTime = time.replace(/\:/g, '');
    const arr = places.split(' ');
    for(let place of arr) {
        await removeData(`Order/${filmName}/${keyDate}/${keyTime}/${place}`);
    }
    await removeData(`Users/${username}/Order/${id}`);
    return 'Booking was cancelled!';
}

async function deposit(username, amount) {
    let updates = {};
    const userMoney = await getData(`Users/${username}/money`);
    const remainMoney = userMoney + amount;
    updates[`Users/${username}/money`] = remainMoney;
    await setData(updates);
    return `Deposited by ${amount}UAH`;
}

async function withdraw(username, amount) {
    let updates = {};
    const userMoney = await getData(`Users/${username}/money`);
    const remainMoney = userMoney - amount;
    updates[`Users/${username}/money`] = remainMoney;
    await setData(updates);
    return `Withdrawed by ${amount}UAH`;
}

async function acceptBooking(username, id) {
    let updates = {};
    updates[`Users/${username}/Order/${id}/type`] = 'paid';
    await setData(updates);

    const booking = await getData(`Users/${username}/Order/${id}`);
    const { filmName, date, time, places } = booking;

    const keyDate = date.replace(/\./g, '');
    const keyTime = time.replace(/\:/g, '');
    const arr = places.split(' ');
    updates = {}

    for(let place of arr) {
        updates[`Order/${filmName}/${keyDate}/${keyTime}/${place}`] = 'paid';
    }
    await setData(updates);

    return 'Booking was accepted!';
}

async function getOrderInformation(username, id) {
    let response = '';
    const info = await getData(`Users/${username}/Order/${id}`);
    const { filmName, date, time, places, price, phone, client, age } = info;
    response += `Film name: ${filmName}\n`;
    response += `Date: ${date}\n`;
    response += `Time: ${time}\n`;
    response += places.split(' ').length > 1 ? `Places: ${places.replace(/\s/g, ', ')}\n` : `Place: ${places}\n`;
    response += `Price: ${price} UAH\n`;
    response += `Phone number: ${phone}\n`;
    response += `Name and Surname: ${client}\n`;
    response += `Age: ${age}`;
    return response;
}


module.exports = {
    signUp,
    signIn,
    getFilms,
    getFilmInformation,
    searchFilmsByGenre,
    getOrder,
    addOrder,
    getUserMoney,
    getUserOrders,
    cancelBooking,
    deposit,
    withdraw,
    acceptBooking,
    getOrderInformation
};