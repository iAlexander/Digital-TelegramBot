const Telegraf = require("telegraf");
const Extra = require('telegraf/extra');
// const Markup = require('telegraf/markup');
const LocalSession = require('telegraf-session-local');

class Core {
	/**
	 * @param {Telegraf} bot initialized telegraf bot.
	 */

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
		// this.bot.use((new LocalSession({ database: 'db.json' })).middleware())
		await this.bot.launch();
		this.bot.telegram.getMe().then((botInfo) => {
			this.bot.options.username = botInfo.username
		});
		this.bot.on('channel_post', this.handleChannelPost);
		this.bot.on('callback_query', this.callbackQuery)
	}

	async handleChannelPost(ctx) {
		console.log(ctx);
		if (ctx.update.channel_post.message_id) await ctx.deleteMessage(ctx.update.channel_post.message_id);
		if (!ctx.update.channel_post.pinned_message && !ctx.update.channel_post.photo && ctx.update.channel_post.text !== "") {
			const sendedPost = await ctx.reply(ctx.update.channel_post.text, Extra.HTML().markup((m) =>
				m.inlineKeyboard([
					m.callbackButton('💎', 1),
					m.callbackButton('💎💎', 2),
					m.callbackButton('💎💎💎', 3),
					m.callbackButton('💎💎💎💎', 4),
				], {
					columns: 2,
					rows: 2
				})));
			console.log("test", sendedPost);
			await ctx.pinChatMessage(sendedPost.message_id);
		}
	}
	async callbackQuery(ctx) {
		// return ctx.replyWithMarkdown(`[${ctx.update.callback_query.from.first_name}](tg://user?id=${ctx.update.callback_query.from.id})`);
		return ctx.replyWithHTML(`<a href="tg://user?id=${ctx.update.callback_query.from.id}"> ${ctx.update.callback_query.from.first_name ? ctx.update.callback_query.from.first_name : ''} ${ctx.update.callback_query.from.last_name ? ctx.update.callback_query.from.last_name : ''} задонатил ${"💎".repeat(parseInt(ctx.update.callback_query.data))} </a>`);
	}
}

module.exports = Core;