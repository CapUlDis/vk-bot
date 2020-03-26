const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');
const pino = require('pino');

const logger = pino({ 
    level: process.env.LOV_LEVEL || 'info',
    prettyPrint: { colorize: true }
});

class GoogleTable {
    constructor(sheetID) {
        this.doc = new GoogleSpreadsheet(sheetID);
    }

    async getDocInfo() {
        await this.doc.useServiceAccountAuth(creds);
        await this.doc.loadInfo();
        this.sheet = this.doc.sheetsByIndex[0];
        this.rows = await this.sheet.getRows();
        logger.info('It is just a test logger from spreadsheet.js!')
    }
}


module.exports = {GoogleTable};