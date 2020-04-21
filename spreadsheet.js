require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');


const logger = require('./logger');


class GoogleTable {
    constructor({ sheetID, sheetIndex }) {
        this.doc = new GoogleSpreadsheet(sheetID);
        this.sheetIndex = sheetIndex;
    }

    async getSheetRows() {
        try {
            await this.doc.useServiceAccountAuth(creds);
            await this.doc.loadInfo();
            this.sheet = this.doc.sheetsByIndex[this.sheetIndex];
            this.rows = await this.sheet.getRows();
        } catch (error) {
            logger.error(`Something went wrong with connection or object: ${error.message}`);
        }
    }

    async addRow({ Период, Кухня, КВТ }) {
        try {
            await this.sheet.addRow({ Период, Кухня, КВТ });
        } catch (error) {
            logger.error(`Something went wrong with connection or object: ${error.message}`);
        }
    }

    async delRow(rowIndex) {
        try {
            this.rows = await this.sheet.getRows();
            await this.rows[rowIndex].delete();
        } catch (error) {
            logger.error(`Something went wrong with connection or object: ${error.message}`);
        }
    }
}


module.exports = { GoogleTable };