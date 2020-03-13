const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');



async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    console.log(`Title: ${doc.title}, Rows: ${sheet.rowCount}`);
    console.log(sheet.headerValues);
    for (i = 0; i <= 7; i++) {
        console.log(`${rows[i].Период} ${rows[i].Кухня} ${rows[i].КВТ}`);
    };
}

accessSpreadsheet();

