import { Composer } from "telegraf";
// import { search } from "urban-dictionary-client";

const urban = new Composer();

// Urban Dictionary
urban.command("ud", async (ctx) => {
  //   const query = ctx.message.text.substring(4);
  //   console.log(query);
  //   search(query)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.error(err));
  ctx.replyWithHTML(
    `El bot está hospedado en servidores cubanos y no puede acceder a la API de Urban Dictionary`
  );
});

export default urban;
