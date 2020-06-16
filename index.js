require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const VkBot = require('node-vk-bot-api/lib');
const Markup = require('node-vk-bot-api/lib/markup');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const { getCurrentDuties } = require('./commands');
const { fillScheduleByLastDuties } = require('./commands');
const { changeDuties } = require('./scenes');


const logger = require('./logger');
const expressPino = require('express-pino-logger');
const expressLogger = expressPino({ logger });

const app = express();
const bot = new VkBot({
    token: process.env.VK_TOKEN,
    confirmation: process.env.VK_CONFIRM
});
const session = new Session();
const stage = new Stage(changeDuties);

bot.use(session.middleware());

bot.use(stage.middleware());

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

bot.command(/Тест+$/i, ctx => {
    ctx.reply('Ребята не стоит вскрывать эту тему. Вы молодые, шутливые, вам все легко. Это не то. Это не Чикатило и даже не архивы спецслужб. Сюда лучше не лезть. Серьезно, любой из вас будет жалеть. Лучше закройте тему и забудьте что тут писалось. Я вполне понимаю что данным сообщением вызову дополнительный интерес, но хочу сразу предостеречь пытливых - стоп. Остальные просто не найдут.');
});

bot.command(/Изменить текущих+$/i, ctx => {
  ctx.scene.enter('Change Duties');
});

bot.command(/Чек-лист кухни+$/i, ctx => {
  ctx.reply(`🍽 Кухня:

              1. Вымыть раковину с моющим средством.
              2. Вымыть сушилки-подставки для ложек и вилок.
              3. Убраться (чтобы все лежало аккуратно) на подоконнике и на полке над стиральной машиной.
              4. Убраться (протереть и аккуратно расставить) на полках - с чаем, специями.
              5. Холодильник вымыть внутри, снаружи и выкинуть гнилые продукты, следить, чтобы все хранилось аккуратно.
              6. Ту посуду, которую забывают помыть, мыть (это каждый день почти).
              7. Протирать поверхности, подоконник, стиральную машину (внутри мыть тоже).
              8. Убирать пространство под раковиной.
              9. Вымыть пол.
              10. Подметать пол, чтобы не было остатков еды.
              11. Следить за мусоркой, выставлять мусор к выходу.
              12. Вымыть мусорное ведро.
              13. Следить за наличием стирального порошка, кондиционера и Fairy.
              14. Вымыть микроволновку внутри.`);
});

bot.command(/Чек-лист КВТ+$/i, ctx => {
  ctx.reply(`🚪 Коридор:
            
            1. Привести в порядок полку с полотенцами и постельным бельем + стеллаж у ванны с сухой одеждой.
            2. Подметать пол, чтобы было аккуратно.
            3. Расставлять разбросанные ботинки.
            4. Протереть поверхности, тумбочку, зеркала.
            
            🛁 Ванная:
            
            1. Протереть поверхности: полочки, зеркало.
            2. Следить, чтобы ванная и раковина были чистые, без пыли и налета.
            3. Выкинуть и вымыть мусорное ведро.
            4. Вымыть пол.
            5. Помыть (с моющим средством) кафель.
            
            🚽 Туалет: 
            
            1. Вымыть унитаз, в том числе снизу, у основания.
            2. Следить за наличием туалетной бумаги.
            3. Вымыть пол (возможно, пару раз).`);
});

bot.on(ctx => {
  logger.info(ctx);
});

app.use(expressLogger);

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(process.env.PORT || 3000);
