import { Composer, Markup } from "telegraf";
import { prisma } from "../db/prisma.js";

const polls = new Composer();

// TODO: save polls in DB
let encuestas = [];

polls.command("poll", async (ctx) => {
  const text = ctx.message.text.substring(6);
  if (text.length > 0) {
    const arr = text.split(";");
    if (arr.length < 3) {
      ctx.reply("No hay suficientes opciones");
    } else {
      const question = arr[0].length > 250 ? arr[0].substring(0, 250) : arr[0];
      const options = arr
        .slice(1)
        .map((element) =>
          element.length > 100 ? element.substring(0, 100) : element
        );
      const extra = {
        is_anonymous: false,
        //protect_content: true,
        //allows_multiple_answers: true,
        //close_date: new Date(Date.now() + 60 * 60 * 1000),
      };

      const size = options.length;
      const poll_count = Math.ceil(size / 10);
      const part = Math.ceil(options.length / poll_count);
      for (let i = 0; i < poll_count; i++) {
        let option = options.slice(part * i, part * (i + 1));
        const current_question =
          poll_count > 1 ? `${question} (${i + 1}/${poll_count})` : question;
        await ctx.telegram
          .sendPoll(ctx.chat.id, current_question, option, extra)
          .then((res) => {
            const poll_chat = res.chat.id;
            const poll_id = res.poll.id;
            encuestas.push({
              chat: poll_chat,
              id: poll_id,
              options: option,
              question: current_question,
            });
          });
      }
    }
  } else {
    ctx.reply("Añade un título y opciones para la encuesta");
  }
});

polls.command(["close", "cerrar"], async (ctx) => {
  if (ctx.message.reply_to_message && ctx.message.reply_to_message.poll) {
    ctx.telegram
      .stopPoll(ctx.chat.id, ctx.message.reply_to_message.message_id)
      .then((res) => {
        let text = `<b>${res.question}</b>\n`;
        const total = res.total_voter_count;
        res.options.map(
          (e) =>
            (text += `\n<code>${e.text}</code> (${e.voter_count}/${total})`)
        );

        ctx.replyWithHTML(text);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("No puedo cerrar la encuesta");
      });
  }
});

polls.on("poll_answer", async (ctx) => {
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

    await ctx.telegram.sendMessage(encuesta.chat, text, { parse_mode: "HTML" });
  }
});

export default polls;
