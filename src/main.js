import { Telegraf, Markup } from "telegraf";
import actions from "./components/actions/index.js";
import commands from "./components/commands/index.js";
import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(actions);
bot.use(commands);

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
bot.command("ud", (ctx) => {
  const query = ctx.message.text.substring(4);
  const options = {
    method: "GET",
    url: "https://mashape-community-urban-dictionary.p.rapidapi.com/define",
    params: { term: query },
    headers: {
      "x-rapidapi-host": "mashape-community-urban-dictionary.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    },
  };
  axios
    .request(options)
    .then((response) => {
      const cantDef = response.data.list.length;
      const data = response.data.list[0];
      let def = data.definition;
      let ejem = data.example;
      let votos_positivos = data.thumbs_up;
      let votos_negativos = data.thumbs_down;
      // el tamaño máximo de un mensaje son 4096 caracteres
      if (def.length > 2000) {
        def = def.substring(0, 2000) + "...";
      }
      if (ejem.length > 2000) {
        ejem = ejem.substring(0, 2000) + "...";
      }

      ctx.replyWithHTML(
        `<b>${query}:</b>\n\n<em>Def.</em>: ${def}\n\n<em>Ex.: ${ejem}</em>\n\n👍: ${votos_positivos} 👎: ${votos_negativos}`
      );
      // .then((res) => {
      //   //botonera
      //   let botones = [[], []];
      //   // quitar botón de la primera definición
      //   if (cantDef > 1) {
      //     for (let i = 1; i < cantDef; i++) {
      //       const boton = [
      //         bot.inlineButton(`Def ${i + 1}`, {
      //           callback: `/ud1 ${i} ${res.message_id} ${term}`,
      //         }),
      //       ];

      //       const fila = i <= cantDef / 2 ? 0 : 1;
      //       botones[fila] = [].concat(...botones[fila], boton);
      //     }
      //     const replyMarkup = bot.inlineKeyboard(botones);
      //     bot.editMessageReplyMarkup(
      //       { chatId: id, messageId: res.message_id },
      //       { replyMarkup }
      //     );
      //   }
      // });
    })
    .catch((error) => console.error(error));
});

// reputacion

// bot.hears(/^\++$/, async (ctx) => {
//   if (ctx.message.reply_to_message) {
//     //id del remitente
//     const from_id = ctx.message.from.id;
//     //extraer nick y rep del remitente
//     query(
//       `SELECT rep, nick FROM usuarios WHERE tg_id = '${from_id}'`,
//       [],
//       async (err, res) => {
//         if (err) {
//           console.log("[ERROR SELECTING] weird af");
//           console.log(err.stack);
//         } else {
//           // inicializar rep y nick del usuario
//           let from_rep = 0;
//           let from_nick = ctx.message.from.first_name;
//           let from_rango = setRango(from_rep);
//           // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//           if (res.rows[0] === undefined) {
//             const values = [
//               from_id,
//               from_rep,
//               new Date(),
//               from_nick,
//               from_rango,
//             ];
//             await anotherQuery(
//               "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
//               values
//             );
//           } else {
//             // si todo va bien, tomo los valores
//             from_rep = res.rows[0].rep;
//             from_nick = res.rows[0].nick;
//             from_rango = setRango(from_rep);
//             // en caso de que el usuario no tenga rango
//             if (res.rows[0].rango === null) {
//               updateUserStat(from_id, "rango", from_rango);
//             }
//           }

//           //farmeo de puntos
//           if (
//             ctx.message.reply_to_message.from.id === from_id &&
//             from_id !== parseInt(my_id)
//           ) {
//             //responder a uno mismo
//             return ctx.replyWithHTML(
//               `<a href="tg://user?id=${from_id}">[${adornarRango(
//                 from_rango
//               )}] ${from_nick}</a> ha intentado hacer trampas... \n<em>qué idiota</em>`,
//               { parseMode: "html" }
//             );
//           } else {
//             // aquí va el manejo de la reputación
//             const reply_id = ctx.message.reply_to_message.from.id;

//             //buscando al que sube la reputación en la BD
//             query(
//               `SELECT rep, nick, rango FROM usuarios WHERE tg_id = '${reply_id}'`,
//               [],
//               async (err, res) => {
//                 if (err) {
//                   console.log("[ERROR SELECTING] weird af");
//                   console.log(err.stack);
//                 } else {
//                   // inicializar rep y nick del otro usuario
//                   let reply_rep = 1;
//                   let reply_nick = ctx.message.reply_to_message.from.first_name;
//                   let reply_rango = setRango(reply_rep);
//                   // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//                   if (res.rows[0] === undefined) {
//                     const values = [
//                       reply_id,
//                       reply_rep,
//                       new Date(),
//                       reply_nick,
//                       reply_rango,
//                     ];

//                     await anotherQuery(
//                       "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
//                       values
//                     );
//                   } else {
//                     // si todo va bien, tomo los valores
//                     reply_rep = res.rows[0].rep;
//                     reply_nick = res.rows[0].nick;
//                     reply_rango = setRango(reply_rep + 1);
//                     // en caso de que el usuario no tenga rango
//                     if (res.rows[0].rango === null) {
//                       updateUserStat(reply_id, "rango", reply_rango);
//                     }
//                   }

//                   query(
//                     `UPDATE usuarios SET rep = rep + 1, rango = '${setRango(
//                       reply_rep + 1
//                     )}', fecha = now() WHERE tg_id = '${reply_id}' RETURNING *`,
//                     [],
//                     (err, res) => {
//                       if (err) {
//                         console.log("[ERROR UPDATING]");
//                         console.log(err.stack);
//                       } else {
//                         console.log(
//                           "[rep y rango actualizados][mensaje respondido]"
//                         );
//                         reply_rango = res.rows[0].rango;
//                       }
//                     }
//                   );

//                   console.log(
//                     `[${adornarRango(reply_rango)}] ${reply_nick} tiene ${
//                       reply_rep + 1
//                     } puntos de reputación ahora, cortesía de [${adornarRango(
//                       from_rango
//                     )}] ${from_nick} (rep: ${from_rep})`
//                   );
//                   ctx.replyWithHTML(
//                     `<a href="tg://user?id=${reply_id}">[${adornarRango(
//                       reply_rango
//                     )}] ${reply_nick}</a> tiene ${
//                       reply_rep + 1
//                     } puntos de reputación ahora, cortesía de <a href="tg://user?id=${from_id}">[${adornarRango(
//                       from_rango
//                     )}] ${from_nick}</a>`
//                   );
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   }
// });

// bot.hears(/^(\-|—)+$/, async (ctx) => {
//   if (ctx.message.reply_to_message) {
//     //id del remitente
//     const from_id = ctx.message.from.id;
//     //extraer nick y rep del remitente
//     query(
//       `SELECT rep, nick FROM usuarios WHERE tg_id = '${from_id}'`,
//       [],
//       async (err, res) => {
//         if (err) {
//           console.log("[ERROR SELECTING] weird af");
//           console.log(err.stack);
//         } else {
//           // inicializar rep y nick del usuario
//           let from_rep = 0;
//           let from_nick = ctx.message.from.first_name;
//           let from_rango = setRango(from_rep);
//           // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//           if (res.rows[0] === undefined) {
//             const values = [
//               from_id,
//               from_rep,
//               new Date(),
//               from_nick,
//               from_rango,
//             ];
//             await anotherQuery(
//               "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
//               values
//             );
//           } else {
//             // si todo va bien, tomo los valores
//             from_rep = res.rows[0].rep;
//             from_nick = res.rows[0].nick;
//             from_rango = setRango(from_rep);
//             // en caso de que el usuario no tenga rango
//             if (res.rows[0].rango === null) {
//               updateUserStat(from_id, "rango", from_rango);
//             }
//           }

//           //farmeo de puntos
//           if (
//             ctx.message.reply_to_message.from.id === from_id &&
//             from_id !== parseInt(my_id)
//           ) {
//             //responder a uno mismo
//             return ctx.replyWithHTML(
//               `<a href="tg://user?id=${from_id}">[${adornarRango(
//                 from_rango
//               )}] ${from_nick}</a> ha intentado hacer trampas... \n<em>qué idiota</em>`,
//               { parseMode: "html" }
//             );
//           } else {
//             // aquí va el manejo de la reputación
//             const reply_id = ctx.message.reply_to_message.from.id;

//             //buscando al que sube la reputación en la BD
//             query(
//               `SELECT rep, nick, rango FROM usuarios WHERE tg_id = '${reply_id}'`,
//               [],
//               async (err, res) => {
//                 if (err) {
//                   console.log("[ERROR SELECTING] weird af");
//                   console.log(err.stack);
//                 } else {
//                   // inicializar rep y nick del otro usuario
//                   let reply_rep = 0;
//                   let reply_nick = ctx.message.reply_to_message.from.first_name;
//                   let reply_rango = setRango(reply_rep);
//                   // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//                   if (res.rows[0] === undefined) {
//                     const values = [
//                       reply_id,
//                       reply_rep,
//                       new Date(),
//                       reply_nick,
//                       reply_rango,
//                     ];

//                     await anotherQuery(
//                       "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
//                       values
//                     );
//                   } else {
//                     // si todo va bien, tomo los valores
//                     reply_rep = res.rows[0].rep;
//                     reply_nick = res.rows[0].nick;
//                     reply_rango = setRango(reply_rep - 1);
//                     // en caso de que el usuario no tenga rango
//                     if (res.rows[0].rango === null) {
//                       updateUserStat(reply_id, "rango", reply_rango);
//                     }
//                   }

//                   query(
//                     `UPDATE usuarios SET rep = rep - 1, rango = '${setRango(
//                       reply_rep - 1
//                     )}', fecha = now() WHERE tg_id = '${reply_id}' RETURNING *`,
//                     [],
//                     (err, res) => {
//                       if (err) {
//                         console.log("[ERROR UPDATING]");
//                         console.log(err.stack);
//                       } else {
//                         console.log(
//                           "[rep y rango actualizados][mensaje respondido]"
//                         );
//                         reply_rango = res.rows[0].rango;
//                       }
//                     }
//                   );

//                   console.log(
//                     `[${adornarRango(reply_rango)}] ${reply_nick} tiene ${
//                       reply_rep - 1
//                     } puntos de reputación ahora, cortesía de [${adornarRango(
//                       from_rango
//                     )}] ${from_nick} (rep: ${from_rep})`
//                   );
//                   ctx.replyWithHTML(
//                     `<a href="tg://user?id=${reply_id}">[${adornarRango(
//                       reply_rango
//                     )}] ${reply_nick}</a> tiene ${
//                       reply_rep - 1
//                     } puntos de reputación ahora, cortesía de <a href="tg://user?id=${from_id}">[${adornarRango(
//                       from_rango
//                     )}] ${from_nick}</a>`
//                   );
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   }
// });

// bot.command("reset_rep", (ctx) => {
//   query(`UPDATE usuarios SET rep = 0`);
//   ctx.reply("Se ha reiniciado la reputación para todos los usuarios");
// });

// bot.command("set_rep", (ctx) => {
//   if (
//     ctx.from.id.toString() === my_id &&
//     ctx.message.text.substring(9).length > 0
//   ) {
//     const dest_id = ctx.message.reply_to_message
//       ? ctx.message.reply_to_message.from.id
//       : ctx.message.text.match(/\d+/g)[0];
//     const dest_rep = ctx.message.reply_to_message
//       ? ctx.message.text.match(/(\d+|\-\d+)/g)[0]
//       : ctx.message.text.match(/(\d+|\-\d+)/g)[1];
//     query(
//       `SELECT rep, nick FROM usuarios WHERE tg_id = '${dest_id}'`,
//       [],
//       async (err, res) => {
//         if (err) {
//           console.log("[ERROR SELECTING] weird af");
//           console.log(err.stack);
//         } else {
//           let dest_nick = ctx.message.from.first_name;
//           // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//           if (res.rows[0] === undefined) {
//             const values = [
//               dest_id.toString(),
//               dest_nick,
//               parseInt(dest_rep),
//               new Date(),
//             ];
//             await anotherQuery(
//               "INSERT INTO usuarios(tg_id, rep, fecha, nick) VALUES($1, $2, $3, $4)",
//               values
//             );
//             return ctx.replyWithHTML(
//               `Se ha registrado a ${dest_nick} con reputación ${dest_rep}`
//             );
//           } else {
//             // si todo va bien, tomo los valores
//             dest_nick = res.rows[0].nick;
//             updateUserStat(dest_id, "rep", parseInt(dest_rep));
//             return ctx.replyWithHTML(
//               `Se ha actualizado el registro de ${dest_nick} con reputación ${dest_rep}`
//             );
//           }
//         }
//       }
//     );
//   } else {
//     ctx.reply(
//       "No tienes suficientes privilegios para ejecutar este comando o lo estás haciendo mal... Me inclino por lo primero"
//     );
//   }
// });

// bot.command("nick", (ctx) => {
//   const new_nick = ctx.message.text.substring(6);
//   const id = ctx.message.from.id;
//   query(`SELECT nick FROM usuarios WHERE tg_id = '${id}'`, [], (err, res) => {
//     if (err) {
//       console.log("[ERROR SELECTING] weird af");
//       console.log(err.stack);
//     } else {
//       // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
//       if (res.rows[0] === undefined) {
//         const values = [id, 0, new Date(), new_nick];
//         query(
//           "INSERT INTO usuarios(tg_id, rep, fecha, nick) VALUES($1, $2, $3, $4)",
//           values
//         );
//       } else {
//         // si todo va bien, cambio el nick
//         updateUserStat(id, "nick", new_nick);
//       }
//       console.log(
//         "El nick de " + ctx.message.from.first_name + " será " + new_nick
//       );
//       return ctx
//         .replyWithHTML(
//           "El nick de " + ctx.message.from.first_name + " será " + new_nick
//         )
//         .catch((error) => {
//           console.log(
//             "[/nick] Hubo un error agregando un usuario",
//             error.description
//           );
//           return ctx.replyWithHTML(error.description);
//         });
//     }
//   });
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

// filtros

// bot.on("message", (ctx) => {
//   query("SELECT * FROM filters", [], (err, res) => {
//     if (err) {
//       console.log("[ERROR UPDATING]");
//       console.log(err.stack);
//     } else {
//       res.rows.map((trigger) => {
//         const regex = new RegExp("^" + trigger.filtro + "$", "i");
//         const respuesta = JSON.parse(trigger.respuesta);
//         const caption = respuesta.caption ? respuesta.caption : null;
//         if (trigger.chat === ctx.chat.id.toString()) {
//           if (
//             (ctx.message.text && ctx.message.text.match(regex)) ||
//             (ctx.message.caption && ctx.message.caption.match(regex))
//           ) {
//             console.log(trigger.respuesta + "\n" + respuesta);
//             if (trigger.tipo === "text") {
//               const entities = respuesta.entities || [];
//               console.log("Entities ", entities);
//               let texto_final = respuesta.text;
//               entities.map((entity) => {
//                 const { offset, length, type } = entity;
//                 let tag;
//                 switch (type) {
//                   case "text_link":
//                     tag = "a";
//                     break;
//                   case "bold":
//                     tag = "b";
//                     break;
//                   case "italic":
//                     tag = "i";
//                     break;
//                   case "code":
//                     tag = "code";
//                     break;
//                   case "pre":
//                     tag = "pre";
//                     break;
//                   case "text_mention":
//                     tag = "a";
//                     break;
//                   case "strikethrough":
//                     tag = "s";
//                     break;
//                   case "underline":
//                     tag = "u";
//                     break;
//                   default:
//                     tag = "i";
//                     break;
//                 }
//                 console.log("Tag ", tag);
//                 texto_final = texto_final.replace(
//                   respuesta.text.substr(offset, length),
//                   `<${tag} ${
//                     entity.url ? `href="${entity.url}"` : ``
//                   }>${respuesta.text.substr(offset, length)}</${tag}>`
//                 );
//               });

//               ctx.replyWithHTML(texto_final, {
//                 reply_to_message_id: ctx.message.message_id,
//               });
//             } else if (trigger.tipo === "photo") {
//               ctx
//                 .replyWithPhoto(
//                   respuesta.photo[respuesta.photo.length - 1].file_id,
//                   {
//                     caption: caption,
//                     reply_to_message_id: ctx.message.message_id,
//                   }
//                 )
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             } else if (trigger.tipo === "sticker") {
//               ctx
//                 .replyWithSticker(respuesta.sticker.file_id, {
//                   reply_to_message_id: ctx.message.message_id,
//                 })
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             } else if (trigger.tipo === "voice") {
//               ctx
//                 .replyWithVoice(respuesta.voice.file_id, {
//                   caption: caption,
//                   reply_to_message_id: ctx.message.message_id,
//                 })
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             } else if (trigger.tipo === "video") {
//               ctx
//                 .replyWithVideo(respuesta.video.file_id, {
//                   caption: caption,
//                   reply_to_message_id: ctx.message.message_id,
//                 })
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             } else if (trigger.tipo === "audio") {
//               ctx
//                 .replyWithAudio(respuesta.audio.file_id, {
//                   caption: caption,
//                   reply_to_message_id: ctx.message.message_id,
//                 })
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             } else {
//               ctx
//                 .replyWithDocument(respuesta.document.file_id, {
//                   caption: caption,
//                   reply_to_message_id: ctx.message.message_id,
//                 })
//                 .catch((err) => ctx.reply(JSON.stringify(err)));
//             }
//           }
//         }
//       });
//     }
//   });
// });

// Iniciar bot
bot.launch();
console.log("BOT INICIADO");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
