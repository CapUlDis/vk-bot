require('dotenv').config()
const express = require('express');
const expressPino = require('express-pino-logger');
const bodyParser = require('body-parser');
const VKbot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const { GoogleTable } = require('./spreadsheet');
const stringTable = require('string-table');


const moment = require('moment');
moment.locale('ru');

const logger = require('./logger');
const expressLogger = expressPino({ logger });

const app = express();
const bot = new VKbot({
    token: process.env.VK_TOKEN,
    confirmation: process.env.VK_CONFIRM
});
const table_duty = new GoogleTable(process.env.SPREADSHEET_ID);


bot.command('/старт', (ctx) => {
    ctx.reply('Выбери, что показать.', null, Markup
      .keyboard([
        'Текущие дежурные',
        'Весь график',
      ]));
  });

bot.command('бот?', (ctx) => {
    logger.info('Test logger KTO');
    ctx.reply('КТО?!');
});

bot.command('Весь график', async (ctx) => {
    try {
        await table_duty.getDocInfo();
        let tableArray = new Array;
        for (i = 0; i < table_duty.rows.length; i++) {
            let rowObj = {};
            for (j = 0; j < table_duty.sheet.headerValues.length; j++) {
                rowObj[table_duty.sheet.headerValues[j]] = table_duty.rows[i][table_duty.sheet.headerValues[j]]
            }
            tableArray.push(rowObj);
        }
        let botAnswer = stringTable.create(tableArray);
        ctx.reply(botAnswer);
    } catch (error) {
        logger.error(error);
        ctx.reply('Ошибка: нет доступа к гугл таблице!')
    }
})

bot.command('Текущие дежурные', async (ctx) => {
    try {
        await table_duty.getDocInfo();
        if (table_duty.rows[0] != undefined) {
            let today = moment();
            for (let i = table_duty.rows.length - 1; i >= 0; i--) {
                let dateUp = moment(table_duty.rows[i]['Период'], 'DD-MM-YY');
                let weekBefore = moment(table_duty.rows[i]['Период'], 'DD-MM-YY').subtract(7, 'days');
                if (today <= dateUp && today > weekBefore) {
                    ctx.reply(`В срок до ${dateUp.format('L')} дежурят по кухне - ${table_duty.rows[i]['Кухня']}, по КВТ - ${table_duty.rows[i]['КВТ']}`);
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
})

bot.command(/test\s2/, (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});

app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(process.env.PORT || 3000);

