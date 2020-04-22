require('dotenv').config()
const moment = require('moment');
moment.locale('ru');
const logger = require('./logger');
const { GoogleTable } = require('./spreadsheet');


const getCurrentDuties = async ctx => {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows(process.env.SHEET_INDEX);
        if (tableM3.rows[0] == undefined) {
            ctx.reply(`График дежурств пустой. Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`);
        }
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
    } catch (error) {
        logger.error(error);
        ctx.reply('Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.')
    }
}

const fillScheduleByLastDuties = async ctx => {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows();
        if (tableM3.rows[0] == undefined) { return ctx.reply('График пустой, нечем заполнять.') };
        let today = moment();
        let lastDateInScheduleMinus2weeks = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY').subtract(14, 'days');
        if (today < lastDateInScheduleMinus2weeks) { return ctx.reply(`Дежурство составлено как минимум на две недели вперёд. 
                                                                     Не торопитесь планировать так далеко в этом изменчивом мире.
                                                                     График: https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`) };
        let lastDateInSchedule = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY');
        let newDutyDate = null;
        if (today > lastDateInSchedule) {
            if (today.weekday() >= lastDateInSchedule.weekday()) {
                newDutyDate = moment().add(7, 'days').weekday(lastDateInSchedule.weekday());
            } else {
                newDutyDate = moment().weekday(lastDateInSchedule.weekday());
            }
        } else {
            newDutyDate = lastDateInSchedule.add(7, 'days');
        }
        let dutyList = [];
        for (let i = tableM3.rows.length - 1; i >= 0 && i >= tableM3.rows.length - 3; i--) {
            for (let j = 2; j >= 1; j--) {
                if (!dutyList.includes(tableM3.rows[i]._rawData[j])) {
                    dutyList.unshift(tableM3.rows[i]._rawData[j]);
                }
            }
        }
        if (dutyList.length % 2 == 0) {
            for (let i = 0; i <= dutyList.length - 1; i = i + 2) {
                await tableM3.addRow({ Период: newDutyDate.format('L'), Кухня: dutyList[i + 1], КВТ: dutyList[i] });
                await tableM3.getSheetRows();
                newDutyDate.add(7, 'days');
            }
        } else {
            dutyList.push(dutyList[0]);
            for (let i = 0; i <= dutyList.length - 1; i = i + 2) {
                await tableM3.addRow({ Период: newDutyDate.format('L'), Кухня: dutyList[i], КВТ: dutyList[i + 1] });
                await tableM3.getSheetRows();
                newDutyDate.add(7, 'days');
            }
        }
        return ctx.reply('График дежурств заполнен.');
    } catch (error) {
        logger.error(error);
        return ctx.reply('Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.')
    }
}

module.exports = { getCurrentDuties, fillScheduleByLastDuties };
