require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const VKbot = require('node-vk-bot-api/lib');
const PORT = process.env.PORT || 3000
const { GoogleTable } = require('./spreadsheet');
const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({ 
    level: process.env.LOV_LEVEL || 'info',
    prettyPrint: { colorize: true }
});
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

bot.command('дежурство', (ctx) => {
    table_duty.getDocInfo().then(() => {
        let bot_ans = table_duty.sheet.title + '\n' + table_duty.sheet.headerValues.join(' ') + '\n';
        for (i = 0; i <= 7; i++) {
            bot_ans += `${table_duty.rows[i].Период} ${table_duty.rows[i].Кухня} ${table_duty.rows[i].КВТ}` + '\n';
        }
        ctx.reply(bot_ans);
    })
});

bot.command('тест1', (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});

app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(PORT);


module.exports = logger;