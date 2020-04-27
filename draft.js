require('dotenv').config()
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { GoogleTable } = require('./spreadsheet');
const creds = require('./client_secret.json');

const moment = require('moment');
moment.locale('ru');

moment.updateLocale('ru', {
    longDateFormat : {
        LTS: 'H:mm:ss',
        LT: 'H:mm',
        L: 'DD.MM.YYYY',
        LL: 'dd, DD.MM.YY',
        LLL: 'D MMMM YYYY г., H:mm',
        LLLL: 'dddd, D MMMM YYYY г., H:mm'
    }
});

let testDate = moment();
console.log(testDate.format('LL'));


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

// const tableDuty = new GoogleTable({ sheetID: '1-N73ij1rCjsVONmah8e1tmF6u0qnXURYsemnhgQt5uY', sheetIndex: 0 });
// (async () => {
//     await tableDuty.getSheetRows();
    // await tableDuty.addRow({ Период: '20.04.2020', Кухня: 'Гусь', КВТ: 'Лось' });
    // await tableDuty.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    // await tableDuty.sheet.clear();
    // console.log(tableDuty.rows[0]._rawData);
    // await tableDuty.rows.del();
    
    // let today = moment();
    // let weekAfter = moment().add(7, 'days');
    // await tableDuty.addOneRow({ Период: today.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
    // await tableDuty.addOneRow({ Период: weekAfter.format('L'), Кухня: 'Ёрш', КВТ: 'Краб' });

    // await tableDuty.delRow(1);
    // await tableDuty.delRow(0);
// })();
// const proxyquire = require('proxyquire').noPreserveCache();
// process.env.SPREADSHEET_ID = 'foo';
// const { tableM3 } = proxyquire('./commands', {});

// (async () => {
//     await tableM3.getSheetRows();
//     console.log(tableM3.sheet);
// })();

// const tets = { my: 0, your: 10 };
// console.log(tets.my);
// (async () => {
//     const tets = { my: 5, your: 7};
//     console.log(tets.my);
// })();