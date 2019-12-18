const Telegraf = require("telegraf");
const config = require("./config");
const Core = require("./lib/core");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/itop", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const bot = new Telegraf(config.telegramBotToken);
const core = new Core(bot);