require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');


const logger = require('./logger');


class GoogleTable {
    constructor(sheetID) {
        this.doc = new GoogleSpreadsheet(sheetID);
    }

    async getDocSheetRowsInfo(sheetIndex) {
        try {
            await this.doc.useServiceAccountAuth(creds);
            await this.doc.loadInfo();
            this.sheet = this.doc.sheetsByIndex[sheetIndex];
            this.rows = await this.sheet.getRows();
        } catch (error) {
            logger.error(`Can't connect to Google Spreadsheet. Please, check spreadsheet ID: ${error.message}`);
        }
    }
}


module.exports = { GoogleTable };