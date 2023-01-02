import { Composer } from 'telegraf'
import QRCode from 'qrcode'

const generateQR = async (text: string) => {
  try {
    return await QRCode.toDataURL(text)
  }
  catch (err) {
    console.error(err)
    return null
  }
}

const qr = new Composer()

qr.command('qr', async (ctx) => {
  const qrText = ctx.message.text.replace(/^\/qr(@\w+)?\s+/g, '')
  const img = await generateQR(qrText)
  if (img) {
    const regex = /^data:.+\/(.+);base64,(.*)$/
    const matches = img.match(regex)
    if (matches) {
      const data = matches[2]
      ctx.replyWithPhoto({ source: Buffer.from(data, 'base64') }, { caption: qrText })
    }
  }
  else {
    ctx.replyWithHTML('QR Code couldn\'t be created')
  }
})

export default qr

