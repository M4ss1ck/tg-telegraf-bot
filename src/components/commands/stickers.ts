import { unlink } from 'fs/promises'
import { Composer } from 'telegraf'
import Jimp from 'jimp'
import sharp from 'sharp'
import type { MyContext } from '../../interfaces'

const stickers = new Composer<MyContext>()

stickers.command('q', async (ctx) => {
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.from) {
        try {
            const messagePhoto = 'photo' in ctx.message.reply_to_message ? ctx.message.reply_to_message.photo.pop() : undefined
            let photoHeight = 0
            let textHeight = 0
            let messagePhotoSharp, message
            let path = `images/sticker_${Date.now()}.png`
            // const dest = path.replace('.png', '.webp')
            if (messagePhoto) {
                const link = await ctx.telegram.getFileLink(messagePhoto.file_id)
                const imgJimp = await Jimp.read(link.href)
                // Set the maximum width and height of the resized image
                const maxWidth = 412;
                const maxHeight = 512;
                // Get the current dimensions of the image
                const { width, height } = messagePhoto;
                // Calculate the scale factor for each dimension
                const scaleFactorX = maxWidth / width;
                const scaleFactorY = maxHeight / height;
                // Use the smaller scale factor to resize the image
                const scaleFactor = Math.min(scaleFactorX, scaleFactorY);
                const newWidth = Math.round(width * scaleFactor);
                const newHeight = Math.round(height * scaleFactor);

                imgJimp.resize(newWidth, newHeight)
                photoHeight = newHeight


                await imgJimp.writeAsync(path)

                messagePhotoSharp = await sharp(path)
                    .webp()
                    .toBuffer()

                await unlink(path)
            }

            const user = await ctx.telegram.getUserProfilePhotos(ctx.message.reply_to_message.from.id)

            const userImg = user.photos && user.photos.length > 0 ? user.photos[0].pop() : undefined

            path = `images/profile_${Date.now()}.png`
            const dest = path.replace('.png', '.webp')
            if (userImg) {
                const link = await ctx.telegram.getFileLink(userImg.file_id)
                const imgJimp = await Jimp.read(link.href)

                await imgJimp.writeAsync(path)
            }

            if ('text' in ctx.message.reply_to_message || 'caption' in ctx.message.reply_to_message) {
                let text: string | undefined
                if ('text' in ctx.message.reply_to_message) {
                    text = ctx.message.reply_to_message.text
                } else if ('caption' in ctx.message.reply_to_message) {
                    text = ctx.message.reply_to_message.caption
                }
                if (text) {
                    const textBox = sharp({
                        text: {
                            text: `<span background="#2b5278" foreground="white">${text}</span>`,
                            width: 400,
                            // height: 512,
                            font: 'Arial',
                            justify: true,
                            dpi: 200,
                            rgba: true,
                        },
                    })
                    textHeight = (await textBox.metadata()).height ?? 512
                    const textBuffer = await textBox.webp().toBuffer()

                    message = await sharp(
                        Buffer.from(
                            `<svg><rect x="0" y="0" width="410" height="${textHeight + 20}" rx="20" ry="20" style="fill: #2b5278;"/></svg>`
                        )
                    )
                        .webp().composite([
                            {
                                input: textBuffer,
                                blend: 'over'
                            },
                        ]).toBuffer()
                }
            }

            const profile = userImg ? sharp(path) : sharp({
                text: {
                    text: ctx.message.reply_to_message.from.first_name.split('')[0],
                    width: 100,
                    height: 100,
                    font: 'sans',
                    justify: true,
                    // dpi: 300,
                },
            })

            const profilePic = await profile.resize(textHeight > 0 ? Math.max(Math.min(100, textHeight), 50) : 100, textHeight > 0 ? Math.max(Math.min(100, textHeight), 50) : 100, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
                .composite([{
                    input: Buffer.from(
                        `<svg><circle cx="${textHeight > 0 ? Math.floor(Math.max(Math.min(100, textHeight), 50) / 2) : 50}" cy="${textHeight > 0 ? Math.floor(Math.max(Math.min(100, textHeight), 50) / 2) : 50}" r="${textHeight > 0 ? Math.floor(Math.max(Math.min(100, textHeight), 50) / 2) : 50}"/></svg>`
                    ),
                    blend: 'dest-in',
                }])
                .webp()
                .toBuffer()


            const background = sharp({
                create: {
                    width: 512,
                    height: Math.max(120, textHeight + 30) + photoHeight,
                    background: { r: 255, g: 255, b: 255, alpha: 0 },
                    channels: 4,
                }
            }).webp()

            const compositeArray = [{ input: profilePic, left: 0, top: 0 }]
            if (messagePhotoSharp) {
                compositeArray.push({ input: messagePhotoSharp, left: textHeight > 0 ? Math.max(Math.min(100, textHeight), 50) : 100, top: 0 })
            }

            if (message) {
                compositeArray.push({ input: message, left: textHeight > 0 ? Math.max(Math.min(100, textHeight), 50) : 100, top: photoHeight })
            }

            background.composite(compositeArray)
                .toFile(dest)
                .then(async () => {
                    ctx.replyWithSticker({ source: dest }).catch(console.error)
                    try {
                        await unlink(path)
                        await unlink(dest)
                    } catch (error) {
                        console.error(error)
                    }
                })
                .catch((err) => {
                    console.error(err);
                });


        } catch (error) {
            console.error(error)
        }
    }
})

stickers.command('sticker', async (ctx) => {
    if (ctx.message.reply_to_message) {
        try {
            const messagePhoto = 'photo' in ctx.message.reply_to_message ? ctx.message.reply_to_message.photo.pop() : undefined
            if (messagePhoto) {
                const link = await ctx.telegram.getFileLink(messagePhoto.file_id)
                const imgJimp = await Jimp.read(link.href)
                // Set the maximum width and height of the resized image
                const maxWidth = 512;
                const maxHeight = 512;
                // Get the current dimensions of the image
                const { width, height } = messagePhoto;
                // Calculate the scale factor for each dimension
                const scaleFactorX = maxWidth / width;
                const scaleFactorY = maxHeight / height;
                // Use the smaller scale factor to resize the image
                const scaleFactor = Math.min(scaleFactorX, scaleFactorY);
                const newWidth = Math.round(width * scaleFactor);
                const newHeight = Math.round(height * scaleFactor);

                imgJimp.resize(newWidth, newHeight)

                const path = `images/sticker_${Date.now()}.png`
                const dest = path.replace('.png', '.webp')
                await imgJimp.writeAsync(path)

                sharp(path)
                    .webp()
                    .toFile(dest)
                    .then(async () => {
                        await ctx.replyWithSticker({ source: dest }).catch(console.error)
                        await unlink(dest)
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        } catch (error) {
            console.error(error)
        }
    }
})

export default stickers
