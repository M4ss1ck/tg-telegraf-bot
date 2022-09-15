import { Composer } from "telegraf";
import { prisma } from "../db/prisma.js";

const filtros = new Composer();

// añadir un atajo
filtros.command("add", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  if (ctx.message.reply_to_message) {
    const trigger = ctx.message.text.replace("/add ", "");

    if (trigger.length > 0) {
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

      await prisma.filtro.upsert({
        where: {
          filtro_chat: {
            filtro: trigger,
            chat: chatId,
          },
        },
        create: {
          filtro: trigger,
          chat: chatId,
          tipo: type,
          respuesta: answer,
        },
        update: {
          tipo: type,
          respuesta: answer,
        },
      });

      ctx.replyWithHTML(
        `Agregado/actualizado el filtro <code>${trigger}</code>`
      );
    } else {
      ctx.replyWithHTML(`Debe escribir un filtro`);
    }
  }
});
//remover filtro
filtros.command("rem", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const trigger = ctx.message.text.replace("/rem ", "");
  await prisma.filtro
    .delete({
      where: {
        filtro_chat: {
          filtro: trigger,
          chat: chatId,
        },
      },
    })
    .then(() =>
      ctx.replyWithHTML(`Se eliminó el filtro <code>${trigger}</code>`)
    )
    .catch(() =>
      ctx.replyWithHTML(`El filtro "<code>${trigger}</code>" no existe`)
    );
});

filtros.command(["filters", "filtros"], async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const filtros = await prisma.filtro.findMany({
    where: {
      chat: chatId,
    },
    select: {
      filtro: true,
    },
  });
  const filtrosTexto =
    filtros.length > 0
      ? `<code>${filtros.map((f) => f.filtro).join("</code>\n<code>")}</code>`
      : "<i>No se encontraron filtros</i>";
  console.log(filtrosTexto);
  ctx.replyWithHTML("<b>Lista de filtros:</b>\n" + filtrosTexto);
});

export default filtros;
