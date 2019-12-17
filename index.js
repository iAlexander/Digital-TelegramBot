const Telegraf = require("telegraf");
const config = require("./config");
const Core = require("./lib/core");

const bot = new Telegraf(config.telegramBotToken);
const core = new Core(bot);