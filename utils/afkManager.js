const fs = require('fs');

module.exports = {

    saveAFK(guildId, channelId) {

        fs.writeFileSync(
            './config/afk.json',

            JSON.stringify({
                guildId,
                channelId
            }, null, 2)
        );
    },

    getAFK() {

        return JSON.parse(
            fs.readFileSync(
                './config/afk.json'
            )
        );
    },

    clearAFK() {

        fs.writeFileSync(
            './config/afk.json',

            JSON.stringify({
                guildId: '',
                channelId: ''
            }, null, 2)
        );
    }
};