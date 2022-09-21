import { PrismaClient } from "@prisma/client";

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

function setRango(rep) {
  if (rep > 249) {
    return "ADMIN EMPODERADO";
  } else if (rep > 199) {
    return "JOHN WICK ";
  } else if (rep > 149) {
    return "FAMILIA (A LO TORETTO)";
  } else if (rep > 99) {
    return "ESTRELLA EN ASCENSO";
  } else if (rep > 49) {
    return "VICIOSO";
  } else if (rep > 19) {
    return "GRACIOSO (PERO NO TANTO)";
  } else if (rep > -1) {
    return "DESCONOCIDO";
  } else if (rep > -11) {
    return "REGGAETONERO";
  } else if (rep > -21) {
    return "LATINOAMERICANO";
  } else if (rep > -31) {
    return "YACEL";
  } else {
    return "SECUAZ DE ETECSA";
  }
}
