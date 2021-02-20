const app = require('./app');
const winston = require('winston');

const port = process.env.PORT || 3000
const server = app.listen(port, () => winston.info(`Listening on port ${port}`));

module.exports = server;