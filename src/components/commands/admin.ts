import { Composer } from "telegraf";

const admin = new Composer();

const my_id = process.env.ADMIN_ID ?? '123';

admin.command(
  "quit",
  Composer.acl(parseInt(my_id), async (ctx) => {
    if (ctx.message.from.id.toString() == my_id) {
      ctx
        .reply("Me fui 👋")
        .then(() => {
          ctx.chat.type !== "private"
            ? ctx.telegram.leaveChat(ctx.message.chat.id)
            : ctx.reply("Era jugando")
        });
    }
  })
);

admin.command(
  "admin",
  Composer.acl(parseInt(my_id), (ctx) => {
    ctx.reply("Eres administrador de este bot");
  })
);

export default admin;
