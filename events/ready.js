const { ActivityType } = require('discord.js');
const Discord = require('discord.js');
const db = require('quick.db');
const { prefix } = require('../config.json');
const { joinVoiceChannel } = require('@discordjs/voice');
const distube = require('../client/distube');
const { Utils } = require("devtools-ts");
const utilites = new Utils();

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    try {
      console.log((`Logged in as ${client.user.tag}`).red);
      console.log((`Servers: ${client.guilds.cache.size}`).magenta, (`Users: ${client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString()}`).yellow, (`Commands: ${client.commands.size}`).green);

      // Initial set status and activity
      client.user.setStatus("idle");
      
      let activities = [
        ` in ${client.guilds.cache.size} servers.`,
        `The Holy Quran `
      ];
      
      let activityIndex = 0;
      client.user.setActivity(activities[activityIndex], { type: ActivityType.Listening });

      // Update activity in a loop
      setInterval(() => {
        activityIndex = (activityIndex + 1) % activities.length;
        client.user.setActivity(activities[activityIndex], { type: ActivityType.Listening });
      }, 40000  ); // 60000 milliseconds = 1 minute

      // Check and join voice channels every 7 seconds
      setInterval(async () => {
        client.guilds.cache.forEach(async g => {
          let vch = await db.get(`24_7_${g.id}`);
          if (vch == null) return;
          let ch = client.channels.cache.get(vch);
          if (ch == null) return db.delete(`24_7_${g.id}`);
          const clientMember = g.members.cache.get(client.user.id);
          const checkJoined = clientMember?.voice?.channelId == ch.id;
          if (!checkJoined) {
            console.log(checkJoined);
            try {
              await distube.voices.join(ch);
            } catch (e) {
              console.log("connection", e);
            }
          }
        });
      }, 7000);

    } catch (err) {
      console.log(err);
    }
  }
};
