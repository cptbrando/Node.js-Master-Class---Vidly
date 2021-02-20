const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

module.exports = function() {
    const db = config.get('db');
    mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(()  => {
            console.info(`Connected to ${db}...`);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}