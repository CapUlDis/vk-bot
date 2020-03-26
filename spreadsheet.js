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
        try {
            await this.doc.useServiceAccountAuth(creds);
            await this.doc.loadInfo();
            this.sheet = this.doc.sheetsByIndex[0];
            this.rows = await this.sheet.getRows();
        } catch (error) {
            logger.error(`Can't connect to Google Spreadsheet. Please, check spreadsheet ID: ${error.message}`);
        }
    }
}


module.exports = {GoogleTable};