const { initializeApp } = require('firebase/app');
const { getDatabase, ref, child, get, update, remove } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyBEzQw3W_5cZIl75DqSCdzjWCXaUTfREqE",
    authDomain: "cinema-75875.firebaseapp.com",
    databaseURL: "https://cinema-75875-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cinema-75875",
    storageBucket: "cinema-75875.appspot.com",
    messagingSenderId: "524902692261",
    appId: "1:524902692261:web:b3cc325b9c1759d66b644c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

async function getData(path) {
    return await get(child(dbRef, path)).then(data => data.exists() ? data.val() : "");
}

async function setData(updates) {
    return await update(dbRef, updates).then(() => true);
}

async function removeData(path) {
    const databaseRef = ref(db, path);
    return await remove(databaseRef).then(() => true);
}

module.exports = { getData, setData, removeData };