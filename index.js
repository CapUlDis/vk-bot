require('dotenv').config()
const express = require('express');
const expressPino = require('express-pino-logger');
const bodyParser = require('body-parser');
const VKbot = require('node-vk-bot-api/lib');
const { GoogleTable } = require('./spreadsheet');
const stringTable = require('string-table');


const logger = require('./logger');
const expressLogger = expressPino({ logger });

const app = express();
const bot = new VKbot({
    token: process.env.VK_TOKEN,
    confirmation: process.env.VK_CONFIRM
});
const table_duty = new GoogleTable(process.env.SPREADSHEET_ID);


bot.command('бот?', (ctx) => {
    logger.info('Test logger KTO');
    ctx.reply('КТО?!');
});

// bot.command('дежурство', async (ctx) => {
//     try {
//         await table_duty.getDocInfo().then(() => {
//         let bot_ans = table_duty.sheet.title + '\n' + table_duty.sheet.headerValues.join(' ') + '\n';
//         for (i = 0; i <= 7; i++) {
//             bot_ans += `${table_duty.rows[i].Период} ${table_duty.rows[i].Кухня} ${table_duty.rows[i].КВТ}` + '\n';
//         }
//         ctx.reply(bot_ans);
//         })
//     } catch (error) {
//         ctx.reply('Ошибка: нет доступа к гугл таблице!')
//     }
// });

bot.command('дежурство', async (ctx) => {
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
        console.log(botAnswer);
        ctx.reply(botAnswer);
    } catch (error) {
        ctx.reply('Ошибка: нет доступа к гугл таблице!')
    }
})

bot.command('тест1', (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});

app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(process.env.PORT || 3000);

