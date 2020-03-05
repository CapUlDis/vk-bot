const express = require('express');
const bodyParser = require('body-parser');
const VKbot = require('node-vk-bot-api/lib');

const app = express();
const bot = new VKbot({
    token: 'd4b54aac31841a8c5e570bd193bf624fc50fda63fe890d83041d5491b70d64d84b50b974de9a245c116c5',
    confirmation: '7d990e40'
});

// bot.on((ctx) => {
//     console.log(ctx.body);
//     ctx.reply('assert');
// });

bot.command('бот?', (ctx) => {
    ctx.reply('КТО?!');
});

bot.startPolling();

app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(80);