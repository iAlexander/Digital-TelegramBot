const Telegraf = require("telegraf");
const Extra = require('telegraf/extra');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const User = require("./models/user");
const {
	leave
} = Stage;
let votes = [];
let priceArray = (quanVotes) => {
	for (var i = 0; i < quanVotes.length; i++) {
		quanVotes[i] = Math.pow(quanVotes[i], 2);
	}
	return quanVotes[0];
};
// const Markup = require('telegraf/markup');

class Core {
	/**
	 * @param {Telegraf} bot initialized telegraf bot.
	 */



	constructor(bot) {
		this.scenes = require("./scenes");
		if (bot !== undefined) this.bot = bot;
		else throw new Error("bot argument is not defiend");

		try {
			this.bootstrap();
		} catch (error) {
			throw new Error(error);
		}
	}

	async bootstrap() {
		this.bot.use(session());
		this.bot.use(this.scenes.middleware());
		global.bot = this.bot;
		this.bot.telegram.getMe().then((botInfo) => {
			this.bot.options.username = botInfo.username
		});
		this.bot.on('channel_post', this.handleChannelPost);
		this.bot.on('callback_query', this.callbackQuery);
		this.bot.command('start', (ctx) => ctx.scene.enter('register'));
		await this.bot.startPolling();
	}

	async handleChannelPost(ctx) {
		// console.log(ctx);
		if (ctx.update.channel_post.message_id && !ctx.update.channel_post.photo && ctx.update.channel_post.text !== "") await ctx.deleteMessage(ctx.update.channel_post.message_id);
		if (!ctx.update.channel_post.pinned_message && !ctx.update.channel_post.photo && ctx.update.channel_post.text !== "") {
			const sendedPost = await ctx.reply(ctx.update.channel_post.text, Extra.HTML().markup((m) =>
				m.inlineKeyboard([
					m.callbackButton('1💎', 1),
					m.callbackButton('2💎', 2),
					m.callbackButton('3💎', 3),
					m.callbackButton('4💎', 4),
					m.callbackButton('5💎', 5),
				], {
					columns: 2,
					rows: 3
				})));
			await ctx.pinChatMessage(sendedPost.message_id);
		}
	}

	async callbackQuery(ctx) {
		const {from} = ctx.update.callback_query.message;
		console.log(ctx.update.callback_query.message.chat.type, from);
		let vm = this;
		if(ctx.update.callback_query.message.chat.type === "private") {
			// return ctx.scene.enter("register");
		} else {
			let amount = parseInt(ctx.update.callback_query.data);
			let id = ctx.update.callback_query.from.id;
			console.log(amount, id);
			try {
				let userSearchResult = await User.findOne({id});
				console.log(votes, Math.pow(amount, 2));
				userSearchResult.balance = userSearchResult.balance - Math.pow(amount, 2);
				if(userSearchResult.balance >= 0) userSearchResult.save().then(()=>bot.telegram.sendMessage(userSearchResult.chat_id, "Теперь ваш баланс: "+ userSearchResult.balance + "💎"));
			} catch (e) {}

		}
		// return ctx.replyWithMarkdown(`[${ctx.update.callback_query.from.first_name}](tg://user?id=${ctx.update.callback_query.from.id})`);
		// if (ctx.update.callback_query !== undefined) return ctx.replyWithHTML(`<a href="tg://user?id=${ctx.update.callback_query.from.id}"> ${ctx.update.callback_query.from.first_name ? ctx.update.callback_query.from.first_name : ''} ${ctx.update.callback_query.from.last_name ? ctx.update.callback_query.from.last_name : ''}</a> пожертвовал ${parseInt(ctx.update.callback_query.data)} 💎 на развитие проекта.`);

	}
}

module.exports = Core;