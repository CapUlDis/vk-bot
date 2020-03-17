const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');

class Sheet {
    constructor({ sheetId }) {
        this.sheetId = sheetId;
        return this.getRows();
    }

    async init() {
        const rows = await this.getRows();
        return rows;
    }

    async getRows() {
        const doc = new GoogleSpreadsheet(this.sheetId);
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        return rows;
    }
}

const sheet = new Sheet({ sheetId: '1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo' }).then((rows) => {
    console.log(rows)
});

console.log(sheet);


