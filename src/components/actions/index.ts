import { Composer } from 'telegraf'

const actions = new Composer()

actions.action('del', ctx => ctx.deleteMessage())

export default actions
