const express = require('express')
const bodyParser = require('body-parser')
const {Botact} = require('node-vk-bot-api')

const app = express()
const bot = new Botact({
    token: 'd4b54aac31841a8c5e570bd193bf624fc50fda63fe890d83041d5491b70d64d84b50b974de9a245c116c5',
    confirmation: '7d990e40'
})

bot.on(function (ctx) {
    console.log(ctx.body)

    ctx.reply(ctx.body)
})

bot.command('start', function (ctx) {
    ctx.reply('Вы успешно стартовали!')
})

bot.command('время', function (ctx) {
    const date = new Date()

    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()

    const time = 'Сейчас ' + h + ':' + m + ':' + s

    ctx.reply(time)
})

app.use(bodyParser.json())

app.post('/', bot.listen)

app.listen(80)