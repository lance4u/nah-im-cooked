module.exports = {

    success(message) {

        console.log(
            `[SUCCESS] ${message}`
        );
    },

    error(message) {

        console.log(
            `[ERROR] ${message}`
        );
    },

    info(message) {

        console.log(
            `[INFO] ${message}`
        );
    }
};