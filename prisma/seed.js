import { PrismaClient } from "@prisma/client";
import { setRango } from "../src/utils/utils.js";

const prisma = new PrismaClient();

const my_id = process.env.ADMIN_ID ?? "";

async function main() {
  const admin = await prisma.usuario.upsert({
    where: {
      tg_id: my_id,
    },
    create: {
      tg_id: my_id,
      rep: 100,
      nick: "A",
      fecha: new Date(),
      rango: setRango(100),
    },
    update: {},
  });
  console.log("Admin:\n", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
