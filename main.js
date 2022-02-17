import { Telegraf, Markup } from "telegraf";
import { Parser } from "expr-eval";
import axios from "axios";
import Twig from "twig";
import { setRango, adornarRango } from "./utils.js";
import {
  query,
  anotherQuery,
  updateUserStat,
  exportTable,
  importTable,
  borrarBD,
  checkIfCmdProceed,
} from "./db.js";

const parser = new Parser({
  operators: {
    // These default to true, but are included to be explicit
    add: true,
    concatenate: true,
    conditional: true,
    divide: true,
    factorial: true,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    logical: true,
    comparison: true,
    in: true,
    assignment: true,
  },
});

const my_id = process.env.ADMIN_ID;
let victim = process.env.VICTIM_ID;
// hora en que arranca el bot
const inicio = performance.now();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.action("del", (ctx) => ctx.deleteMessage());
bot.action("enviarBD", async (ctx) => {
  await ctx
    .replyWithDocument({
      source: `filters.csv`,
      caption: "Filtros exportados",
      filename: "filters.csv",
    })
    .then(() => borrarBD("filters.csv"))
    .catch((err) => console.log(err));
  await ctx
    .replyWithDocument({
      source: `usuarios.csv`,
      caption: "Usuarios exportados",
      filename: "usuarios.csv",
    })
    .then(() => borrarBD("usuarios.csv"))
    .catch((err) => console.log(err));
  await ctx
    .replyWithDocument({
      source: `config.csv`,
      caption: "Filtros exportados",
      filename: "config.csv",
    })
    .then(() => borrarBD("config.csv"))
    .catch((err) => console.log(err));
});

bot.command(["grupo", "group", "promo", "spam"], (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url("Grupo", "https://t.me/juestin_taim"),
      Markup.button.url("Canal", "https://t.me/wasting_time_pro"),
    ],
    [Markup.button.callback("Borrar", "del")],
  ]);
  const text =
    "Sea usted bienvenid@ a la comunidad de <b>Wasting Time</b>. Donde podrá pasar tiempo con sus amigos, compartir memes, jugar a encontrar el lobo y probablemente morir en el intento.";

  ctx
    .replyWithPhoto({ source: "./images/grupo.webp" })
    .then(() => ctx.replyWithHTML(text, keyboard));
});

bot.command("ping", (ctx) => {
  const tiempo = elapsedTime(inicio);
  const botUsername = ctx.me;
  const botInfo = JSON.stringify(ctx.botInfo)
    .replace(/"/g, "")
    .replace(/,/g, ",\n");
  console.log(botInfo);
  ctx.reply(`[@${botUsername}] Tiempo activo: ${tiempo}`);
});

bot.command("me", async (ctx) => {
  const tiempo = elapsedTime(inicio);
  const botInfo = JSON.stringify(ctx.botInfo)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n")
    .replace(/{/g, "\n {");
  const chatInfo = JSON.stringify(ctx.chat)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n")
    .replace(/{/g, "\n {");
  const userInfo = JSON.stringify(ctx.from)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n")
    .replace(/{/g, "\n {");
  const messageInfo = JSON.stringify(ctx.message)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n")
    .replace(/{/g, "\n {");
  const text =
    "Bot info: \n" +
    botInfo +
    "\nTiempo activo: " +
    tiempo +
    "\n\n" +
    "Chat info: \n" +
    chatInfo +
    "\n\n" +
    "User info: \n" +
    userInfo +
    "\n\n" +
    "Message info: \n" +
    messageInfo;
  console.log(text.length);
  if (text.length < 4096) {
    ctx.replyWithHTML(text);
  } else {
    await ctx.replyWithHTML(text.substring(0, 4096));
    await ctx.replyWithHTML(text.substring(4096, text.length));
  }
});

bot.command("info", async (ctx) => {
  //console.log(ctx);
  if (ctx.message.reply_to_message) {
    const msgInfo = JSON.stringify(ctx.message.reply_to_message)
      .replace(/"/g, " ")
      .replace(/,/g, ",\n")
      .replace(/{/g, "\n {");

    const text = "Información del mensaje:\n" + msgInfo;
    if (text.length < 4096) {
      ctx.replyWithHTML(text, {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      });
    } else {
      await ctx.replyWithHTML(text.substring(0, 4096), {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      });
      await ctx.replyWithHTML(text.substring(4096, text.length), {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      });
    }
  } else {
    ctx.replyWithHTML(
      "<code>/info</code> se usa respondiendo un mensaje. Tal vez prefieras usar /me"
    );
  }
});

// comando ayuda

bot.command(["jaja", "jajaja", "porn"], (ctx) => {
  if (!ctx.message.reply_to_message) {
    ctx.replyWithHTML(
      `<a href="tg://user?id=${ctx.message.from.id}"> ${ctx.message.from.first_name}</a>, el comando se usa respondiendo un mensaje`
    );
  } else if (ctx.message.reply_to_message.from.id.toString() == my_id) {
    ctx
      .replyWithVoice(
        { source: "./audio/risas.ogg" },
        {
          reply_to_message_id: ctx.message.message_id,
        }
      )
      .then(() => ctx.reply("Yo tú no lo vuelvo a intentar"));
  } else {
    ctx.replyWithVoice(
      { source: "./audio/risas.ogg" },
      {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      }
    );
  }
});

bot.command(["/gay", "/ghei"], (ctx) => {
  let replyMarkup = Markup.inlineKeyboard([
    [
      Markup.button.switchToChat("en otro chat", "loca"),
      Markup.button.switchToCurrentChat("aquí mismo", "loca"),
    ],
  ]);

  ctx.replyWithHTML("Mi % de loca", replyMarkup);
});

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
  //console.log(recipes);
  return await ctx.answerInlineQuery(recipes, { cache_time: 1 });
});

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
  console.log("chosen inline result", chosenInlineResult);
});

bot.command(["c", "calc"], (ctx) => {
  const index = ctx.message.entities[0].length + 1;
  const math = ctx.message.text.substring(index);
  console.log(math);
  if (math === "") {
    ctx.replyWithHTML(
      `Debe introducir una expresión matemática.\nEjemplos: <pre>/calc 2+3^6</pre>\n<pre>/calc PI^4</pre>\n<pre>/calc 25346*3456/32</pre>`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } else {
    try {
      let result = parser.parse(math).simplify();
      console.log("El resultado de " + math + " es " + result);
      ctx.replyWithHTML(`<pre>${result}</pre>`, {
        reply_to_message_id: ctx.message.message_id,
      });
    } catch (error) {
      const errorMessage = JSON.stringify(error)
        .replace(/"/g, " ")
        .replace(/,/g, ",\n")
        .replace(/{/g, "\n {");
      ctx.replyWithHTML(`<pre>${errorMessage}</pre>`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  }
});
bot.command(["start", "jelou"], (ctx) => {
  ctx.replyWithHTML(
    `<b>Hola, ${ctx.message.from.first_name}!</b>\nEnvía /ayuda para ver algunas opciones`
  );
});

bot.command("say", (ctx) => {
  const text = ctx.message.text.substring(5);
  console.log(text.length);
  if (text.length > 0) {
    ctx.replyWithHTML(text);
  } else {
    ctx.replyWithHTML(
      "Escribe algo después del comando y yo lo repetiré\nEjemplo: <code>/say Hola</code>"
    );
  }
});

bot.command("quit", (ctx) => {
  if (ctx.message.from.id.toString() == my_id) {
    ctx
      .reply("Me fui 👋")
      .then(() => ctx.telegram.leaveChat(ctx.message.chat.id));
  }
});

bot.hears(/^\/(s|s@\w+)(\/)?$/i, (ctx) =>
  ctx.replyWithHTML(
    `Debe escoger qué parte del mensaje desea reemplazar y con qué desea hacerlo.\nPor ejemplo, si tenemos un mensaje que diga "Eres feo" y queremos transformarlo en "Eres hermoso", debemos usar <pre>/s/feo/hermoso</pre> respondiendo dicho mensaje.\n\n<b>Nota:</b> Si el bot es administrador, borrará nuestro mensaje`,
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

bot.command("tag", (ctx) => {
  const text = ctx.message.text.substring(5) ?? "";
  const number =
    text.length > 0 && text.match(/\d+/g) ? text.match(/\d+/g)[0] : 1;
  const n = parseInt(number ?? 1) > 20 ? 20 : parseInt(number ?? 1);
  console.log(text, number, n);
  let new_victim = ctx.message.reply_to_message
    ? ctx.message.reply_to_message.from.id
    : victim;

  if (new_victim.toString() == my_id) {
    ctx.replyWithHTML(
      `<a href="tg://user?id=${ctx.from.id}">Cariño</a>, no puedo hacer eso`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } else {
    // voy a usar async await para que la salida esté en orden
    // como en https://zellwk.com/blog/async-await-in-loops/
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const forEnOrden = async (_) => {
      for (let i = 0; i < n; i++) {
        await sleep(1500).then(() => {
          ctx.replyWithHTML(
            `<a href="tg://user?id=${new_victim}">tag tag</a>\n<em>llamada número ${
              i + 1
            }</em>`
          );
        });
      }
    };
    forEnOrden();
  }
});

bot.command("set_victim", (ctx) => {
  const text = ctx.message.text.substring(12) ?? "";
  if (ctx.from.id.toString() === my_id && text.match(/\d+/g)) {
    victim = text.match(/\d+/g)[0];
    ctx.reply(`Ahora ${victim} es la victima`);
  }
});
// Sobre bases de datos
bot.command("create_table", (ctx) => {
  if (ctx.from.id.toString() === my_id) {
    query(
      "CREATE TABLE IF NOT EXISTS public.filters(filtro text NOT NULL, respuesta text NOT NULL, tipo text NOT NULL, chat text); ALTER TABLE IF EXISTS public.filters2 OWNER to postgres;"
    );
    query(
      "CREATE TABLE IF NOT EXISTS public.usuarios(tg_id text NOT NULL, rep integer, fecha date, nick text, rango text, chat_ids text[]); ALTER TABLE IF EXISTS public.usuarios OWNER to postgres;"
    );
    query(
      "CREATE TABLE IF NOT EXISTS public.config(chat_id text NOT NULL, opciones text); ALTER TABLE IF EXISTS public.config OWNER to postgres;"
    );
    ctx.reply("Tablas creadas");
  }
});

bot.command("import", (ctx) => {
  if (
    ctx.from.id.toString() === my_id &&
    ctx.message.reply_to_message &&
    ctx.message.reply_to_message.document
  ) {
    const nombre = ctx.message.reply_to_message.document.file_name
      .replace(/\d+/, "")
      .replace(".csv", "");
    ctx.telegram
      .getFileLink(ctx.message.reply_to_message.document.file_id)
      .then((res) => {
        const url = res.href;
        //console.log(res);
        axios({ url }).then(async (res) => {
          let data = res.data;
          const rows = data.split("\n");
          const columns_array = rows[0].split(",");
          const column_names = columns_array.join(", ");
          //console.log(rows[1] + "\n");
          rows.map(async (row, index) => {
            if (index > 0) {
              let text = "";

              if (nombre === "filters") {
                const columns = row.split(",");
                const filtro = columns[0];
                const respuesta_temp = columns
                  .slice(1, -2)
                  .join(",")
                  .replace(/""/g, '"');
                const respuesta = respuesta_temp.substring(
                  1,
                  respuesta_temp.length - 1
                );
                const tipo = columns[columns.length - 2];
                const chat = columns[columns.length - 1];
                const insert = `INSERT INTO public.${nombre}(${column_names}) VALUES ('${filtro}', '${respuesta}', '${tipo}', '${chat}');`;
                text = insert;
              } else if (nombre === "config") {
                const values_temp = row.split(",");
                //const first_col = columns_array[0];
                const values = "'" + values_temp.join("', '") + "'";
                console.log("[values]: ", values, "end");
                const insert = `INSERT INTO public.${nombre}(${column_names}) VALUES (${values});`;
                text = insert;
              } else {
                const values_temp = row.split(",");
                //const first_col = columns_array[0];
                const values = "'" + values_temp.join("', '") + "'";

                const insert = `INSERT INTO public.${nombre}(${column_names}) VALUES (${values});`;
                text = insert;
              }
              //console.log(text);
              await anotherQuery(text).catch((err) => {
                console.log(err);
              });
            }
          });
          ctx.reply("Tabla importada");
        });
      });
  }
});

bot.command("export", (ctx) => {
  if (ctx.from.id.toString() === my_id) {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Enviar archivos", "enviarBD")],
    ]);
    exportTable("filters").then(() => {
      exportTable("usuarios").then(() => {
        exportTable("config").then(() => {
          ctx.reply("Tablas exportadas con éxito", keyboard);
        });
      });
    });
  }
});

bot.command("add", (ctx) => {
  if (ctx.message.reply_to_message) {
    const trigger = ctx.message.text.replace("/add ", "");
    const answer = JSON.stringify(ctx.message.reply_to_message);
    let type;
    if (ctx.message.reply_to_message.text) {
      type = "text";
    } else if (ctx.message.reply_to_message.photo) {
      type = "photo";
    } else if (ctx.message.reply_to_message.voice) {
      type = "voice";
    } else if (ctx.message.reply_to_message.video) {
      type = "video";
    } else if (ctx.message.reply_to_message.sticker) {
      type = "sticker";
    } else if (ctx.message.reply_to_message.audio) {
      type = "audio";
    } else {
      type = "document";
    }
    query(
      `DELETE FROM filters WHERE filtro = '${trigger}' AND chat = '${ctx.chat.id}';`
    );
    const values = [trigger, answer, type, ctx.chat.id];
    query(
      "INSERT INTO filters(filtro, respuesta, tipo, chat) VALUES($1, $2, $3, $4)",
      values,
      (err, res) => {
        if (err) {
          console.log("[ERROR UPDATING]");
          console.log(err.stack);
        } else {
          console.log("[filtro agregado]");
          ctx.replyWithHTML(`Nuevo filtro <code>${trigger}</code>`);
        }
      }
    );
  }
});

bot.command("rem", (ctx) => {
  const trigger = ctx.message.text.replace("/rem ", "");
  query(
    `DELETE FROM filters WHERE filtro = '${trigger}' AND chat = '${ctx.chat.id}'`
  );
  ctx.replyWithHTML(`Filtro <code>${trigger}</code> eliminado`);
});

bot.command(["filters", "filtros"], (ctx) => {
  query(
    `SELECT * FROM filters WHERE chat = '${ctx.chat.id}'`,
    [],
    (err, res) => {
      if (err) {
        console.log("[ERROR UPDATING]");
        console.log(err.stack);
      } else {
        let texto = [`Lista de filtros (${ctx.chat.id}): `];
        for (let i = 0; i < res.rows.length; i++) {
          const filtro_i = res.rows[i].filtro;
          texto.push(filtro_i);
        }
        const salida = texto.join("\n");
        ctx.reply(salida);
      }
    }
  );
});

bot.command(["filters_all", "filtros_todos"], (ctx) => {
  query(`SELECT * FROM filters`, [], (err, res) => {
    if (err) {
      console.log("[ERROR UPDATING]");
      console.log(err.stack);
    } else {
      let texto = [`Lista de filtros: `];
      for (let i = 0; i < res.rows.length; i++) {
        const filtro_i = `${res.rows[i].filtro} en ${res.rows[i].chat}`;
        texto.push(filtro_i);
      }
      const salida = texto.join("\n");
      ctx.reply(salida);
    }
  });
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
bot.hears(/^\++$/, async (ctx) => {
  if (ctx.message.reply_to_message) {
    //id del remitente
    const from_id = ctx.message.from.id;
    //extraer nick y rep del remitente
    query(
      `SELECT rep, nick FROM usuarios WHERE tg_id = '${from_id}'`,
      [],
      async (err, res) => {
        if (err) {
          console.log("[ERROR SELECTING] weird af");
          console.log(err.stack);
        } else {
          // inicializar rep y nick del usuario
          let from_rep = 0;
          let from_nick = ctx.message.from.first_name;
          let from_rango = setRango(from_rep);
          // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
          if (res.rows[0] === undefined) {
            const values = [
              from_id,
              from_rep,
              new Date(),
              from_nick,
              from_rango,
            ];
            await anotherQuery(
              "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
              values
            );
          } else {
            // si todo va bien, tomo los valores
            from_rep = res.rows[0].rep;
            from_nick = res.rows[0].nick;
            from_rango = setRango(from_rep);
            // en caso de que el usuario no tenga rango
            if (res.rows[0].rango === null) {
              updateUserStat(from_id, "rango", from_rango);
            }
          }

          //farmeo de puntos
          if (
            ctx.message.reply_to_message.from.id === from_id &&
            from_id !== parseInt(my_id)
          ) {
            //responder a uno mismo
            return ctx.replyWithHTML(
              `<a href="tg://user?id=${from_id}">[${adornarRango(
                from_rango
              )}] ${from_nick}</a> ha intentado hacer trampas... \n<em>qué idiota</em>`,
              { parseMode: "html" }
            );
          } else {
            // aquí va el manejo de la reputación
            const reply_id = ctx.message.reply_to_message.from.id;

            //buscando al que sube la reputación en la BD
            query(
              `SELECT rep, nick, rango FROM usuarios WHERE tg_id = '${reply_id}'`,
              [],
              async (err, res) => {
                if (err) {
                  console.log("[ERROR SELECTING] weird af");
                  console.log(err.stack);
                } else {
                  // inicializar rep y nick del otro usuario
                  let reply_rep = 1;
                  let reply_nick = ctx.message.reply_to_message.from.first_name;
                  let reply_rango = setRango(reply_rep);
                  // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
                  if (res.rows[0] === undefined) {
                    const values = [
                      reply_id,
                      reply_rep,
                      new Date(),
                      reply_nick,
                      reply_rango,
                    ];

                    await anotherQuery(
                      "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
                      values
                    );
                  } else {
                    // si todo va bien, tomo los valores
                    reply_rep = res.rows[0].rep;
                    reply_nick = res.rows[0].nick;
                    reply_rango = setRango(reply_rep + 1);
                    // en caso de que el usuario no tenga rango
                    if (res.rows[0].rango === null) {
                      updateUserStat(reply_id, "rango", reply_rango);
                    }
                  }

                  query(
                    `UPDATE usuarios SET rep = rep + 1, rango = '${setRango(
                      reply_rep + 1
                    )}', fecha = now() WHERE tg_id = '${reply_id}' RETURNING *`,
                    [],
                    (err, res) => {
                      if (err) {
                        console.log("[ERROR UPDATING]");
                        console.log(err.stack);
                      } else {
                        console.log(
                          "[rep y rango actualizados][mensaje respondido]"
                        );
                        reply_rango = res.rows[0].rango;
                      }
                    }
                  );

                  console.log(
                    `[${adornarRango(reply_rango)}] ${reply_nick} tiene ${
                      reply_rep + 1
                    } puntos de reputación ahora, cortesía de [${adornarRango(
                      from_rango
                    )}] ${from_nick} (rep: ${from_rep})`
                  );
                  ctx.replyWithHTML(
                    `<a href="tg://user?id=${reply_id}">[${adornarRango(
                      reply_rango
                    )}] ${reply_nick}</a> tiene ${
                      reply_rep + 1
                    } puntos de reputación ahora, cortesía de <a href="tg://user?id=${from_id}">[${adornarRango(
                      from_rango
                    )}] ${from_nick}</a>`
                  );
                }
              }
            );
          }
        }
      }
    );
  }
});

bot.hears(/^(\-|—)+$/, async (ctx) => {
  if (ctx.message.reply_to_message) {
    //id del remitente
    const from_id = ctx.message.from.id;
    //extraer nick y rep del remitente
    query(
      `SELECT rep, nick FROM usuarios WHERE tg_id = '${from_id}'`,
      [],
      async (err, res) => {
        if (err) {
          console.log("[ERROR SELECTING] weird af");
          console.log(err.stack);
        } else {
          // inicializar rep y nick del usuario
          let from_rep = 0;
          let from_nick = ctx.message.from.first_name;
          let from_rango = setRango(from_rep);
          // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
          if (res.rows[0] === undefined) {
            const values = [
              from_id,
              from_rep,
              new Date(),
              from_nick,
              from_rango,
            ];
            await anotherQuery(
              "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
              values
            );
          } else {
            // si todo va bien, tomo los valores
            from_rep = res.rows[0].rep;
            from_nick = res.rows[0].nick;
            from_rango = setRango(from_rep);
            // en caso de que el usuario no tenga rango
            if (res.rows[0].rango === null) {
              updateUserStat(from_id, "rango", from_rango);
            }
          }

          //farmeo de puntos
          if (
            ctx.message.reply_to_message.from.id === from_id &&
            from_id !== parseInt(my_id)
          ) {
            //responder a uno mismo
            return ctx.replyWithHTML(
              `<a href="tg://user?id=${from_id}">[${adornarRango(
                from_rango
              )}] ${from_nick}</a> ha intentado hacer trampas... \n<em>qué idiota</em>`,
              { parseMode: "html" }
            );
          } else {
            // aquí va el manejo de la reputación
            const reply_id = ctx.message.reply_to_message.from.id;

            //buscando al que sube la reputación en la BD
            query(
              `SELECT rep, nick, rango FROM usuarios WHERE tg_id = '${reply_id}'`,
              [],
              async (err, res) => {
                if (err) {
                  console.log("[ERROR SELECTING] weird af");
                  console.log(err.stack);
                } else {
                  // inicializar rep y nick del otro usuario
                  let reply_rep = 0;
                  let reply_nick = ctx.message.reply_to_message.from.first_name;
                  let reply_rango = setRango(reply_rep);
                  // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
                  if (res.rows[0] === undefined) {
                    const values = [
                      reply_id,
                      reply_rep,
                      new Date(),
                      reply_nick,
                      reply_rango,
                    ];

                    await anotherQuery(
                      "INSERT INTO usuarios(tg_id, rep, fecha, nick, rango) VALUES($1, $2, $3, $4, $5)",
                      values
                    );
                  } else {
                    // si todo va bien, tomo los valores
                    reply_rep = res.rows[0].rep;
                    reply_nick = res.rows[0].nick;
                    reply_rango = setRango(reply_rep - 1);
                    // en caso de que el usuario no tenga rango
                    if (res.rows[0].rango === null) {
                      updateUserStat(reply_id, "rango", reply_rango);
                    }
                  }

                  query(
                    `UPDATE usuarios SET rep = rep - 1, rango = '${setRango(
                      reply_rep - 1
                    )}', fecha = now() WHERE tg_id = '${reply_id}' RETURNING *`,
                    [],
                    (err, res) => {
                      if (err) {
                        console.log("[ERROR UPDATING]");
                        console.log(err.stack);
                      } else {
                        console.log(
                          "[rep y rango actualizados][mensaje respondido]"
                        );
                        reply_rango = res.rows[0].rango;
                      }
                    }
                  );

                  console.log(
                    `[${adornarRango(reply_rango)}] ${reply_nick} tiene ${
                      reply_rep - 1
                    } puntos de reputación ahora, cortesía de [${adornarRango(
                      from_rango
                    )}] ${from_nick} (rep: ${from_rep})`
                  );
                  ctx.replyWithHTML(
                    `<a href="tg://user?id=${reply_id}">[${adornarRango(
                      reply_rango
                    )}] ${reply_nick}</a> tiene ${
                      reply_rep - 1
                    } puntos de reputación ahora, cortesía de <a href="tg://user?id=${from_id}">[${adornarRango(
                      from_rango
                    )}] ${from_nick}</a>`
                  );
                }
              }
            );
          }
        }
      }
    );
  }
});

bot.command("reset_rep", (ctx) => {
  query(`UPDATE usuarios SET rep = 0`);
  ctx.reply("Se ha reiniciado la reputación para todos los usuarios");
});

bot.command("set_rep", (ctx) => {
  if (
    ctx.from.id.toString() === my_id &&
    ctx.message.text.substring(9).length > 0
  ) {
    const dest_id = ctx.message.reply_to_message
      ? ctx.message.reply_to_message.from.id
      : ctx.message.text.match(/\d+/g)[0];
    const dest_rep = ctx.message.reply_to_message
      ? ctx.message.text.match(/(\d+|\-\d+)/g)[0]
      : ctx.message.text.match(/(\d+|\-\d+)/g)[1];
    query(
      `SELECT rep, nick FROM usuarios WHERE tg_id = '${dest_id}'`,
      [],
      async (err, res) => {
        if (err) {
          console.log("[ERROR SELECTING] weird af");
          console.log(err.stack);
        } else {
          let dest_nick = ctx.message.from.first_name;
          // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
          if (res.rows[0] === undefined) {
            const values = [
              dest_id.toString(),
              dest_nick,
              parseInt(dest_rep),
              new Date(),
            ];
            await anotherQuery(
              "INSERT INTO usuarios(tg_id, rep, fecha, nick) VALUES($1, $2, $3, $4)",
              values
            );
            return ctx.replyWithHTML(
              `Se ha registrado a ${dest_nick} con reputación ${dest_rep}`
            );
          } else {
            // si todo va bien, tomo los valores
            dest_nick = res.rows[0].nick;
            updateUserStat(dest_id, "rep", parseInt(dest_rep));
            return ctx.replyWithHTML(
              `Se ha actualizado el registro de ${dest_nick} con reputación ${dest_rep}`
            );
          }
        }
      }
    );
  } else {
    ctx.reply(
      "No tienes suficientes privilegios para ejecutar este comando o lo estás haciendo mal... Me inclino por lo primero"
    );
  }
});

bot.command("nick", (ctx) => {
  const new_nick = ctx.message.text.substring(6);
  const id = ctx.message.from.id;
  query(`SELECT nick FROM usuarios WHERE tg_id = '${id}'`, [], (err, res) => {
    if (err) {
      console.log("[ERROR SELECTING] weird af");
      console.log(err.stack);
    } else {
      // en caso de no encontrar elementos en la tabla, agrega un nuevo usuario
      if (res.rows[0] === undefined) {
        const values = [id, 0, new Date(), new_nick];
        query(
          "INSERT INTO usuarios(tg_id, rep, fecha, nick) VALUES($1, $2, $3, $4)",
          values
        );
      } else {
        // si todo va bien, cambio el nick
        updateUserStat(id, "nick", new_nick);
      }
      console.log(
        "El nick de " + ctx.message.from.first_name + " será " + new_nick
      );
      return ctx
        .replyWithHTML(
          "El nick de " + ctx.message.from.first_name + " será " + new_nick
        )
        .catch((error) => {
          console.log(
            "[/nick] Hubo un error agregando un usuario",
            error.description
          );
          return ctx.replyWithHTML(error.description);
        });
    }
  });
});

bot.command("like", async (ctx) => {
  const text =
    ctx.message.text.length > 5
      ? ctx.message.text.substring(6)
      : ctx.from.first_name;
  if (ctx.message.reply_to_message) {
    await ctx.replyWithHTML(`A ${text} le gusta esto 👆👀`, {
      reply_to_message_id: ctx.message.reply_to_message.message_id,
    });
  } else {
    await ctx.replyWithHTML(
      `A ${text} le gusta alguien aquí pero es tímido 😳`
    );
  }
  await ctx.deleteMessage().catch(() => {
    console.log("No se pudo borrar el mensaje");
    // const keyboard = Markup.inlineKeyboard([
    //   [Markup.button.callback("Borrar", "del")],
    // ]);
    // ctx.replyWithHTML("No pude borrar el mensaje", keyboard);
  });
});

bot.command("run", async (ctx) => {
  if (ctx.from.id.toString() === my_id) {
    let text = ctx.message.text.substring(5);
    console.log(text);
    try {
      let template = Twig.twig({
        data: text,
      });
      await template.renderAsync({
        telegram: ctx.telegram,
        ctx: ctx,
        here: ctx.chat.id,
      });
    } catch (error) {
      ctx.replyWithHTML(error.message);
    }
  } else {
    ctx.reply("No tienes suficientes privilegios para ejecutar este comando");
  }
});

//
//
//

// filtros
bot.on("message", (ctx) => {
  query("SELECT * FROM filters", [], (err, res) => {
    if (err) {
      console.log("[ERROR UPDATING]");
      console.log(err.stack);
    } else {
      res.rows.map((trigger) => {
        const regex = new RegExp("^" + trigger.filtro + "$", "i");
        const respuesta = JSON.parse(trigger.respuesta);
        const caption = respuesta.caption ? respuesta.caption : null;
        if (trigger.chat === ctx.chat.id.toString()) {
          if (
            (ctx.message.text && ctx.message.text.match(regex)) ||
            (ctx.message.caption && ctx.message.caption.match(regex))
          ) {
            console.log(trigger.respuesta + "\n" + respuesta);
            if (trigger.tipo === "text") {
              const entities = respuesta.entities || [];
              console.log("Entities ", entities);
              let texto_final = respuesta.text;
              entities.map((entity) => {
                const { offset, length, type } = entity;
                let tag;
                switch (type) {
                  case "text_link":
                    tag = "a";
                    break;
                  case "bold":
                    tag = "b";
                    break;
                  case "italic":
                    tag = "i";
                    break;
                  case "code":
                    tag = "code";
                    break;
                  case "pre":
                    tag = "pre";
                    break;
                  case "text_mention":
                    tag = "a";
                    break;
                  case "strikethrough":
                    tag = "s";
                    break;
                  case "underline":
                    tag = "u";
                    break;
                  default:
                    tag = "i";
                    break;
                }
                console.log("Tag ", tag);
                texto_final = texto_final.replace(
                  respuesta.text.substr(offset, length),
                  `<${tag} ${
                    entity.url ? `href="${entity.url}"` : ``
                  }>${respuesta.text.substr(offset, length)}</${tag}>`
                );
              });

              ctx.replyWithHTML(texto_final, {
                reply_to_message_id: ctx.message.message_id,
              });
            } else if (trigger.tipo === "photo") {
              ctx
                .replyWithPhoto(
                  respuesta.photo[respuesta.photo.length - 1].file_id,
                  {
                    caption: caption,
                    reply_to_message_id: ctx.message.message_id,
                  }
                )
                .catch((err) => ctx.reply(JSON.stringify(err)));
            } else if (trigger.tipo === "sticker") {
              ctx
                .replyWithSticker(respuesta.sticker.file_id, {
                  reply_to_message_id: ctx.message.message_id,
                })
                .catch((err) => ctx.reply(JSON.stringify(err)));
            } else if (trigger.tipo === "voice") {
              ctx
                .replyWithVoice(respuesta.voice.file_id, {
                  caption: caption,
                  reply_to_message_id: ctx.message.message_id,
                })
                .catch((err) => ctx.reply(JSON.stringify(err)));
            } else if (trigger.tipo === "video") {
              ctx
                .replyWithVideo(respuesta.video.file_id, {
                  caption: caption,
                  reply_to_message_id: ctx.message.message_id,
                })
                .catch((err) => ctx.reply(JSON.stringify(err)));
            } else if (trigger.tipo === "audio") {
              ctx
                .replyWithAudio(respuesta.audio.file_id, {
                  caption: caption,
                  reply_to_message_id: ctx.message.message_id,
                })
                .catch((err) => ctx.reply(JSON.stringify(err)));
            } else {
              ctx
                .replyWithDocument(respuesta.document.file_id, {
                  caption: caption,
                  reply_to_message_id: ctx.message.message_id,
                })
                .catch((err) => ctx.reply(JSON.stringify(err)));
            }
          }
        }
      });
    }
  });
});

// Iniciar bot
bot.launch();
console.log("BOT INICIADO");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// calcular el tiempo que tarda el bot en arrancar
const elapsedTime = (inicio) => {
  const ahora = performance.now();
  const activo = ahora - inicio;
  // dar el resultado en dependencia del tiempo
  if (activo > 60 * 60 * 1000) {
    const valor = roundToAny(activo / 3600000, 2);
    const horas = Math.floor(valor);
    const minutos = roundToAny((valor - horas) * 60, 0);
    return `${horas} h ${minutos} min`;
  } else if (activo > 60000) {
    const valor = roundToAny(activo / 60000, 2);
    const minutos = Math.floor(valor);
    const segundos = roundToAny((valor - minutos) * 60, 0);
    return `${minutos} min ${segundos} s`;
  } else {
    return `${roundToAny(activo / 1000, 1)} s`;
  }
};

function roundToAny(num, n = 2) {
  return +(Math.round(num + `e+${n}`) + `e-${n}`);
}
