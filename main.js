const express = require('express');
const bodyParser = require('body-parser');
const VKbot = require('node-vk-bot-api/lib');
const { GoogleTable } = require('./spreadsheet');


const app = express();
const bot = new VKbot({
    token: 'd4b54aac31841a8c5e570bd193bf624fc50fda63fe890d83041d5491b70d64d84b50b974de9a245c116c5',
    confirmation: '7d990e40'
});
const table_duty = new GoogleTable('1_Wah-_jNWevQMYtXKCv9Zog3isPT2xzxzdkgm-0qLUo');



bot.command('бот?', (ctx) => {
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

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(100);
