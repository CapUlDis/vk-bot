const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({ 
    level: process.env.LOV_LEVEL || 'info',
    prettyPrint: { colorize: true, translateTime: true },
});
const expressLogger = expressPino({ logger });


module.exports = logger;