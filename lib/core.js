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
		this.bot.on('message', this.handleMessage);
		this.bot.on('callback_query', this.callbackQuery)
	}

	async handleMessage(ctx) {
		return ctx.reply(ctx.update.message.text, Extra.HTML().markup((m) =>
			m.inlineKeyboard([
				m.callbackButton('💎', 1),
				m.callbackButton('💎💎', 2),
				m.callbackButton('💎💎💎', 3),
				m.callbackButton('💎💎💎💎', 4),
			], {
				columns: 2,
				rows: 2
			})));
	}
	async callbackQuery(ctx) {
		return ctx.reply(ctx.update.callback_query.data);
	}
}

module.exports = Core;