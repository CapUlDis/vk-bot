require('dotenv').config()
const moment = require('moment-timezone');
moment.locale('ru');
moment.tz.setDefault('Europe/Moscow');
const logger = require('./logger');
const { GoogleTable } = require('./spreadsheet');


async function checkAndRemindDuties(bot) {
    try {
        const tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await tableM3.getSheetRows();

        if (tableM3.rows[0] == undefined) { 
            return bot.execute('messages.send', {
                random_id: 0,
                peer_id: process.env.CHAT_ID,
                message: `📒 График дежурств пустой. 
                            📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                            🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`,
            });
        }

        let today = moment();
        let lastDateInSchedulePlusWeek = moment(tableM3.rows[tableM3.rows.length - 1]['Период'], 'DD-MM-YY').endOf('day').add(7, 'days');
        
        if (today > lastDateInSchedulePlusWeek) {
            return bot.execute('messages.send', {
                random_id: 0,
                peer_id: process.env.CHAT_ID,
                message: `🕸️ Последняя запись в графике - старше недели. 
                            📝 Заполните график по ссылке https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID} вручную.
                            🖲 Или нажмите кнопку "Изменить текущих" для заполнения графика из беседы.`,
            });
        }
        
        let currentRow;
        let previousRow;

        for (let i = tableM3.rows.length - 1; i >= 0; i--) {
            let dateInSchedule = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').endOf('day');
            let weekBefore = moment(tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(6, 'days');

            if (today <= dateInSchedule && today > weekBefore) {
                currentRow = i;
                previousRow = currentRow != 0 ? currentRow - 1 : previousRow;
                break;
            } else if (today > dateInSchedule || i == 0) {
                previousRow = i;
                break;
            }
        }

        if (previousRow != undefined) {
            let previousDate = moment(tableM3.rows[previousRow]['Период'], 'DD-MM-YY');
            let previousDatePlus4days = moment(tableM3.rows[previousRow]['Период'], 'DD-MM-YY').add(4, 'days').endOf('day');
            
            if (today <= previousDatePlus4days) {
                let kitchen = tableM3.rows[previousRow]['Кухня'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[previousRow]['Кухня']};
                let kvt = tableM3.rows[previousRow]['КВТ'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[previousRow]['КВТ'] };

                if (!(kitchen.check && kvt.check)) {
                    let lag = today.diff(previousDate, 'days') != 1 ? `${today.diff(previousDate, 'days')} дня` : '1 день';
                    bot.execute('messages.send', {
                        random_id: 0,
                        peer_id: process.env.CHAT_ID,
                        message: `😩 Дежурство просрочено на ${lag} по ${!(kitchen.check || kvt.check) ? 'Кухне и КВТ' : (kitchen == true ? 'КВТ' : 'Кухне')}.
                                    🙏 ${!(kitchen.check || kvt.check) ? `${kitchen.duty} и ${kvt.duty}` : (kitchen.check ? kvt.duty : kitchen.duty)}, пожалуйста, подежурьте в ближайшее время и подтвердите завершение с помощью кнопки "Подтвердить дежурство".
                                    ✍🏻 Либо договоритесь подежурить за другого жильца в его смену взамен того, чтобы он(а) подежурил(а) за вас в ближайшее время.`,
                    });
                }
            }
        }

        if (currentRow != undefined) {
            let currentDate = moment(tableM3.rows[currentRow]['Период'], 'DD-MM-YY').endOf('day');
            
            if (currentDate.diff(today, 'days') == 6) {
                bot.execute('messages.send', {
                random_id: 0,
                peer_id: process.env.CHAT_ID,
                message: `🧹 В срок до ${currentDate.format('L')} дежурят по кухне - ${tableM3.rows[currentRow]['Кухня']}, по КВТ - ${tableM3.rows[currentRow]['КВТ']}. 
                            📅 Завершайте дежурство не раньше двух дней до окончания срока. 
                            🙏 Постарайтесь завершить уборку в срок.
                            ✔️ Подтвердите завершение дежурства с помощью кнопки "Подтвердить дежурство".
                            ✍️ Изменить текущих дежурных можно с помощью кнопки "Изменить текущих".`,
                });
            }
            
            if (currentDate.diff(today, 'days') == 2) {
                bot.execute('messages.send', {
                random_id: 0,
                peer_id: process.env.CHAT_ID,
                message: `🧹 Осталось два дня до завершения дежурства. Дежурят по кухне - ${tableM3.rows[currentRow]['Кухня']}, по КВТ - ${tableM3.rows[currentRow]['КВТ']}. 
                            🙏 Постарайтесь завершить уборку в срок.            
                            ✔️ Завтра можно будет подтвердить завершение дежурства с помощью кнопки "Подтвердить дежурство". 
                            ❗️ Если у вас не получается подежурить на этой неделе, договоритесь с кем-нибудь о замене и измените текущих дежурных с помощью кнопки "Изменить текущих".`,
                });
            }

            if (currentDate.diff(today, 'days') == 0) {
                let kitchen = tableM3.rows[currentRow]['Кухня'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[currentRow]['Кухня']};
                let kvt = tableM3.rows[currentRow]['КВТ'].includes('✔️') ? { check: true } : { check: false, duty: tableM3.rows[currentRow]['КВТ'] };
                
                if (!(kitchen.check && kvt.check)) {
                    bot.execute('messages.send', {
                    random_id: 0,
                    peer_id: process.env.CHAT_ID,
                    message: `🧹 Сегодня день завершения дежурства.
                                ⏳ Ещё не завершил(а)(и) дежурство ${!(kitchen.check || kvt.check) ? `${kitchen.duty} и ${kvt.duty}` : (kitchen.check ? kvt.duty : kitchen.duty)}.
                                🙏 Пожалуйста, постарайтесь сегодня закончить уборку.
                                ✔️ Если всё убрано, подтвердите дежурство с помощью кнопки "Подтвердить дежурство". 
                                ❗️ Если у вас не получается подежурить на этой неделе, договоритесь с кем-нибудь о замене и измените текущих дежурных с помощью кнопки "Изменить текущих".`,
                    });
                }
                
            }
        } else {
            bot.execute('messages.send', {
            random_id: 0,
            peer_id: process.env.CHAT_ID,
            message: `🆓 На текущий период дежурств не запланировано.
                        📝 Заполните график вручную, с помощью кнопки "Изменить текущих" или кнопки "Автозаполнение графика".`,
            });
        }
    } catch (error) {
        logger.error(error);
        return bot.execute('messages.send', {
            random_id: 0,
            peer_id: process.env.CHAT_ID,
            message: '❗В результате ежедневной проверки дежурных что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно.',
        });
    }
}

module.exports = { checkAndRemindDuties };