require('dotenv').config()
const moment = require('moment');
moment.locale('ru');
const logger = require('./logger');
const { GoogleTable } = require('./spreadsheet');


const getCurrentDuties = async ctx => {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows(process.env.SHEET_INDEX);
        if (tableM3.rows[0] != undefined) {
            let today = moment();
            for (let i = tableM3.rows.length - 1; i >= 0; i--) {
                let dateUp = moment(tableM3.rows[i]['Период'], 'DD-MM-YY');
                let weekBefore = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(7, 'days');
                if (today <= dateUp && today > weekBefore) {
                    ctx.reply(`В срок до ${dateUp.format('L')} дежурят по кухне - ${tableM3.rows[i]['Кухня']}, по КВТ - ${tableM3.rows[i]['КВТ']}.`);
                    break;
                } else if (today > dateUp || i == 0) {
                    ctx.reply(`На текущий период дежурств не запланировано. Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`);
                    break;
                }
            }
        } else {
            ctx.reply(`График дежурств пустой. Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`);
        }
    } catch (error) {
        logger.error(error);
        ctx.reply('Ошибка: нет доступа к гугл таблице!')
    }
}

module.exports = { getCurrentDuties };
