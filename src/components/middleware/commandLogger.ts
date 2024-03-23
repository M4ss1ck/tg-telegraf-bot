import { Composer } from 'telegraf'
import { callbackQuery, message } from "telegraf/filters"

const logger = new Composer()

logger.use(async (ctx, next) => {
    try {
        let messageText = `[${ctx.from?.id.toString() ?? 'n/a'}] `
        if (ctx.has(message('text')) && ctx.message.text.startsWith('/')) {
            messageText += `[command] ${ctx.message.text}`
            console.log(messageText)
        } else if (ctx.has(callbackQuery('data'))) {
            messageText += `[action] ${ctx.callbackQuery.data}`
            console.log(messageText)
        } else if ('inlineQuery' in ctx && ctx.inlineQuery?.query) {
            messageText += `[inline] ${ctx.inlineQuery.query}`
            console.log(messageText)
        }
    } catch (error) {
        console.log('Error in logger middleware')
        console.log(error)
    }
    return next()
})

export default logger
