import { Telegraf, Markup } from "telegraf";
import actions from "./components/actions/index.js";
import commands from "./components/commands/index.js";
import reputation from "./components/commands/reputation.js";
import filtros from "./components/commands/filtros.js";
import urban from "./components/commands/ud.js";
import love from "./components/commands/love.js";
import inline from "./components/inline/inline.js";
import replacer from "./components/commands/replace.js";
import polls from "./components/commands/polls.js";
import admin from "./components/commands/admin.js";
// import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot
  .use(admin)
  .use(actions)
  .use(commands)
  .use(reputation)
  .use(urban)
  .use(love)
  .use(inline)
  .use(replacer)
  .use(polls)
  .use(filtros);

// Iniciar bot
bot.launch();
console.log("BOT INICIADO");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
