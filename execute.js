require('dotenv').config()
const moment = require('moment-timezone');
moment.locale('ru');
moment.tz.setDefault('Europe/Moscow');
const logger = require('./logger');
const { GoogleTable } = require('./spreadsheet');


function sendMes(bot) {
    bot.execute('messages.send', {
      random_id: 0,
      message: 'test1',
      peer_id: 2000000003,
    });
}

async function checkAndRemindDuties(bot) {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows();

        if (tableM3.rows[0] == undefined) { 
            return bot.execute('messages.send', {
                random_id: 0,
                message: `📒 График дежурств пустой. 
        
                            📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                        
                            🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`,
                peer_id: 2000000003,
            });
        }

        let today = moment();
        let lastDateInSchedulePlusWeek = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY').endOf('day').add(7, 'days');
        
        if (today > lastDateInSchedulePlusWeek) {
            return bot.execute('messages.send', {
                random_id: 0,
                message: `🕸️ Последняя запись в графике - старше недели. 
        
                            📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                        
                            🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`,
                peer_id: 2000000003,
            });
        }
        
        let currentRow;

        for (let i = tableM3.rows.length - 1; i >= 0; i--) {
            let dateInSchedule = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').endOf('day');
            let weekBefore = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(6, 'days');

            if (today > dateInSchedule) {
                currentRow = i;
                break;
            } else if ()
        }


    } catch (error) {
        logger.error(error);
        bot.execute('messages.send', {
            random_id: 0,
            message: '❗В результате ежедневной проверки дежурных что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.',
            peer_id: 2000000003,
        });
    }
}

module.exports = { sendMes };