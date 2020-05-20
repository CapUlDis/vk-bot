require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const VkBot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
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


bot.command(/Меню+$/i, ctx => {
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

bot.command(/Дежурства+$/i, ctx => {
  try {
    ctx.reply('Выбери действие:', null, Markup
      .keyboard([
        [
          Markup.button('Показать текущих', 'positive'),
          Markup.button('Изменить текущих', 'negative')
        ],
        [
          Markup.button('Автозаполнение графика'),
          Markup.button({
            action: {
              type: 'open_link',
              link: `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`,
              label: 'Открыть гугл-таблицу',
              payload: JSON.stringify({ url: `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}` })
            }
          }),
        ],
        [
          Markup.button('Чек-лист кухни'),
          Markup.button('Чек-лист КВТ'),
          Markup.button('Меню', 'primary'),
        ]
      ])
    );
  } catch (error) {
    logger.error(error);
  }
});

bot.command(/Показать\sтекущих+$/i, getCurrentDuties);

bot.command(/Автозаполнение\sграфика+$/i, fillScheduleByLastDuties);

bot.command(/Тест+$/i, (ctx) => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});

const scene = new Scene('changeDuties',
  ctx => {
    // logger.info(ctx.scene.step);
    ctx.scene.next();
    ctx.reply(`Введите имена дежурных по Кухне и КВТ через пробел. Например: "Саша Маша". Подразумевается, что Саша дежурит по Кухне, а Маша по КВТ.`);
  },
  ctx => {
    // ctx.session.newDuties = ctx.message.text.split(' ');
    // if (ctx.session.newDuties.length != 2) {
    //   // return ctx.reply(`Слов через пробел больше или меньше двух.`);
    //   // logger.info(ctx.scene.step);
    //   // ctx.scene.next();
    //   return ctx.scene.step = 2;
    // }
    // ctx.reply(`Успех!`)
    // ctx.scene.leave();
    ctx.session.num = +ctx.message.text;
    ctx.reply(ctx.session.num);
    if (ctx.session.num == 2) {
      ctx.scene.enter('changeDuties', 2);
      
    } else if (ctx.session.num == 3) {
      ctx.scene.step = 3;
    } else if (ctx.session.num == 4) {
      ctx.scene.step = 4;
    } else {
      ctx.scene.next();
      ctx.reply('Здесь!');
    }
  },
  ctx => {
    ctx.reply('2 Here!');
    ctx.scene.leave();
  },
  ctx => {
    ctx.reply('3 Here!');
    ctx.scene.leave();
  },
  ctx => {
    ctx.reply('4 Here!');
    ctx.scene.leave();
  },
);
const session = new Session();
const stage = new Stage(scene);

bot.use(session.middleware());
bot.use(stage.middleware());

bot.command(/Изменить текущих+$/i, (ctx) => {
  ctx.scene.enter('changeDuties');
});


app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(process.env.PORT || 3000);
