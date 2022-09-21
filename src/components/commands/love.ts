import { Composer } from 'telegraf'
import { prisma } from '../db/prisma.js'

const love = new Composer()

love.command('love', async (ctx) => {
  //   const now = new Date();
  // console.log(now, loveTime, now - loveTime);
  //   const time = "\nSiguiente pareja en " + timeToNext(now - loveTime);
  const users = await prisma.usuario.findMany({
    select: {
      tg_id: true,
      nick: true,
    },
  })
  const i = Math.floor(Math.random() * users.length)
  const lover1 = users[i]
  const filteredUsers = users.filter(user => user.tg_id !== lover1.tg_id)
  const j = Math.floor(Math.random() * filteredUsers.length)
  const lover2 = filteredUsers[j]
  if (!lover2) {
    ctx.replyWithHTML(
      `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> consigo mismo/a`,
    )
  }
  else {
    ctx.replyWithHTML(
      `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> 💘 <a href="tg://user?id=${lover2.tg_id}">${lover2.nick}</a>`,
    )
  }
})

export default love
