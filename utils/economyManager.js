const fs = require('fs');

const PATH = './config/economy.json';

function load() {
    try {
        return JSON.parse(fs.readFileSync(PATH));
    } catch {
        return {};
    }
}

function save(data) {
    fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

function getUser(userId) {
    const data = load();
    if (!data[userId]) {
        data[userId] = { coins: 0, lastDaily: null, lastHunt: null, animals: {} };
        save(data);
    }
    return data[userId];
}

function saveUser(userId, user) {
    const data = load();
    data[userId] = user;
    save(data);
}

module.exports = { getUser, saveUser };
