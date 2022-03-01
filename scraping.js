import cheerio from "cheerio";
import axios from "axios";

const meaning = async (palabra) => {
  const mainUrl = `https://dle.rae.es/${palabra}`;
  await axios
    .get(mainUrl)
    .then((response) => {
      const result = parsing(response.data);
      console.log(result);
      return result.length;
    })
    .catch((e) => console.log(e));
};

const parsing = (html) => {
  const $ = cheerio.load(html);
  const definitions = $("resultados");
  return definitions;
};

export { meaning };
