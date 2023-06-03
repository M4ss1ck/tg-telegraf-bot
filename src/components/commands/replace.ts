import { Composer, Markup } from 'telegraf'
import type { MyContext } from '../../interfaces'

const replacer = new Composer<MyContext>()

replacer.hears(/^\/(s|s@\w+)(\/)?$/i, ctx =>
  ctx.replyWithHTML(
    ctx.t('Debe escoger qué parte del mensaje desea reemplazar y con qué desea hacerlo.\nPor ejemplo, si tenemos un mensaje que diga "Eres feo" y queremos transformarlo en "Eres hermoso", debemos usar <code>/s/feo/hermoso</code> respondiendo dicho mensaje.\n\n<b>Nota:</b> Si el bot es administrador, borrará nuestro mensaje'),
    {
      reply_to_message_id: ctx.message.message_id,
    },
  ),
)

replacer.hears(/^\/(s|s@\w+)\/(.+)?\/(.+)?/i, (ctx) => {
  let [, , search, replace] = ctx.match
  search = search ?? ''
  replace = replace ?? ''
  // console.log(search, replace)
  let text = ''
  if (
    ctx.message.reply_to_message
  ) {
    let msg = 'text' in ctx.message.reply_to_message
      ? ctx.message.reply_to_message.text
      : 'caption' in ctx.message.reply_to_message
        ? ctx.message.reply_to_message.caption ?? ''
        : ''
    msg = msg.replace('En realidad quisiste decir: \n\n"', '')
    text
      = `<b>${ctx.t('En realidad quisiste decir')}:</b> \n\n"${msg.replace(new RegExp(search, 'g'), replace)
      }"`
    ctx
      .replyWithHTML(text, {
        reply_to_message_id: ctx.message.reply_to_message.message_id,
      })
      .then(() => {
        ctx.deleteMessage().catch(() => {
          console.log(ctx.t('No se pudo borrar el mensaje'))
          const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback(ctx.t('Borrar'), 'del')],
          ])
          ctx.replyWithHTML(ctx.t('No pude borrar el mensaje'), keyboard)
        })
      })
  }
  else {
    ctx.reply(ctx.t('Debes responder un mensaje o de lo contrario no funcionará')!, {
      reply_to_message_id: ctx.message.message_id,
    })
  }
})

export default replacer
