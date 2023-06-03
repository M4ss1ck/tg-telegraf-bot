import { Composer } from 'telegraf'
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
  // get filter for that specific chat
  const filters = await prisma.filtro.findMany({
    where: {
      chat: chatId,
    },
  })

  filters.length > 0
    && filters.some((filter) => {
      const regex = new RegExp(`^${filter.filtro}$`, 'i')
      if (
        ('text' in ctx.message && ctx.message.text.match(regex))
        || ('caption' in ctx.message && ctx.message.caption?.match(regex))
      ) {
        const respuesta = JSON.parse(filter.respuesta)
        const caption = respuesta.caption ?? null
        const markup = respuesta.reply_markup ?? null
        const replyToId = ctx.message.reply_to_message ? ctx.message.reply_to_message.message_id : ctx.message.message_id

        console.log(respuesta)
        if (filter.tipo === 'text') {
          const entities = respuesta.entities as any[] || []
          // console.log('Entities:\n', entities)
          let texto_final = respuesta.text
          // FIXME: add the right type
          entities.forEach((entity: any) => {
            const { offset, length, type } = entity
            let tag
            switch (type) {
              case 'text_link':
                tag = 'a'
                break
              case 'bold':
                tag = 'b'
                break
              case 'italic':
                tag = 'i'
                break
              case 'code':
                tag = 'code'
                break
              case 'pre':
                tag = 'pre'
                break
              case 'text_mention':
                tag = 'a'
                break
              case 'strikethrough':
                tag = 's'
                break
              case 'underline':
                tag = 'u'
                break
              default:
                tag = 'i'
                break
            }
            console.log('Tag ', tag)
            texto_final = texto_final.replace(
              respuesta.text.substr(offset, length),
              `<${tag}${entity.url ? ` href="${entity.url}"` : ''
              }>${respuesta.text.substr(offset, length)}</${tag}>`,
            )
          })

          ctx.replyWithHTML(texto_final, {
            reply_to_message_id: replyToId,
            reply_markup: markup,
          })
        }
        else if (filter.tipo === 'photo') {
          ctx
            .replyWithPhoto(
              respuesta.photo[respuesta.photo.length - 1].file_id,
              {
                caption,
                reply_to_message_id: replyToId,
                reply_markup: markup,
              },
            )
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'sticker') {
          ctx
            .replyWithSticker(respuesta.sticker.file_id, {
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'voice') {
          ctx
            .replyWithVoice(respuesta.voice.file_id, {
              caption,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'video') {
          ctx
            .replyWithVideo(respuesta.video.file_id, {
              caption,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else if (filter.tipo === 'audio') {
          ctx
            .replyWithAudio(respuesta.audio.file_id, {
              caption,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        else {
          ctx
            .replyWithDocument(respuesta.document.file_id, {
              caption,
              reply_to_message_id: replyToId,
              reply_markup: markup,
            })
            .catch(err => ctx.reply(JSON.stringify(err)))
        }
        return true
      }
      return false
    })
})

export default filtros
