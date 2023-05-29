import { Composer } from 'telegraf'
import type { MyContext } from '../../interfaces'

const ban = new Composer<MyContext>()

ban.command('b', Composer.admin(async (ctx) => {
  if (ctx.message.reply_to_message?.from) {
    const bannedId = ctx.message.reply_to_message.from.id
    await ctx
      .banChatMember(bannedId)
      .then(() => ctx.reply(ctx.t('Usuario baneado')!))
      .catch(() => ctx.reply(ctx.t('Error kicking user')!))
  }
}))

ban.command('k', Composer.admin(async (ctx) => {
  if (ctx.message.reply_to_message?.from) {
    const bannedId = ctx.message.reply_to_message.from.id
    await ctx
      .banChatMember(bannedId)
      .then(() => ctx.unbanChatMember(bannedId))
      .catch(() => ctx.reply(ctx.t('Error kicking user')!))
  }
}))

export default ban
