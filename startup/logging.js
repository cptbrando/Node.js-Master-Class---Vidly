require('express-async-errors');
const winston = require('winston');
// require('winston-mongodb');

module.exports = function() {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true })),
        new winston.transports.File({ filename: 'uncaughtException.log' }
    )

    // Winston logging
    winston.add( new winston.transports.File({ filename: 'logfile.log' }) );
    // winston.add( new winston.transports.MongoDB({ db: 'mongodb://localhost/vidly' }) );

    // process.on('uncaughtException', (err) => {
    //     winston.error(err.message, err, () => {
    //         console.log('callback reached');
    //         process.exit(1);
    //     });
    // });

    // process.on('unhandledRejection', (err) => {
    //     winston.error(err.message, err, () => {
    //         console.log('callback reached');
    //         process.exit(1);
    //     });
    // });

    
}
