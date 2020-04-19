const { GoogleSpreadsheet } = require('google-spreadsheet');
const { GoogleTable } = require('./spreadsheet');
const creds = require('./client_secret.json');

const moment = require('moment');
moment.locale('ru');



// const doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
// (async () => {
//     await doc.useServiceAccountAuth(creds);
//     await doc.loadInfo();
//     const sheet = doc.sheetsByIndex[1];
//     const rows = await sheet.getRows();
//     console.log(rows.length);
//     await sheet.addRow({ Период: '19-04-20', Кухня: "Пёс", КВТ: "Кот" });


//     let dt1 = new Date(Date.parse(rows[12]['Период']));
//     let dt2 = new Date();

//     const today = moment();
//     const dateUp = moment(rows[12]['Период'], 'DD-MM-YY');
//     const weekBefore = moment(rows[12]['Период'], 'DD-MM-YY').subtract(7, 'days');

//     console.log(today.format('LL'), dateUp.format('LL'), weekBefore.format('LL'));
// })();

const tableDuty = new GoogleTable({ sheetID: '1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo', sheetIndex: 1 });
(async () => {
    await tableDuty.getSheetRows();
    // console.log(tableDuty.rowsNum);
    
    let today = moment();
    let weekAfter = moment().add(7, 'days');
    await tableDuty.addRow({ Период: today.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
    await tableDuty.addRow({ Период: weekAfter.format('L'), Кухня: 'Ёрш', КВТ: 'Краб' });

    await tableDuty.delRow(1);
    await tableDuty.delRow(0);
})();