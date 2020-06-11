require('dotenv').config()
const moment = require('moment-timezone');
moment.locale('ru');
moment.tz.setDefault('Europe/Moscow');
const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const { GoogleTable } = require('./spreadsheet');
const logger = require('./logger');


const changeDuties = new Scene('Change Duties',
    // step 0
    async ctx => {
        try {
            ctx.session.tableM3 = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
            await ctx.session.tableM3.getSheetRows(process.env.SHEET_INDEX);
        
            // проверяемя что таблица не пустая
            if (ctx.session.tableM3.rows[0] != undefined) { // если не пустая
                let today = moment();

                for (let i = ctx.session.tableM3.rows.length - 1; i >= 0; i--) {
                    let dateUp = moment(ctx.session.tableM3.rows[i]['Период'], 'DD-MM-YY').endOf('day');
                    let weekBefore = moment(ctx.session.tableM3.rows[i]['Период'], 'DD-MM-YY').subtract(6, 'days');
                    
                    if (today <= dateUp && today > weekBefore) {
                        ctx.session.currentRow = i;
                        ctx.scene.step = 2;
                        ctx.reply(`📅 В срок до ${dateUp.format('L')} дежурят по кухне - ${ctx.session.tableM3.rows[i]['Кухня'].replace(' ✔️', '')}, по КВТ - ${ctx.session.tableM3.rows[i]['КВТ'].replace(' ✔️', '')}. 
                                    
                                    📝 Чтобы изменить дежурных, введите: "имя_кухня имя_квт", где имя_кухня - имя дежурного по кухне, имя_квт - имя дежурного по коридору, ванне и туалету. 
                                    
                                    ❌ Либо нажмите "Отмена" для выхода из операции.`, null, Markup
                            .keyboard([Markup.button('Отмена', 'negative')])
                            .inline()
                        );
                        return;
                    } else if (today > dateUp || i == 0) {
                        ctx.scene.next();
                        ctx.reply(`🆓 На текущий период дежурств не запланировано. 
                        
                                    🧹 Последний раз дежурили по кухне - ${ctx.session.tableM3.rows[ctx.session.tableM3.rows.length - 1]['Кухня'].replace(' ✔️', '')}, по КВТ - ${ctx.session.tableM3.rows[ctx.session.tableM3.rows.length - 1]['КВТ'].replace(' ✔️', '')}. 
                                    
                                    📝 Чтобы заполнить график на ближайший период, введите: "имя_кухня имя_квт дд.мм.гг", где имя_кухня - имя дежурного по кухне, имя_квт - имя дежурного по коридору, ванне и туалету, дд.мм.гг - срок завершения дежурства. 
                                    
                                    ❌ Либо нажмите "Отмена" для выхода из операции.`, null, Markup
                            .keyboard([Markup.button('Отмена', 'negative')])
                            .inline()
                        );
                        return;
                    }
                }
            }
        } catch (error) {
            logger.error(error);
            ctx.scene.leave();
            return ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно, и попробуйте запустить команду занова.');
        }
        // если таблица пустая
        ctx.scene.next();
        ctx.reply(`📒 График дежурств пустой. 
        
                    📝 Чтобы заполнить график на ближайший период, введите: "имя_кухня имя_квт дд.мм.гг", где имя_кухня - имя дежурного по кухне, имя_квт - имя дежурного по коридору, ванне и туалету, дд.мм.гг - срок завершения дежурства. 
                    
                    ❌ Либо нажмите "Отмена" для отмены операции.`, null, Markup
            .keyboard([Markup.button('Отмена', 'negative')])
            .inline()
        );
    },
    // step 1, add.
    async ctx => {
        if (typeof ctx.message.payload !== 'undefined') {
            ctx.scene.leave();
            return ctx.reply('⚠ Вы отменили изменение дежурных.');
        }
        
        ctx.session.newRecord = ctx.message.text.split(' ');
        
        if (ctx.session.newRecord.length != 3) {
            return ctx.reply(`❗Вы ввели меньше или больше трёх слов через пробел. 
            
                                📝 Повторите ввод в формате "имя_кухня имя_квт дд.мм.гг" или нажмите "Отмена" для отмены операции.`, null, Markup
                    .keyboard([Markup.button('Отмена', 'negative')])
                    .inline()
            );
        }

        let newDutyDate = moment(ctx.session.newRecord[2], 'DD-MM-YY').endOf('day');

        if (newDutyDate.format('L') == 'Invalid date') {
            return ctx.reply(`❗Вы ввели неправильную дату. 
            
                                📝 Повторите ввод в формате "имя_кухня имя_квт дд.мм.гг" или нажмите "Отмена".`, null, Markup
                    .keyboard([Markup.button('Отмена', 'negative')])
                    .inline()
            );
        }

        if (newDutyDate < moment()) {
            return ctx.reply(`❗Вы ввели уже прошедшую дату. 
            
                                📝 Повторите ввод в формате "имя_кухня имя_квт дд.мм.гг" или нажмите "Отмена".`, null, Markup
                    .keyboard([Markup.button('Отмена', 'negative')])
                    .inline()
            );
        }

        if (newDutyDate > moment().add(7, 'days').endOf('day')) {
            return ctx.reply(`❗Вы ввели дату, опережающую сегодняшнюю больше, чем на неделю. 
            
                                📝 Повторите ввод в формате "имя_кухня имя_квт дд.мм.гг" или нажмите "Отмена".`, null, Markup
                    .keyboard([Markup.button('Отмена', 'negative')])
                    .inline()
            );
        }

        try {
            await ctx.session.tableM3.addRow({ Период: newDutyDate.format('L'), Кухня: ctx.session.newRecord[0], КВТ: ctx.session.newRecord[1] });
        } catch (error) {
            logger.error(error);
            ctx.scene.leave();
            return ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно, и попробуйте запустить команду заново.');
        }

        ctx.scene.leave();
        ctx.reply('✅ Новая запись на текущий период дежурств добавлена!');
    },
    // step 2, change.
    async ctx => {
        if (typeof ctx.message.payload !== 'undefined') {
            ctx.scene.leave();
            return ctx.reply('⚠ Вы отменили изменение дежурных.');
        }
        
        ctx.session.newRecord = ctx.message.text.split(' ');

        if (ctx.session.newRecord.length != 2) {
            return ctx.reply(`❗Вы ввели меньше или больше двух слов через пробел. 
                                
                                📝 Повторите ввод в формате "имя_кухня имя_квт" или нажмите "Отмена" для отмены операции.`, null, Markup
                    .keyboard([Markup.button('Отмена', 'negative')])
                    .inline()
            );
        }

        try {
            ctx.session.tableM3.rows[ctx.session.currentRow]['Кухня'] = ctx.session.newRecord[0];
            ctx.session.tableM3.rows[ctx.session.currentRow]['КВТ'] = ctx.session.newRecord[1];
            await ctx.session.tableM3.rows[ctx.session.currentRow].save();
        } catch (error) {
            logger.error(error);
            ctx.scene.leave();
            return ctx.reply('❗Что-то пошло не так с таблицей. Проверьте, что таблица заполнена правильно, и попробуйте запустить команду заново.');
        }

        ctx.scene.leave();
        ctx.reply('✅ Текущие дежурные изменены!');
    }
);


module.exports = { changeDuties };