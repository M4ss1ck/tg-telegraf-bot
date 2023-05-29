import { Composer } from 'telegraf'
import type { MyContext } from '../../interfaces'

const admin = new Composer<MyContext>()

const my_id = process.env.ADMIN_ID ?? '123'

admin.command(
  'quit',
  Composer.acl(parseInt(my_id), async (ctx) => {
    if (ctx.message.from.id.toString() === my_id) {
      ctx
        .reply(ctx.i18next.t('bye')!)
        .then(() => {
          ctx.chat.type !== 'private'
            ? ctx.telegram.leaveChat(ctx.message.chat.id)
            : ctx.reply(ctx.i18next.t('kidding')!)
        })
    }
  }),
)

admin.command(
  'admin',
  Composer.acl(parseInt(my_id), (ctx) => {
    ctx.reply(ctx.i18next.t('Eres administrador de este bot')!)
  }),
)

admin.command(
  'users',
  Composer.acl(parseInt(my_id), (ctx) => {
    const users = Object.values(global.USUARIOS).map(user => `[${user.rep}] ${user.nick} (${user.tg_id})`)
    ctx.replyWithHTML(`<pre>${JSON.stringify(users, null, 2).slice(0, 2037)}</pre>`)
  }),
)

admin.command(
  'export',
  Composer.acl(parseInt(my_id), async (ctx) => {
    await ctx.replyWithDocument({
      source: './prisma/dev.db',
      filename: 'dev.db',
    }, {
      caption: ctx.i18next.t('Database exported successfully!')!,
    })
  }),
)

export default admin
