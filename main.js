import { Telegraf, Markup } from "telegraf";

const my_id = process.env.ADMIN_ID;

// hora en que arranca el bot
const inicio = performance.now();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.action("del", (ctx) => ctx.deleteMessage());

bot.command(["group", "promo", "spam"], (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url("Grupo", "https://t.me/juestin_taim"),
      Markup.button.url("Canal", "https://t.me/wasting_time_pro"),
    ],
    [Markup.button.callback("Borrar", "del")],
  ]);
  const text =
    "Sea usted bienvenid@ a la comunidad de <b>Wasting Time</b>. Donde podrá pasar tiempo con sus amigos, compartir memes, jugar a encontrar el lobo y probablemente morir en el intento.";
  ctx.replyWithHTML(text, keyboard);
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
    .replace(/,/g, ",\n");
  const chatInfo = JSON.stringify(ctx.chat)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n");
  const userInfo = JSON.stringify(ctx.from)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n");
  const messageInfo = JSON.stringify(ctx.message)
    .replace(/"/g, " ")
    .replace(/,/g, ",\n");
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

// comando ayuda

bot.command(["jaja", "jajaja", "porn"], (ctx) => {
  if (!ctx.message.reply_to_message) {
    ctx.replyWithHTML(
      `<a href="tg://user?id=${ctx.message.from.id}"> ${ctx.message.from.first_name}</a>, el comando se usa respondiendo un mensaje`
    );
  } else if (ctx.message.reply_to_message.from.id == my_id) {
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
      message_text: `Según este bot soy ${Math.floor(
        Math.random() * 100
      )}% ${query}`,
    },
    {
      title: `Probabilidad de que ${query}`,
      description: `La efectividad está probada científicamente`,
      message_text: `La probabilidad de que ${query} es de un ${Math.floor(
        Math.random() * 100
      )}%`,
    },
    {
      title: `Calcular ${query}`,
      description: `Calculadora que usa supercomputadoras de terceros: NASA, MIT...`,
      message_text: `${query} = ${parser.parse(query).simplify()}`,
    },
  ];

  const { results } = await response.json();
  const recipes = results
    // @ts-ignore
    .filter(({ thumbnail }) => thumbnail)
    // @ts-ignore
    .map(({ title, href, thumbnail }) => ({
      type: "article",
      id: thumbnail,
      title: title,
      description: title,
      thumb_url: thumbnail,
      input_message_content: {
        message_text: title,
      },
      reply_markup: Markup.inlineKeyboard([
        Markup.button.url("Go to recipe", href),
      ]),
    }));
  return await ctx.answerInlineQuery(recipes);
});

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
  console.log("chosen inline result", chosenInlineResult);
});

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
