require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const VkBot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const { getCurrentDuties } = require('./commands');


const logger = require('./logger');
const expressPino = require('express-pino-logger');
const expressLogger = expressPino({ logger });

const app = express();
const bot = new VkBot({
    token: process.env.VK_TOKEN,
    confirmation: process.env.VK_CONFIRM
});

bot.command('/старт', (ctx) => {
    ctx.reply('Выбери, что показать.', null, Markup
      .keyboard([
        'Текущие дежурные',
        'Тест',
      ]));
  });

bot.command(/Текущие\sдежурные/i, getCurrentDuties);

bot.command(/Тест/i, (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});


app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(process.env.PORT || 3000);
