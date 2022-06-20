import pkg from "pg";
import fs from "fs";
import fastcsv from "fast-csv";
const { Pool } = pkg;

const credenciales = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
};

const pool = new Pool(credenciales);

function query(text, params, callback) {
  //const start = Date.now();
  return pool.query(text, params, (err, res) => {
    if (res) {
      //const duration = Date.now() - start;
      console.log(`[QUERY]: "${text}"`);
    }
    if (callback) {
      callback(err, res);
    }
  });
}

async function anotherQuery(text, params) {
  //const start = Date.now();
  const res = await pool.query(text, params);
  //const duration = Date.now() - start;
  console.log(`[QUERY2]: "${text}"`);
  //await pool.end();
  return res;
}
// función específica para buscar un usuario de la BD y actualizar un valor
function updateUserStat(id, key, value) {
  const text = `UPDATE usuarios SET ${key} = '${value}', fecha = now() WHERE tg_id = '${id}' RETURNING *`;
  query(text.toString(), [], (err, res) => {
    if (err) {
      console.log("[ERROR UPDATING]");
      console.log(err.stack);
      console.log(text);
    } else {
      console.log(`[${key} actualizado]`);
      console.log(res.rows[0].nick);
      //console.log(res);
    }
  });
}

// función para exportar la BD a un archivo CSV
async function exportTable(nombre) {
  //const path = process.cwd();
  //console.log("Export table " + nombre);
  query(`SELECT * FROM ${nombre}`, [], (err, res) => {
    if (err) {
      console.error(err.stack);
    } else {
      const jsonData = JSON.parse(JSON.stringify(res.rows));
      //console.log("\njsonData:", jsonData);
      // exportar bd a csv
      try {
        fastcsv
          .writeToPath(`${nombre}.csv`, jsonData, { headers: true })
          .on("finish", function () {
            console.log(`Tabla ${nombre} exportada correctamente.`);
          });
      } catch (error) {
        console.log(error);
      }
    }
  });
}

// funcion para importar una tabla CSV a la BD
async function importTable(name, data) {
  const path = process.cwd();
  fs.writeFileSync(`${path}/${name}.csv`, data, "utf8");
  console.log(`${name}.csv creado con url ${path}/${name}.csv`);
  query(
    `COPY ${name} FROM '${path}/${name}.csv' DELIMITER ',' CSV HEADER`,
    [],
    (err, res) => {
      if (err) {
        console.error(err.stack);
      } else {
        console.log(`Tabla ${name} importada correctamente.`);
      }
    }
  );
}

function borrarBD(url) {
  fs.unlink(url, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

// check if table exists, if not create it, then update it
async function checkIfCmdProceed(COMMAND_ID, chat_id) {
  const res = await anotherQuery(
    `SELECT * FROM config WHERE chat_id = '${chat_id}'`,
    []
  );
  let new_config = "";
  if (res.rows === undefined || res.rows[0] === undefined) {
    new_config = JSON.stringify({
      [COMMAND_ID]: "on",
    });
    const values = [chat_id, new_config];
    const upd = await anotherQuery(
      "INSERT INTO config(chat_id, opciones) VALUES($1, $2)",
      values
    );
    console.log(upd);
    return true;
  } else {
    const current_config = JSON.parse(res.rows[0].opciones);
    if (current_config[COMMAND_ID] === "on") {
      return true;
    } else {
      current_config[COMMAND_ID] === "off";
      new_config = JSON.stringify(current_config);
      await anotherQuery(
        `UPDATE config SET opciones = '${new_config}' WHERE chat_id = '${chat_id}' RETURNING *`,
        []
      );
      return current_config[COMMAND_ID] === "off" ? false : true;
    }
  }
}

export {
  query,
  updateUserStat,
  exportTable,
  importTable,
  borrarBD,
  checkIfCmdProceed,
  anotherQuery,
};
