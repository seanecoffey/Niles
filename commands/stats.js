const debug = require("debug")("niles:cmd");
const { totalmem } = require("os");
const { Duration } = require("luxon");
const { version } = require("discord.js");
const { discordLog } = require("~/handlers/discordLog.js");
const pkg = require("~/package.json");

module.exports = {
  name: "stats",
  description: "Display Niles bot statistics",
  aliases: ["info", "stat"],
  execute(message, args) {
    args;
    displayStats(message);
  }
};

/**
 * Display current bot stats
 * @param {Snowflake} channel - Channel to reply to 
 */
function displayStats(message) {
  debug(`displayStats | ${message.channel.guild.id}`);
  message.client.shard.fetchClientValues("guilds.cache.size").then((results) => {
    const usedMem = `${(process.memoryUsage().rss/1048576).toFixed()} MB`;
    const totalMem = (totalmem()>1073741824 ? (totalmem() / 1073741824).toFixed(1) + " GB" : (totalmem() / 1048576).toFixed() + " MB");
    const embedObj = {
      color: "RED",
      title: `Niles Bot ${pkg.version}`,
      url: "https://github.com/niles-bot/niles",
      fields: [
        {
          name: "Servers",
          value: `${results.reduce((acc, guildCount) => acc + guildCount, 0)}`,
          inline: true
        }, {
          name: "Uptime",
          value: Duration.fromObject({ seconds: process.uptime()}).toFormat("d:hh:mm:ss"),
          inline: true
        }, {
          name: "Ping",
          value: `${(message.client.ws.ping).toFixed(0)} ms`,
          inline: true
        }, {
          name: "RAM Usage",
          value: `${usedMem}/${totalMem}`,
          inline: true
        }, {
          name: "System Info",
          value: `${process.platform} (${process.arch})\n${totalMem}`,
          inline: true
        }, {
          name: "Libraries",
          value: `[Discord.js](https://discord.js.org) v${version}\nNode.js ${process.version}`,
          inline: true
        }, {
          name: "Links",
          value: `[Bot invite](https://discord.com/oauth2/authorize?permissions=97344&scope=bot&client_id=${message.client.user.id}) | [Support server invite](https://discord.gg/jNyntBn) | [GitHub](https://github.com/niles-bot/niles)`,
          inline: true
        }
      ],
      footer: { text: "Created by the Niles Bot Team" }
    };
    return message.channel.send({ embed: embedObj });
  }).catch((err) => {
    discordLog(err);
  });
}