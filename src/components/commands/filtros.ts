import { Composer } from 'telegraf'
import { toHTML } from "@telegraf/entity"
import { prisma } from '../db/prisma.js'
import type { MyContext } from '../../interfaces.js'

const filtros = new Composer<MyContext>()

// añadir un atajo
filtros.command('add', async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (ctx.message.reply_to_message && ctx.message.text.length > 4) {
    const trigger = ctx.message.text.replace('/add ', '')

    if (trigger.length > 0) {
      const answer = JSON.stringify(ctx.message.reply_to_message)
      let type
      if ('text' in ctx.message.reply_to_message)
        type = 'text'
      else if ('photo' in ctx.message.reply_to_message)
        type = 'photo'
      else if ('voice' in ctx.message.reply_to_message)
        type = 'voice'
      else if ('video' in ctx.message.reply_to_message)
        type = 'video'
      else if ('sticker' in ctx.message.reply_to_message)
        type = 'sticker'
      else if ('audio' in ctx.message.reply_to_message)
        type = 'audio'
      else
        type = 'document'

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
      })

      ctx.replyWithHTML(
        ctx.t('Filter added', { trigger })!,
      )
    }
    else {
      ctx.replyWithHTML(ctx.t('Debe escribir un filtro'))
    }
  }
})
// remover filtro
filtros.command('rem', async (ctx) => {
  const chatId = ctx.chat.id.toString()
  const trigger = ctx.message.text.replace('/rem ', '')
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
      ctx.replyWithHTML(ctx.t('Filter eliminated', { trigger })),
    )
    .catch(() =>
      ctx.replyWithHTML(ctx.t('Filter doesn\'t exist', { trigger })),
    )
})

filtros.command(['filters', 'filtros'], async (ctx) => {
  const chatId = ctx.chat.id.toString()
  const filtros = await prisma.filtro.findMany({
    where: {
      chat: chatId,
    },
    select: {
      filtro: true,
    },
  })
  const filtrosTexto
    = filtros.length > 0
      ? `<code>${filtros.map(f => f.filtro).join('</code>\n<code>')}</code>`
      : ctx.t('<i>No se encontraron filtros</i>')

  ctx.replyWithHTML(`<b>${ctx.t('Lista de filtros:')}</b>\n${filtrosTexto}`)
})

filtros.on('message', async (ctx) => {
  const chatId = ctx.chat.id.toString() ?? 'global'
  // get filters for that specific chat
  const filters = await prisma.filtro.findMany({
    where: {
      chat: chatId,
    },
  })

  for (const filter of filters) {
    try {
      const regex = new RegExp(`^${filter.filtro}$`, 'i')
      if (('text' in ctx.message && ctx.message.text.match(regex))
        || ('caption' in ctx.message && ctx.message.caption?.match(regex))) {
        const respuesta = JSON.parse(filter.respuesta)
        // const caption = respuesta.caption ?? null
        const markup = respuesta.reply_markup ?? null
        const replyToId = ctx.message.reply_to_message ? ctx.message.reply_to_message.message_id : ctx.message.message_id
        const html = toHTML(respuesta)

        if (filter.tipo === 'text') {
          return ctx.replyWithHTML(html, {
            reply_to_message_id: replyToId,
            reply_markup: markup,
          })
        }
        else if (filter.tipo === 'photo') {
          return ctx
            .replyWithPhoto(
              respuesta.photo[respuesta.photo.length - 1].file_id,
              {
                caption: html,
                reply_to_message_id: replyToId,
                reply_markup: markup,
              },
            )
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'sticker') {
          return ctx
            .replyWithSticker(respuesta.sticker.file_id, {
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'voice') {
          return ctx
            .replyWithVoice(respuesta.voice.file_id, {
              caption: html,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'video') {
          return ctx
            .replyWithVideo(respuesta.video.file_id, {
              caption: html,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'audio') {
          return ctx
            .replyWithAudio(respuesta.audio.file_id, {
              caption: html,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else {
          return ctx
            .replyWithDocument(respuesta.document.file_id, {
              caption: html,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
})

export default filtros
