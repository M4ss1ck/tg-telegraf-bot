import { Telegraf, Markup } from "telegraf";
import actions from "./components/actions/index.js";
import commands from "./components/commands/index.js";
import reputation from "./components/commands/reputation.js";
import filtros from "./components/commands/filtros.js";
// import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(actions).use(commands).use(reputation).use(filtros);

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  const response = [
    {
      title: `Tu porcentaje de ${query}`,
      description: `La efectividad está probada científicamente`,
      message_text: `Soy ${Math.floor(Math.random() * 100)}% ${query}`,
    },
    {
      title: `Probabilidad de que ${query}`,
      description: `La efectividad está probada científicamente`,
      message_text: `La probabilidad de que ${query} es de un ${Math.floor(
        Math.random() * 100
      )}%`,
    },
  ];
  const markup = Markup.inlineKeyboard([
    [
      Markup.button.switchToCurrentChat(
        "Probar otra vez",
        "fanático de este bot"
      ),
    ],
  ]);
  const recipes = response.map(({ title, description, message_text }) => ({
    type: "article",
    id: title,
    title: title,
    description: description,
    //thumb_url: thumbnail,
    input_message_content: {
      message_text: message_text,
    },
    ...markup,
  }));
  return await ctx
    .answerInlineQuery(recipes, { cache_time: 5, is_personal: true })
    .catch((e) => console.log("ERROR WITH INLINE QUERY\n", e));
});

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
  console.log("Chosen inline result:\n", chosenInlineResult);
});

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

// Urban Dictionary
// bot.command("ud", (ctx) => {
//   const query = ctx.message.text.substring(4);
//   const options = {
//     method: "GET",
//     url: "https://mashape-community-urban-dictionary.p.rapidapi.com/define",
//     params: { term: query },
//     headers: {
//       "x-rapidapi-host": "mashape-community-urban-dictionary.p.rapidapi.com",
//       "x-rapidapi-key": process.env.RAPIDAPI_KEY,
//     },
//   };
//   axios
//     .request(options)
//     .then((response) => {
//       const cantDef = response.data.list.length;
//       const data = response.data.list[0];
//       let def = data.definition;
//       let ejem = data.example;
//       let votos_positivos = data.thumbs_up;
//       let votos_negativos = data.thumbs_down;
//       // el tamaño máximo de un mensaje son 4096 caracteres
//       if (def.length > 2000) {
//         def = def.substring(0, 2000) + "...";
//       }
//       if (ejem.length > 2000) {
//         ejem = ejem.substring(0, 2000) + "...";
//       }

//       ctx.replyWithHTML(
//         `<b>${query}:</b>\n\n<em>Def.</em>: ${def}\n\n<em>Ex.: ${ejem}</em>\n\n👍: ${votos_positivos} 👎: ${votos_negativos}`
//       );
//       // .then((res) => {
//       //   //botonera
//       //   let botones = [[], []];
//       //   // quitar botón de la primera definición
//       //   if (cantDef > 1) {
//       //     for (let i = 1; i < cantDef; i++) {
//       //       const boton = [
//       //         bot.inlineButton(`Def ${i + 1}`, {
//       //           callback: `/ud1 ${i} ${res.message_id} ${term}`,
//       //         }),
//       //       ];

//       //       const fila = i <= cantDef / 2 ? 0 : 1;
//       //       botones[fila] = [].concat(...botones[fila], boton);
//       //     }
//       //     const replyMarkup = bot.inlineKeyboard(botones);
//       //     bot.editMessageReplyMarkup(
//       //       { chatId: id, messageId: res.message_id },
//       //       { replyMarkup }
//       //     );
//       //   }
//       // });
//     })
//     .catch((error) => console.error(error));
// });

// bot.command("love", async (ctx) => {
//   const now = new Date();
//   //console.log(now, loveTime, now - loveTime);
//   const time = "\nSiguiente pareja en " + timeToNext(now - loveTime);
//   if (now - loveTime > 1000 * 60 * 60 * 24) {
//     const query = "SELECT nick, tg_id FROM usuarios";
//     await anotherQuery(query).then((res) => {
//       const users = res.rows;
//       const i = Math.floor(Math.random() * users.length);
//       const j = Math.floor(Math.random() * users.length);
//       const lover1 = users[i];
//       const lover2 = users[j];
//       if (lover1.nick === lover2.nick) {
//         ctx.replyWithHTML(
//           `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> consigo mismo/a\n<em>${time}</em>`
//         );
//       } else {
//         ctx.replyWithHTML(
//           `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> 💘 <a href="tg://user?id=${lover2.tg_id}">${lover2.nick}</a>\n<em>${time}</em>`
//         );
//       }
//       loveTime = new Date();
//       couple = [lover1, lover2];
//     });
//   } else {
//     if (couple[0].nick === couple[1].nick) {
//       ctx.replyWithHTML(
//         `<b>Pareja del día:</b>\n\n<b>${couple[0].nick}</b> consigo mismo/a\n<em>${time}</em>`
//       );
//     } else {
//       ctx.replyWithHTML(
//         `<b>Pareja del día:</b>\n\n<b>${couple[0].nick}</b> 💘 <b>${couple[1].nick}</b>\n<em>${time}</em>`
//       );
//     }
//   }
// });

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
