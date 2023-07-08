import { Composer } from 'telegraf'
import QRCode from 'qrcode'
import Jimp from 'jimp'
import jsQR from 'jsqr'
import type { MyContext } from '../../interfaces'

const generateQR = async (text: string) => {
  try {
    return await QRCode.toDataURL(text)
  }
  catch (err) {
    console.error(err)
    return null
  }
}

const qr = new Composer<MyContext>()

qr.command('qr', async (ctx) => {
  if (ctx.message.reply_to_message && 'photo' in ctx.message.reply_to_message) {
    try {
      const img = ctx.message.reply_to_message.photo.pop()
      if (img) {
        const link = await ctx.telegram.getFileLink(img.file_id)
        const imgJimp = await Jimp.read(link.href)
        const array = new Uint8ClampedArray(imgJimp.bitmap.data.buffer)
        const code = jsQR(array, img.width, img.height)
        if (code && code.data) {
          ctx
            .replyWithHTML(code.data, { reply_to_message_id: ctx.message.message_id, disable_web_page_preview: true })
            .catch(e => console.log(e))
        }
        else {
          ctx
            .replyWithHTML(ctx.t('No data found on image file.\nIf you are sure there\'s a QR Code, blame <a href="https://github.com/cozmo/jsQR">the library</a>'), { reply_to_message_id: ctx.message.message_id, disable_web_page_preview: true })
            .catch(e => console.log(e))
        }
      }
    }
    catch (error) {
      console.log(error)
      ctx
        .replyWithHTML(ctx.t('Uncaught error while reading the code'), { reply_to_message_id: ctx.message.message_id })
        .catch(e => console.log(e))
    }
  }
  else {
    try {
      const qrText = ctx.message.reply_to_message && 'text' in ctx.message.reply_to_message ? ctx.message.reply_to_message.text : ctx.message.text.replace(/^\/qr((@\w+)?\s+)?/g, '')
      const img = await generateQR(qrText)
      if (img && qrText.length > 0) {
        const regex = /^data:.+\/(.+);base64,(.*)$/
        const matches = img.match(regex)
        if (matches) {
          const data = matches[2]
          ctx.replyWithPhoto({ source: Buffer.from(data, 'base64') })
        }
      }
      else {
        ctx.replyWithHTML(ctx.t('QR Code couldn\'t be created'))
      }
    }
    catch (error) {
      console.log(error)
      ctx
        .replyWithHTML(ctx.t('Uncaught error while creating the code'), { reply_to_message_id: ctx.message.message_id })
        .catch(e => console.log(e))
    }
  }
})

export default qr

