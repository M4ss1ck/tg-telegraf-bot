module.exports = {
  apps: [
    {
      name: "massickbot",
      script: "main.js",
      node_args: "-r dotenv/config",
    },
  ],
};
