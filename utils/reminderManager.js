const fs = require('fs');

const PATH = './config/reminders.json';

const activeTimers = new Map();
const activeIntervals = new Map();

function getReminders() {
    try {
        const data = JSON.parse(fs.readFileSync(PATH));
        if (Array.isArray(data)) return { timed: [], permanent: [] };
        return data;
    } catch {
        return { timed: [], permanent: [] };
    }
}

function saveReminders(data) {
    fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    getReminders,

    addTimedReminder(reminder) {
        const data = getReminders();
        data.timed.push(reminder);
        saveReminders(data);
    },

    removeTimedReminder(id) {
        const data = getReminders();
        data.timed = data.timed.filter(r => r.id !== id);
        saveReminders(data);
    },

    addPermanentReminder(reminder) {
        const data = getReminders();
        data.permanent.push(reminder);
        saveReminders(data);
    },

    clearTimedReminders(userId) {
        if (activeTimers.has(userId)) {
            for (const id of activeTimers.get(userId)) clearTimeout(id);
            activeTimers.delete(userId);
        }
        const data = getReminders();
        data.timed = data.timed.filter(r => r.userId !== userId);
        saveReminders(data);
    },

    clearPermanentReminders(userId) {
        if (activeIntervals.has(userId)) {
            for (const id of activeIntervals.get(userId)) clearInterval(id);
            activeIntervals.delete(userId);
        }
        const data = getReminders();
        data.permanent = data.permanent.filter(r => r.userId !== userId);
        saveReminders(data);
    },

    registerTimer(userId, timerId) {
        if (!activeTimers.has(userId)) activeTimers.set(userId, []);
        activeTimers.get(userId).push(timerId);
    },

    registerInterval(userId, intervalId) {
        if (!activeIntervals.has(userId)) activeIntervals.set(userId, []);
        activeIntervals.get(userId).push(intervalId);
    }
};
