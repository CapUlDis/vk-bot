require('dotenv').config()
const moment = require('moment-timezone');
moment.locale('ru');
moment.tz.setDefault('Europe/Moscow');
const logger = require('./logger');
const { GoogleTable } = require('./spreadsheet');


const getCurrentDuties = async ctx => {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows(process.env.SHEET_INDEX);
        
        if (tableM3.rows[0] == undefined) {
            ctx.reply(`⚠ График дежурств пустой. 
                        📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                        🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`);
        }
        
        let today = moment();
        
        for (let i = tableM3.rows.length - 1; i >= 0; i--) {
            let dateUp = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').endOf('day');
            let weekBefore = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(6, 'days');
            
            if (today <= dateUp && today > weekBefore) {
                ctx.reply(`📅 В срок до ${dateUp.format('L')} дежурят по кухне - ${tableM3.rows[i]['Кухня'].replace(' ✔️', '')}, по КВТ - ${tableM3.rows[i]['КВТ'].replace(' ✔️', '')}.`);
                break;
            } else if (today > dateUp || i == 0) {
                ctx.reply(`🆓 На текущий период дежурств не запланировано. 
                            📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                            🖲 Либо нажмите кнопку "Изменить текущих" для заполнения графика из беседы или кнопку "Автозаполнение графика" для автоматического заполнения на основе предыдущих дежурств.`);
                break;
            }
        }
    } catch (error) {
        logger.error(error);
        ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.');
    }
}

const fillScheduleByLastDuties = async ctx => {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows();
        
        if (tableM3.rows[0] == undefined) { return ctx.reply(`⚠ График пустой, нечем заполнять.
                                                                📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                                                                🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`) };
        
        let today = moment();
        let lastDateInScheduleMinus2weeks = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY').subtract(14, 'days');
        
        if (today < lastDateInScheduleMinus2weeks) { return ctx.reply(`⚠ Дежурство составлено как минимум на две недели вперёд. Не торопитесь планировать так далеко в этом изменчивом мире.
                                                                        📅 График: https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`) };
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
                if (!dutyList.includes(tableM3.rows[i]._rawData[j].replace(' ✔️', ''))) {
                    dutyList.unshift(tableM3.rows[i]._rawData[j].replace(' ✔️', ''));
                }
            }
        }
        
        if (dutyList.length % 2 == 0) {
            for (let i = 0; i <= dutyList.length - 1; i = i + 2) {
                await tableM3.addRow({ Период: newDutyDate.format('L'), Кухня: dutyList[i + 1], КВТ: dutyList[i] });
                newDutyDate.add(7, 'days');
            }
        } else {
            dutyList.push(dutyList[0]);
            for (let i = 0; i <= dutyList.length - 1; i = i + 2) {
                await tableM3.addRow({ Период: newDutyDate.format('L'), Кухня: dutyList[i], КВТ: dutyList[i + 1] });
                newDutyDate.add(7, 'days');
            }
        }
        
        return ctx.reply('✅ График дежурств заполнен.');
    } catch (error) {
        logger.error(error);
        return ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.');
    }
}

const confirmDuty = async ctx => {
    try{
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows(process.env.SHEET_INDEX);

        // проверяемя что таблица не пустая
        if (tableM3.rows[0] == undefined) { // если пустая
            return ctx.reply(`📒 График дежурств пустой. Нечего подтверждать.
                                🖲 Чтобы заполнить график на ближайший период, нажмите кнопку "Изменить дежурных" либо внесите дежурных в таблицу вручную.`);
        }

        let today = moment();
        let lastDateInSchedule = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY').endOf('day');

        if (today.diff(lastDateInSchedule, 'days') >= 4) {
            return ctx.reply(`🕸️ Последняя запись в таблице дежурств старше чётырёх дней. Нечего подтверждать.
                                🖲 Чтобы заполнить график на ближайший период, нажмите кнопку "Изменить дежурных" либо внесити дежурных в таблицу вручную.`);
        }

        let currentRow;
        let previousRow;

        for (let i = tableM3.rows.length - 1; i >= 0; i--) {
            let dateInSchedule = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').endOf('day');
            let weekBefore = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(6, 'days');

            if (today <= dateInSchedule && today >= weekBefore) {
                currentRow = i;
                previousRow = currentRow != 0 ? currentRow - 1 : previousRow;
                break;
            } else if (today > dateInSchedule) {
                previousRow = i;
                break;
            } else if (i == 0) {
                currentRow = i;
                break;
            }
        }
        
        const { bot } = require('./index');
        let res = await bot.execute('users.get', {
            user_ids: ctx.message.from_id,
            fields: 'screen_name',
        });
        let dutyName = res[0].screen_name;

        if (previousRow != undefined) {
            let previousDate = moment(tableM3.rows[previousRow]['Период'], 'DD-MM-YY').endOf('day');

            if (today.diff(previousDate, 'days') <= 4) {
                let kitchen = tableM3.rows[previousRow]['Кухня'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[previousRow]['Кухня']};
                let kvt = tableM3.rows[previousRow]['КВТ'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[previousRow]['КВТ'] };

                if (!kitchen.check && kitchen.duty.includes(dutyName)) {
                    tableM3.rows[previousRow]['Кухня'] += ' ✔️';
                    await tableM3.rows[previousRow].save();
                    return ctx.reply(`✔️ Дежурство по Кухне за ${tableM3.rows[previousRow]['Период']} подтверждено!
                                        🙏 Пожалуйста, в следующий раз постарайтесь завершить дежурство вовремя!`);
                }

                if (!kvt.check && kvt.duty.includes(dutyName)) {
                    tableM3.rows[previousRow]['КВТ'] += ' ✔️';
                    await tableM3.rows[previousRow].save();
                    return ctx.reply(`✔️ Дежурство по КВТ за ${tableM3.rows[previousRow]['Период']} подтверждено! 
                                        🙏 Пожалуйста, в следующий раз постарайтесь завершить дежурство вовремя!`);
                }
            }
        }

        if (currentRow != undefined) {
            let currentDate = moment(tableM3.rows[currentRow]['Период'], 'DD-MM-YY').endOf('day');

            if (currentDate.diff(today, 'days') > 7) {
                return ctx.reply(`📅 Ближайший срок дежурства: ${tableM3.rows[currentRow]['Период']} - позднее недели текущего момента. 
                                    🔍 Проверьте график и вручную поставьте дежурство на ближайшую неделю.`)
            }

            if (currentDate.diff(today, 'days') > 2) {
                return ctx.reply(`✖️ Дежурство не подтверждено! Подтвердить дежурство можно не раньше двух дней до окончания периода.
                                    📅 Срок окончания текущего дежурства: ${tableM3.rows[currentRow]['Период']}.`);
            }

            let kitchen = tableM3.rows[currentRow]['Кухня'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[currentRow]['Кухня']};
            let kvt = tableM3.rows[currentRow]['КВТ'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[currentRow]['КВТ'] };

            if (!kitchen.check && kitchen.duty.includes(dutyName)) {
                tableM3.rows[currentRow]['Кухня'] += ' ✔️';
                await tableM3.rows[currentRow].save();
                return ctx.reply(`✔️ Дежурство по Кухне за ${tableM3.rows[currentRow]['Период']} подтверждено! 
                                    👍 Спасибо за своевременное дежурство!`);
            }

            if (!kvt.check && kvt.duty.includes(dutyName)) {
                tableM3.rows[currentRow]['КВТ'] += ' ✔️';
                await tableM3.rows[currentRow].save();
                return ctx.reply(`✔️ Дежурство по КВТ за ${tableM3.rows[currentRow]['Период']} подтверждено! 
                                    👍 Спасибо за своевременное дежурство!`);
            }
        }

        return ctx.reply(`✖️ Вашего имени среди дежурных за прошедший и текущий период не найдено!`);

    } catch (error) {
        logger.error(error);
        return ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.');
    }
}

module.exports = { getCurrentDuties, fillScheduleByLastDuties, confirmDuty };
