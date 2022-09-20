import { Telegraf, Markup } from "telegraf";
import actions from "./components/actions/index.js";
import commands from "./components/commands/index.js";
import reputation from "./components/commands/reputation.js";
import filtros from "./components/commands/filtros.js";
import urban from "./components/commands/ud.js";
import love from "./components/commands/love.js";
import inline from "./components/inline/inline.js";
// import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot
  .use(actions)
  .use(commands)
  .use(reputation)
  .use(urban)
  .use(love)
  .use(inline)
  .use(filtros);

bot.hears(/^\/(s|s@\w+)(\/)?$/i, (ctx) =>
  ctx.replyWithHTML(
    `Debe escoger qué parte del mensaje desea reemplazar y con qué desea hacerlo.\nPor ejemplo, si tenemos un mensaje que diga "Eres feo" y queremos transformarlo en "Eres hermoso", debemos usar <code>/s/feo/hermoso</code> respondiendo dicho mensaje.\n\n<b>Nota:</b> Si el bot es administrador, borrará nuestro mensaje`,
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
);

bot.hears(/^\/(s|s@\w+)\/(.+)?\/(.+)?/i, (ctx) => {
  let [, , search, replace] = ctx.match;
  replace = replace ?? "";
  console.log(search, replace);
  let text = "";
  if (ctx.message.reply_to_message) {
    let msg =
      ctx.message.reply_to_message.text ?? ctx.message.reply_to_message.caption;
    msg = msg.replace('En realidad quisiste decir: \n\n"', "");
    text =
      '<b>En realidad quisiste decir:</b> \n\n"' +
      msg.replace(new RegExp(search, "g"), replace) +
      '"';
    ctx
      .replyWithHTML(text, {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      })
      .then(() => {
        ctx.deleteMessage().catch(() => {
          console.log("No se pudo borrar el mensaje");
          const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback("Borrar", "del")],
          ]);
          ctx.replyWithHTML("No pude borrar el mensaje", keyboard);
        });
      });
  } else {
    ctx.reply("Debes responder un mensaje o de lo contrario no funcionará", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.on("poll_answer", async (ctx) => {
  const id = ctx.pollAnswer.poll_id;
  const encuesta = encuestas.find((element) => element.id === id);
  if (encuesta !== undefined) {
    const user = ctx.pollAnswer.user.first_name;
    const option = ctx.pollAnswer.option_ids[0];
    const option_text = encuesta.options[option];
    const text =
      option === undefined
        ? user +
          " retractó su voto en la encuesta <b>" +
          encuesta.question +
          "</b>"
        : user +
          " votó por la opción <b>" +
          option_text +
          "</b> en la encuesta <b>" +
          encuesta.question +
          "</b>";

    await bot.telegram.sendMessage(encuesta.chat, text, { parse_mode: "HTML" });
  }
});

// Iniciar bot
bot.launch();
console.log("BOT INICIADO");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
