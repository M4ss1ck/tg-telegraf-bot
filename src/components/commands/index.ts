import { Composer, Markup, Types } from "telegraf";
import Twig from "twig";
import { Parser } from "expr-eval";
import { elapsedTime } from "../../utils/utils.js";

const parser = new Parser({
  operators: {
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

const my_id = process.env.ADMIN_ID ?? '123';
let victim = process.env.VICTIM_ID ?? '123';
// hora en que arranca el bot
const inicio = performance.now();

const commands = new Composer();

commands.command(["grupo", "group", "promo", "spam"], (ctx) => {
  let buttons: any[][] = [
    [
      Markup.button.url("Grupo", "https://t.me/juestin_taim"),
      Markup.button.url("Canal", "https://t.me/wasting_time_pro"),
    ]
  ];
  if (ctx.chat.type === "private") {
    buttons.push([
      Markup.button.webApp("Wasting Blog", "https://wastingblog.gatsbyjs.io/"),
      Markup.button.webApp("Massick's Blog", "https://massick.gatsbyjs.io/"),
    ]);
  }
  buttons.push([Markup.button.callback("Borrar", "del")]);
  const keyboard = Markup.inlineKeyboard(buttons);
  const text =
    "Sea usted bienvenid@ a la comunidad de <b>Wasting Time</b>. Donde podrá pasar tiempo con sus amigos, compartir memes, jugar a encontrar el lobo y probablemente morir en el intento.";

  ctx
    .replyWithPhoto({ source: "./images/grupo.webp" })
    .then(() => ctx.replyWithHTML(text, keyboard));
});

commands.command("ping", (ctx) => {
  const tiempo = elapsedTime(inicio);
  const botUsername = ctx.me;
  const botInfo = JSON.stringify(ctx.botInfo)
    .replace(/"/g, "")
    .replace(/,/g, ",\n");
  console.log(botInfo);
  ctx.reply(`[@${botUsername}] Tiempo activo: ${tiempo}`);
});

commands.command("me", async (ctx) => {
  const text = `<pre>${JSON.stringify(ctx.botInfo, null, 2)}</pre>`;
  console.log(text.length);
  if (text.length < 4096) {
    ctx.replyWithHTML(text);
  } else {
    await ctx.replyWithHTML(text.substring(0, 4096));
    await ctx.replyWithHTML(text.substring(4096, text.length));
  }
});

commands.command("info", async (ctx) => {
  //console.log(ctx);
  if (ctx.message.reply_to_message) {
    const msgInfo = JSON.stringify(ctx.message.reply_to_message, null, 2);
    const text = "<b>Información del mensaje:</b>\n<pre>" + msgInfo + "</pre>";
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

commands.command(["jaja", "jajaja", "porn"], (ctx) => {
  if (!ctx.message.reply_to_message) {
    ctx.replyWithHTML(
      `<a href="tg://user?id=${ctx.message.from.id}"> ${ctx.message.from.first_name}</a>, el comando se usa respondiendo un mensaje`
    );
  } else if (ctx.message.reply_to_message.from?.id.toString() == my_id) {
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

commands.command(["/gay", "/ghei"], (ctx) => {
  let replyMarkup = Markup.inlineKeyboard([
    [
      Markup.button.switchToChat("en otro chat", "loca"),
      Markup.button.switchToCurrentChat("aquí mismo", "loca"),
    ],
  ]);

  ctx.replyWithHTML("Mi % de loca", replyMarkup);
});

commands.command(["c", "calc"], (ctx) => {
  const index = ctx.message.entities ? ctx.message.entities[0].length + 1 : 0;
  const math = ctx.message.text.substring(index);
  console.log(math);
  if (math === "") {
    ctx.replyWithHTML(
      `Debe introducir una expresión matemática.\nEjemplos: <code>/calc 2+3^6</code>\n<code>/calc PI^4</code>\n<code>/calc 25346*3456/32</code>`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } else {
    try {
      let result = parser.parse(math).simplify();
      console.log("El resultado de " + math + " es " + result);
      ctx.replyWithHTML(`<code>${result}</code>`, {
        reply_to_message_id: ctx.message.message_id,
      });
    } catch (error) {
      const errorMessage = JSON.stringify(error)
        .replace(/"/g, " ")
        .replace(/,/g, ",\n")
        .replace(/{/g, "\n {");
      ctx.replyWithHTML(`<code>${errorMessage}</code>`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  }
});
commands.command(["start", "jelou"], (ctx) => {
  ctx.replyWithHTML(
    `<b>Hola, ${ctx.message.from.first_name}!</b>\nEnvía <code>/ayuda</code> para ver algunas opciones`
  );
});

commands.command(["ayuda", "help"], (ctx) => {
  ctx.replyWithHTML(
    `<b>Comandos disponibles:</b>\n<code>/ayuda</code> --- este comando 🚶‍♂️\n<code>/calc</code> o <code>/c</code> --- calcular una operación matemática\n<code>/grupo</code> o <code>/promo</code> --- Información sobre la comunidad del bot\n<code>/info</code> --- información sobre el mensaje respondido\n<code>/me</code> --- información sobre el bot y el usuario\n<code>/ud</code> --- buscar palabras o frases en Urban Dictionary\n<code>/nick</code> --- crear/cambiar nick usado por el bot\n<code>/poll</code> --- crear encuestas de más de 10 opciones`
  );
});

commands.command("say", (ctx) => {
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

commands.command("tag", (ctx) => {
  const text = ctx.message.text.substring(5) ?? "";
  const number =
    text.length > 0 ? text.match(/\d+/g)?.[0] ?? '1' : '1';
  const n = parseInt(number ?? '1') > 20 ? 20 : parseInt(number ?? 1);
  // console.log(text, number, n);
  let new_victim = ctx.message.reply_to_message && ctx.message.reply_to_message.from
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
    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const forEnOrden = async () => {
      for (let i = 0; i < n; i++) {
        await sleep(1500).then(() => {
          ctx.replyWithHTML(
            `<a href="tg://user?id=${new_victim}">tag tag</a>\n<em>llamada número ${i + 1
            }</em>`
          );
        });
      }
    };
    forEnOrden();
  }
});

commands.command("set_victim", (ctx) => {
  const text = ctx.message.text.substring(12) ?? "";
  if (ctx.from.id.toString() === my_id) {
    victim = text.match(/\d+/g)?.[0] ?? '';
    victim !== '' && ctx.reply(`Ahora ${victim} es la victima`);
  }
});

commands.command("like", async (ctx) => {
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

commands.command("run", async (ctx) => {
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
    } catch (error: any) {
      if ('message' in error) ctx.replyWithHTML(error.message);
    }
  } else {
    ctx.reply("No tienes suficientes privilegios para ejecutar este comando");
  }
});

export default commands;
