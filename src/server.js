const ws = require('ws');
const {
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
} = require('./database.js');

const port = process.env.PORT || 3000;
const wss = new ws.Server({
    port,
}, () => console.log(`Server started on ${port}\n`));

let users = {};

wss.on('connection', (ws) => {
    ws.onmessage = async req => {
        let resp = '';
        const data = JSON.parse(req.data);

        if (data.func == 'signUp') {
            resp = await signUp(data.username, data.password);
        }
        if (data.func == 'signIn') {
            resp = await signIn(data.username, data.password, users, ws);
        }
        if (data.func == 'getFilms') {
            resp = await getFilms();
        }
        if (data.func == 'getFilmInformation') {
            resp = await getFilmInformation(data.filmName);
        }
        if (data.func == 'searchFilmsByGenre') {
            resp = await searchFilmsByGenre(data.genre);
        }
        if (data.func == 'getOrder') {
            resp = await getOrder(data.filmName, data.date, data.time);
        }
        if (data.func === 'addOrder') {
            resp = await addOrder(data.username, data.filmName, data.date, data.time, data.places, data.type, data.price, data.phone, data.client, data.age);
        }
        if (data.func == 'getUserMoney') {
            resp = await getUserMoney(data.username);
        }
        if (data.func == 'getUserOrders') {
            resp = await getUserOrders(data.username);
        }
        if (data.func == 'cancelBooking') {
            resp = await cancelBooking(data.username, data.id);
        }
        if (data.func == 'deposit') {
            resp = await deposit(data.username, data.amount);
        }
        if (data.func == 'withdraw') {
            resp = await withdraw(data.username, data.amount);
        }
        if (data.func == 'acceptBooking') {
            resp = await acceptBooking(data.username, data.id);
        }
        if (data.func == 'getOrderInformation') {
            resp = await getOrderInformation(data.username, data.id);
        }

        console.log(output(data));
        console.log(`Respond:\n${resp}\n`);
        ws.send(resp);
    };

    ws.onclose = () => {
        let login = getLogin(users, ws);
        if (login) {
            delete users[login];
            console.log(`${login} is disconnected.\n`);
        }
    }
});

function output(data) {
    console.log('New request:');
    for (let key in data) {
        if (!data[key]) delete data[key]
    }
    return data;
}

function getLogin(users, ws) {
    return Object.keys(users).find(user => users[user] == ws);
}