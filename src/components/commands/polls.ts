import { Composer } from 'telegraf'
import { prisma } from '../db/prisma.js'
import type { MyContext } from '../../interfaces.js'

const polls = new Composer<MyContext>()

polls.command('poll', async (ctx) => {
  const text = ctx.message.text.substring(6)
  if (text.length > 0) {
    const arr = text.split(';')
    if (arr.length < 3) {
      ctx.reply(ctx.t('No hay suficientes opciones')!)
    }
    else {
      const question = arr[0].length > 250 ? arr[0].substring(0, 250) : arr[0]
      const pollOptions = arr
        .slice(1)
        .map(element =>
          element.length > 100 ? element.substring(0, 100) : element,
        )
      const extra = {
        is_anonymous: false,
        // protect_content: true,
        // allows_multiple_answers: true,
        // close_date: new Date(Date.now() + 60 * 60 * 1000),
      }

      const size = pollOptions.length
      const poll_count = Math.ceil(size / 10)
      const part = Math.ceil(pollOptions.length / poll_count)
      for (let i = 0; i < poll_count; i++) {
        const option = pollOptions.slice(part * i, part * (i + 1))
        const current_question
          = poll_count > 1 ? `${question} (${i + 1}/${poll_count})` : question
        await ctx.telegram
          .sendPoll(ctx.chat.id, current_question, option, extra)
          .then(async (res) => {
            const poll_chat = res.chat.id
            const poll_id = res.poll.id
            await prisma.encuesta.upsert({
              where: {
                id: poll_id,
              },
              update: {},
              create: {
                id: poll_id,
                chat: poll_chat,
                question: current_question,
                options: {
                  create: pollOptions.map((option) => {
                    return { name: option }
                  }),
                },
              },
            })
          })
      }
    }
  }
  else {
    ctx.reply(ctx.t('Añade un título y opciones para la encuesta')!)
  }
})

polls.command(['close', 'cerrar'], async (ctx) => {
  if (ctx.message.reply_to_message && 'poll' in ctx.message.reply_to_message) {
    ctx.telegram
      .stopPoll(ctx.chat.id, ctx.message.reply_to_message.message_id)
      .then((res) => {
        let text = `<b>${res.question}</b>\n`
        const total = res.total_voter_count
        res.options.map(
          e =>
            (text += `\n<code>${e.text}</code> (${e.voter_count}/${total})`),
        )

        ctx.replyWithHTML(text)
      })
      .catch((err) => {
        console.log(err)
        ctx.reply(ctx.t('No puedo cerrar la encuesta')!)
      })
  }
})

polls.on('poll_answer', async (ctx) => {
  const id = ctx.pollAnswer.poll_id
  const encuesta = await prisma.encuesta.findUnique({
    where: {
      id,
    },
    include: {
      options: true,
    },
  })

  if (encuesta !== null) {
    const user = ctx.pollAnswer.user.first_name
    const optionId = ctx.pollAnswer.option_ids[0]
    const option = encuesta.options[optionId]
    const text
      = optionId === undefined
        ? `${user} ${ctx.t('retractó su voto en la encuesta')} <b>${encuesta.question}</b>`
        : `${user} ${ctx.t('votó por la opción')} <b>${option.name}</b> ${ctx.t('en la encuesta')} <b>${encuesta.question}</b>`

    await ctx.telegram.sendMessage(encuesta.chat, text, { parse_mode: 'HTML' }).catch(console.log)
  }
})

export default polls
