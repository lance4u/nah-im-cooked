const fs = require('fs');

const PATH = './config/userMemory.json';

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

module.exports = {
    getMemory(userId) {
        const data = load();
        return data[userId] || { facts: [] };
    },

    saveMemory(userId, memory) {
        const data = load();
        data[userId] = memory;
        save(data);
    },

    addFact(userId, fact) {
        const data = load();
        if (!data[userId]) data[userId] = { facts: [] };
        if (!data[userId].facts.includes(fact)) {
            data[userId].facts.push(fact);
            if (data[userId].facts.length > 20) {
                data[userId].facts.shift();
            }
        }
        save(data);
    },

    clearMemory(userId) {
        const data = load();
        delete data[userId];
        save(data);
    }
};
