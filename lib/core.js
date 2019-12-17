const Telegraf = require("telegraf");

class Core{
	/**
	 * @param {Telegraf} bot initialized telegraf bot.
	 */
	constructor(bot){
		if(bot !== undefined) this.bot = bot;
		else throw new Error("bot argument is not defiend");

		try {
			this.bootstrap();
		} catch (error) {
			throw new Error(error);
		}
	}
	async bootstrap(){
		await this.bot.launch();
	}
}

module.exports = Core;