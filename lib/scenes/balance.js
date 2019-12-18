const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage;

// Greeter scene
const greeter = new Scene('adminreg')
greeter.enter((ctx) => ctx.reply('Hi'))
greeter.leave((ctx) => ctx.reply('Bye'))
greeter.hears(/hi/gi, leave())
greeter.on('message', (ctx) => ctx.reply('Send `hi`'))

const stage = new Stage()
stage.command('cancel', leave())
stage.register(greeter)

