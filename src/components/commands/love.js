import { Composer } from "telegraf";
import { prisma } from "../db/prisma.js";

const love = new Composer();

love.command("love", async (ctx) => {
  //   const now = new Date();
  //console.log(now, loveTime, now - loveTime);
  //   const time = "\nSiguiente pareja en " + timeToNext(now - loveTime);
  const users = await prisma.usuario.findMany({
    select: {
      tg_id: true,
      nick: true,
    },
  });
  const i = Math.floor(Math.random() * users.length);
  const lover1 = users[i];
  const filteredUsers = users.filter((user) => user.tg_id !== lover1.tg_id);
  const j = Math.floor(Math.random() * filteredUsers.length);
  const lover2 = filteredUsers[j];
  if (!lover2) {
    ctx.replyWithHTML(
      `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> consigo mismo/a`
    );
  } else {
    ctx.replyWithHTML(
      `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> 💘 <a href="tg://user?id=${lover2.tg_id}">${lover2.nick}</a>`
    );
  }

  //   if (now - loveTime > 1000 * 60 * 60 * 24) {
  //     const query = "SELECT nick, tg_id FROM usuarios";
  //     await anotherQuery(query).then((res) => {
  //       const users = res.rows;
  //       const i = Math.floor(Math.random() * users.length);
  //       const j = Math.floor(Math.random() * users.length);
  //       const lover1 = users[i];
  //       const lover2 = users[j];
  //       if (lover1.nick === lover2.nick) {
  //         ctx.replyWithHTML(
  //           `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> consigo mismo/a\n<em>${time}</em>`
  //         );
  //       } else {
  //         ctx.replyWithHTML(
  //           `<b>Pareja del día:</b>\n\n<a href="tg://user?id=${lover1.tg_id}">${lover1.nick}</a> 💘 <a href="tg://user?id=${lover2.tg_id}">${lover2.nick}</a>\n<em>${time}</em>`
  //         );
  //       }
  //       loveTime = new Date();
  //       couple = [lover1, lover2];
  //     });
  //   } else {
  //     if (couple[0].nick === couple[1].nick) {
  //       ctx.replyWithHTML(
  //         `<b>Pareja del día:</b>\n\n<b>${couple[0].nick}</b> consigo mismo/a\n<em>${time}</em>`
  //       );
  //     } else {
  //       ctx.replyWithHTML(
  //         `<b>Pareja del día:</b>\n\n<b>${couple[0].nick}</b> 💘 <b>${couple[1].nick}</b>\n<em>${time}</em>`
  //       );
  //     }
  //   }
});

export default love;
