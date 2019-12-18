const Telegraf = require("telegraf");
const Extra = require('telegraf/extra');

// const Markup = require('telegraf/markup');
const LocalSession = require('telegraf-session-local');

let priceArray = (quanVotes) => {
	for (var i = 0; i < quanVotes.length; i++) {
		quanVotes[i] = Math.pow(quanVotes[i],2);
	}
	return quanVotes;
}

class Core {
	/**
	 * @param {Telegraf} bot initialized telegraf bot.
	 */

	priceArray(quanVotes){
		for (var i = 0; i < quanVotes.length; i++) {
			quanVotes[i] = Math.pow(quanVotes,2);
		}
		return quanVotes;
	}

	constructor(bot) {
		if (bot !== undefined) this.bot = bot;
		else throw new Error("bot argument is not defiend");

		try {
			this.bootstrap();
		} catch (error) {
			throw new Error(error);
		}
	}

	async bootstrap() {
		await this.bot.launch();
		this.bot.telegram.getMe().then((botInfo) => {
			this.bot.options.username = botInfo.username
		});
		this.bot.on('channel_post', this.handleChannelPost);
		this.bot.on('callback_query', this.callbackQuery)
	}

	async handleChannelPost(ctx) {
		console.log(ctx);
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
			console.log("test", sendedPost);
			await ctx.pinChatMessage(sendedPost.message_id);
		}
	}

	async callbackQuery(ctx) {
		console.log(ctx.update);
		// return ctx.replyWithMarkdown(`[${ctx.update.callback_query.from.first_name}](tg://user?id=${ctx.update.callback_query.from.id})`);
		return ctx.replyWithHTML(`<a href="tg://user?id=${ctx.update.callback_query.from.id}"> ${ctx.update.callback_query.from.first_name ? ctx.update.callback_query.from.first_name : ''} ${ctx.update.callback_query.from.last_name ? ctx.update.callback_query.from.last_name : ''}</a> пожертвовал ${parseInt(ctx.update.callback_query.data)} 💎 на развитие проекта.`);
	}
}

module.exports = Core;
