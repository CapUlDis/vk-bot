require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const VkBot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const { getCurrentDuties } = require('./commands');
const { fillScheduleByLastDuties } = require('./commands');


const logger = require('./logger');
const expressPino = require('express-pino-logger');
const expressLogger = expressPino({ logger });

const app = express();
const bot = new VkBot({
    token: process.env.VK_TOKEN,
    confirmation: process.env.VK_CONFIRM
});

bot.command('/старт', ctx => {
    ctx.reply('Выбери раздел:', null, Markup
      .keyboard([
        [
          Markup.button('Дежурства', 'primary'),
          Markup.button('Раздельный', 'primary')
        ],
        [
          Markup.button('Банк', 'primary'),
          Markup.button('Предложения', 'primary')
        ]
      ])
    );
});

bot.command(/Дежурства/i, ctx => {
  try {
    ctx.reply('Выбери действие:', null, Markup
      .keyboard([
        Markup.button({
          action: {
            type: 'open_link',
            link: 'https://google.com',
            label: 'Open Google',
            payload: JSON.stringify({
              url: 'https://google.com',
            }),
          },
          color: 'default',
        }),
        // [
        //   Markup.button('Показать текущих', 'positive'),
        //   Markup.button('Изменить текущих', 'negative')
        // ],
        // [
        //   Markup.button('Автозаполнение графика'),
        // ],
        // Markup.button({
        //   action: {
        //     type: 'open_link',
        //     link: `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`,
        //     label: 'Открыть гугл-таблицу',
        //     payload: JSON.stringify({
        //       url: `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`,
        //     }),
        //   },
        //   color: 'default',
        // })
        // [
        //   Markup.button('Чек-лист кухни'),
        //   Markup.button('Чек-лист КВТ')
        // ]
      ])
    );
  } catch (error) {
    logger.error(error);
  }
});

bot.command(/Показать\sтекущих/i, getCurrentDuties);

bot.command(/Автозаполнение\sграфика/i, fillScheduleByLastDuties);

bot.command(/Тест/i, (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});


app.use(expressLogger);

app.use(bodyParser.json());

// app.post('/', bot.webhookCallback);

app.post('/', function (req, res) {
  logger.info(req.body);
  bot.webhookCallback(req, res);
  logger.info(res.body);
});

app.listen(process.env.PORT || 3000);
