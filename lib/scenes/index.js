const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Extra = require('telegraf/extra');
const User = require("../models/user");

const {
	leave
} = Stage;

const registerScene = new Scene('register')
registerScene.enter(async (ctx) => {
	await ctx.reply("Привет!");
	console.log(ctx.update);
	const {
		from
	} = (ctx.message || ctx.update.callback_query.message);

	let searchResult = await User.findOne({
		id: from.id
	});

	if (searchResult && searchResult.id == from.id) {
		await leave();
		await ctx.scene.enter("main");
	} else {
		await ctx.reply("Ты Администратор Канала или Обычный пользователь?", Extra.HTML().markup((m) =>
			m.inlineKeyboard([
				m.callbackButton('Администратор', "admin"),
				m.callbackButton('Обычный пользователь', "user"),
			], {
				columns: 1
			})))
	}
});

registerScene.on('callback_query', async (ctx) => {
	console.log(ctx.update);
	const {
		from
	} = ctx.update.callback_query;

	const ctxVM = ctx;

	let user = new User({
		id: from.id,
		first_name: from.first_name,
		last_name: from.last_name,
  parse_mode: 'HTML',

		isAdmin: ctx.update.callback_query.data === "admin" ? true : false
	});

	try {
		await user.save();
		// await ctx.scene.reset();
	} catch (error) {
		throw new Error(error);
	}
});

const main = new Scene('main');
main.enter(async (ctx) => {
	let menu = [];
	let ctxVM = ctx;
	const {
		from
	} = ctx.update.message;
	console.log(ctx.update);
	const searchResult = await User.findOne({
		id: from.id
	});
	console.log(searchResult);
	ctx.reply('Главное меню', Extra.HTML().markup((m) => {
		if (searchResult.isAdmin === true) menu.push(m.callbackButton('Создать Компанию', "add"));
		return m.inlineKeyboard([...menu, m.callbackButton("Баланс", "balance")], {
			columns: 1
		})
	}))
});

main.on('callback_query', async (ctx) => {
	const {
		from
	} = ctx.update.callback_query;
	const searchResult = await User.findOne({
		id: from.id
	});
	if (ctx.update.callback_query.data === "balance") return ctx.replyWithHTML("<b>Баланс:</b> <code>" + searchResult.balance + "💎</code>");
	if (ctx.update.callback_query.data === "add") {
		await ctx.replyWithHTML("<b>Компания создаеться автоматически как только вы добавите бота в канал, (Боту нужны права администратора!).</b>");
		const botInfo = await bot.telegram.getMe();
		await ctx.replyWithHTML(`<a href='https://telegram.me/${botInfo.username}?startgroup=true'> Добавить бота </a>`)
	}
});

const stage = new Stage();
stage.register(main);
stage.register(registerScene);

module.exports = stage;