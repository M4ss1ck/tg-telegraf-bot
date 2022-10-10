import { Composer } from 'telegraf'

const ban = new Composer()

ban.command('b', Composer.admin(async (ctx) => {
  if (ctx.message.reply_to_message?.from) {
    const bannedId = ctx.message.reply_to_message.from.id
    await ctx
      .banChatMember(bannedId)
      .then(() => ctx.reply('Usuario baneado'))
      .catch(() => ctx.reply('Error kicking user'))
  }
}))

ban.command('k', Composer.admin(async (ctx) => {
  if (ctx.message.reply_to_message?.from) {
    const bannedId = ctx.message.reply_to_message.from.id
    await ctx
      .banChatMember(bannedId)
      .then(() => ctx.unbanChatMember(bannedId))
      .catch(() => ctx.reply('Error kicking user'))
  }
}))

export default ban
