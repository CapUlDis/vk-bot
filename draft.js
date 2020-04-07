const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require('./client_secret.json');

const moment = require('moment');
moment.locale('ru');

const doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
(async () => {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    // let dt1 = new Date(Date.parse(rows[12]['Период']));
    // let dt2 = new Date();

    const today = moment();
    const dateUp = moment(rows[12]['Период'], 'DD-MM-YY');
    const weekBefore = moment(rows[12]['Период'], 'DD-MM-YY').subtract(7, 'days');

    console.log(today.format('LL'), dateUp.format('LL'), weekBefore.format('LL'));
})();