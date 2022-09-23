import { Composer } from 'telegraf'
import { prisma } from '../db/prisma.js'

const createUser = new Composer()

createUser.use(async (ctx, next) => {
  if (
    ctx.from?.id
        && ctx.from?.id.toString() !== global.USUARIOS[ctx.from?.id.toString()]?.tg_id
  ) {
    global.USUARIOS[ctx.from.id.toString()] = await prisma.usuario.upsert({
      where: {
        tg_id: `${ctx.from.id}`,
      },
      create: {
        tg_id: `${ctx.from.id}`,
        rep: 0,
        nick: ctx.from.first_name,
        fecha: new Date(),
      },
      update: {},
    })
  }
  return next()
})

export default createUser
