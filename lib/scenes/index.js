const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Extra = require('telegraf/extra');
const User = require("../models/user");

const {
	leave
} = Stage;

const stage = new Stage();

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
		if (searchResult.isAdmin === true) menu.push(m.callbackButton('Создать кампанию', "add"));
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
		/*

			Введите краткое описание кампании?		[свободное поле]

			Когда стартует кампания?				[сегодня, завтра]

			Сколько она продлиться?					[день, неделя, месяц]

			Хотите добавить проект сейчас?			[да, нет -----> хотите добавить проект позже? [Добавить проект]]

			сколько нужно собрать на реализацию?	[свободное поле]

			отправьте полное описание проекта		[свободное поле, возможно фото]

			ВЫ УВЕРЕННЫ 							[подтвердить, изменить]


		*/
		// await ctx.replyWithHTML("<b>Кампания создаеться автоматически как только вы добавите бота в канал, (Боту нужны права администратора!).</b>");
		// const botInfo = await bot.telegram.getMe();
		// await ctx.replyWithHTML(`<a href='https://telegram.me/${botInfo.username}?startgroup=true'> Добавить бота </a>`)
		await ctx.scene.enter("createCompany");
	}
});


const registerScene = new Scene('register')
registerScene.enter(async (ctx) => {
	console.log("enter register");
	console.log(ctx.update);
	const {
		from
	} = (ctx.message || ctx.update.callback_query.message);

	let searchResult = await User.findOne({
		id: from.id
	});
	global.gotoMain = async () => {
		return await ctx.scene.enter("main");
	};
	if (searchResult && searchResult.id == from.id) {
		console.log(searchResult, searchResult.id, from.id, searchResult.id == from.id);
		await leave();
		await ctx.scene.enter("main");

	} else {
		await ctx.reply("Привет!");
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

	const {
		scene
	} = ctx;

	let user = new User({
		id: from.id,
		first_name: from.first_name,
		last_name: from.last_name,
		chat_id: ctx.update.callback_query.message.chat.id,
		isAdmin: ctx.update.callback_query.data === "admin" ? true : false
	});
	await user.save();
	await global.gotoMain();
});

/**
 * @description Костыль на костыле, знаю, но что блять поделать! Работает и заебись!
 */

const company = new Scene("createCompany");

let actionIndex = 0;

let actions = [
	(ctx) => {
		ctx.reply('Введите краткое описание кампании?');
	},
	(ctx) => {
		ctx.reply('Когда стартует кампания?', Extra.HTML().markup((m) => {
			return m.inlineKeyboard([m.callbackButton("сегодня", "next"), m.callbackButton("завтра", "next")], {
				columns: 1
			})
		}));
	},
	(ctx) => {
		ctx.reply('Сколько она продлиться?', Extra.HTML().markup((m) => {
			return m.inlineKeyboard([m.callbackButton("день", "next"), m.callbackButton("неделя", "next"), m.callbackButton("месяц", "next")], {
				columns: 1
			})
		}));
	},
	(ctx) => {
		ctx.reply('Хотите добавить проект сейчас', Extra.HTML().markup((m) => {
			return m.inlineKeyboard([m.callbackButton("нет", "next"), m.callbackButton("да", "next")], {
				columns: 2
			})
		}));
	},
	(ctx) => {
		ctx.reply('Сколько нужно собрать на реализацию проекта?');
	},
	(ctx) => {
		ctx.reply('Отправьте полное описание проекта, которое увидит пользователь?');
	},
	(ctx) => {
		global.fuckingpeaceofshitKOSTIL = ctx.update.message.text;
		ctx.reply('Вы уверены что хотите опубликовать проект?', Extra.HTML().markup((m) => {
			return m.inlineKeyboard([m.callbackButton("нет", "next"), m.callbackButton("да", "next")], {
				columns: 2
			})
		}));
	},
	(ctx) => {
		const extra = Extra.HTML().markup((m) =>
			m.inlineKeyboard([
				m.callbackButton('1💎', 1),
				m.callbackButton('2💎', 2),
				m.callbackButton('3💎', 3),
				m.callbackButton('4💎', 4),
				m.callbackButton('5💎', 5),
			], {
				columns: 2,
				rows: 3
			}))

		extra.caption = global.fuckingpeaceofshitKOSTIL;

		ctx.telegram.sendPhoto(-1001408238191, 'https://i.pinimg.com/originals/d0/f3/ab/d0f3ab3644b7121f923dbb12abc90f82.jpg', extra);
	}

];

let performAction = (ctx) => {
	let out = actions[actionIndex];
	actionIndex = actionIndex + 1;
	if (out === undefined) leave();
	else return out(ctx);
}

company.enter(performAction);

company.on('message', performAction);

company.on('callback_query', performAction);

company.leave((ctx) => {
	return ctx.scene.enter("main");
})

stage.register(main);
stage.register(registerScene);
stage.register(company);

module.exports = stage;