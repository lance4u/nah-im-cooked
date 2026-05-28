const fs = require('fs');

module.exports = {

    getReminders() {

        return JSON.parse(
            fs.readFileSync(
                './config/reminders.json'
            )
        );
    },

    saveReminder(reminder) {

        const reminders =
            JSON.parse(
                fs.readFileSync(
                    './config/reminders.json'
                )
            );

        reminders.push(reminder);

        fs.writeFileSync(
            './config/reminders.json',

            JSON.stringify(
                reminders,
                null,
                2
            )
        );
    },

    clearReminders() {

        fs.writeFileSync(
            './config/reminders.json',

            JSON.stringify([], null, 2)
        );
    }
};