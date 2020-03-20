const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./client_secret.json');

// class Sheet {
//     constructor({ sheetId }) {
//         this.sheetId = sheetId;
//         return this.getRows();
//     }

//     async init() {
//         const rows = await this.getRows();
//         return rows;
//     }

//     async getRows() {
//         const doc = new GoogleSpreadsheet(this.sheetId);
//         await doc.useServiceAccountAuth(creds);
//         await doc.loadInfo();
//         const sheet = doc.sheetsByIndex[0];
//         const rows = await sheet.getRows();
//         return rows;
//     }
// }

// // const sheet = new Sheet({ sheetId: '1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo' }).then((rows) => {
// //     console.log(rows)
// // });

// // console.log(sheet);

// class Sheettest {
//     constructor({ sheetId }) {
//         this.sheetId = sheetId;
//         this.doc = new GoogleSpreadsheet(this.sheetId);
//         this.sheet = null;
//         this.rows = null;
//     }

//     async init() {
//         await this.doc.useServiceAccountAuth(creds);
//         await this.doc.loadInfo();
//         this.sheet = this.doc.sheetsByIndex[0];
//         this.rows = await this.sheet.getRows();
//         return this
//     }
// }

// const sheet = new Sheettest({ sheetId: '1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo' }).init().then((sheet) => {
//     console.log(Sheettest.sheet.rowCount)
// });


// async function access() {
//     const doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
//     await doc.useServiceAccountAuth(creds);
//     await doc.loadInfo();
//     const sheet = doc.sheetsByIndex[0];
//     const rows = await sheet.getRows();
//     console.log(`Title: ${doc.title}, Rows: ${sheet.rowCount}`);
//     console.log(sheet.headerValues);
//     for (i = 0; i <= 7; i++) {
//         console.log(`${rows[i].Период} ${rows[i].Кухня} ${rows[i].КВТ}`);
//     };
// }



doc = new GoogleSpreadsheet('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');
(async () => {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc
})().then(doc => {console.log(doc.title)});