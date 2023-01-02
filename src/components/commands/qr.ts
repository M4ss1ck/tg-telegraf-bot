import { Composer } from 'telegraf'
import QRCode from 'qrcode'
import Jimp from 'jimp'
import QRReader from 'qrcode-reader'

const generateQR = async (text: string) => {
  try {
    return await QRCode.toDataURL(text)
  }
  catch (err) {
    console.error(err)
    return null
  }
}

const decodeQR = async (url: string) => {
  const img = await Jimp.read(url)
  const qr = new QRReader()
  const value = await new Promise((resolve, reject) => {
    qr.callback = (err: any, v: any) => err != null ? reject(err) : resolve(v)
    qr.decode(img.bitmap)
  })
  return value as any
}

const qr = new Composer()

qr.command('qr', async (ctx) => {
  if (ctx.message.reply_to_message && 'photo' in ctx.message.reply_to_message) {
    const img = ctx.message.reply_to_message.photo.shift()
    if (img) {
      const link = await ctx.telegram.getFileLink(img.file_id)
      const code = await decodeQR(link.href)
      if (code && code.result) {
        ctx
          .replyWithHTML(code.result, { reply_to_message_id: ctx.message.message_id })
          .catch(e => console.log(e))
      }
    }
  }
  else {
    const qrText = ctx.message.text.replace(/^\/qr((@\w+)?\s+)?/g, '')
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
      ctx.replyWithHTML('QR Code couldn\'t be created')
    }
  }
})

export default qr

