const pino = require('pino');


const logger = pino({ 
    level: process.env.LOV_LEVEL || 'info',
    prettyPrint: { colorize: true, translateTime: true },
});


module.exports = logger;