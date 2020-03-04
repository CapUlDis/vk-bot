const { GoogleSpreadsheet } = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client_secret.json');

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    console.log(`Title: ${doc.title}, Rows: ${sheet.rowCount}`);
}

accessSpreadsheet();