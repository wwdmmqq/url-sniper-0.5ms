const clc = require('cli-color');
const Eris = require('eris');
const { Webhook } = require('discord-webhook-node');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.clear();
console.log(clc.blue("[INFO/Connection]"));
const setTitle = require('console-title');
setTitle("[TO BuY /darksanal]  Letthxd Discord Toll v0.1");

console.log(clc.red("Enter the module to run:"));
console.log(clc.red("1) AutoClaimer"));
console.log(clc.red("2) Turbo"));
console.log(clc.red("3) Swapper"));
console.log(clc.red("4) Discord Bot"));
console.log(clc.red("5) Speed Test"));
console.log(clc.red("6) Monitor"));
console.log(clc.red("7) Discord account ban tool"));
console.log(clc.red("8) Discord Server Mass report"));
console.log(clc.red("9) Discord Promo Gen"));
console.log(clc.red("10) TOKEN GRABBER"));
console.log(clc.red("11) Discord Log Stealer"));
console.log(clc.red("12) Discord Token Checker"))
console.log(clc.red("13) Discord Server Nuker"));;
console.log(clc.red("14) Discord Bot Login"));
console.log(clc.red("15) Webhook Spammer"));
console.log(clc.red("16) Channel Spammer"));


rl.question("> ", async (answer) => {
  switch (answer) {
    case '1':
      console.log("Running AutoClaimer module...");
      console.clear();
      setTitle('keshxrd Vanity Sniper v0.1');

      const claimedVanities = new Set();
      const maxConcurrency = 500; // Increase concurrency for better performance

      const WEBHOOKS = {
        success: "WebhookYaz",
      };
      const Token = "Yetkisi Olan Token";
      const Token2 = "Çekcegin sunucularda olan token";
      const guild = "url alıcagın sunucu idsi";
      const bot = new Eris(Token2);

      const logsPath = './logs';
      if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath);
      }

      const logStream = fs.createWriteStream(`${logsPath}/vanity_logs.txt`, { flags: 'a' });

      function logMessage(type, message) {
        const timestamp = new Date().toISOString();
        const log = `[${formatTimestamp(timestamp)}] ${formatLogType(type)} ${message}`;
        console.log(log);
        logStream.write(log + '\n');
      }

      function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = formatNumber(date.getUTCHours());
        const minutes = formatNumber(date.getUTCMinutes());
        const seconds = formatNumber(date.getUTCSeconds());
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
      }

      function formatNumber(number) {
        return number.toString().padStart(2, '0');
      }

      function formatLogType(type) {
        let logType = '';
        switch (type) {
          case 'Rest':
            logType = clc.white.bold('[SUCCESS/AutoClaimer]');
            break;
          case 'Gateway':
            logType = clc.white.bold('[INFO/Gateway]');
            break;
          case 'Discord':
            logType = clc.white.bold('[INFO/Discord]');
            break;
          default:
            logType = clc.white.bold(`[INFO/${type}]`);
            break;
        }
        return logType;
      }

      // Modify the logMessage function to print colored logs
      function logMessage(type, message) {
        const timestamp = new Date().toISOString();
        const log = `[${formatTimestamp(timestamp)}] ${formatLogType(type)} ${message}`;
        console.log(getColoredLog(type, log));
        logStream.write(log + '\n');
      }

      // Define color mappings for different log types
      const logColors = {
        Rest: clc.green,
        Gateway: clc.blue,
        Discord: clc.yellow,
        AutoClaimer: clc.white,
        // Add more log types and colors as needed
      };

      // Function to get colored log output based on log type
      function getColoredLog(type, log) {
        const colorFunction = logColors[type] || clc.white;
        return colorFunction(log);
      }

      bot.on('error', (err) => {
        logMessage(`WebSocket Error: ${err}`);
      });

      const Data = {};

      bot.on('rawWS', async (packet) => {
        if (packet.t === "READY") {
          const { d: data } = packet;
          logMessage('Rest', `[${guild}] Can claim vanity on this server!`);
          logMessage('Gateway', `Logged in as keshxrd.#0`);
          logMessage('Gateway', `Monitoring 100% of vanities`);
          const guilds = data.guilds.reduce((acc, guild) => {
            acc[guild.id] = guild;
            return acc;
          }, {});

          Object.values(guilds).forEach((guild) => {
            if (guild.vanity_url_code) {
              Data[guild.id] = [guild.vanity_url_code, guild.id, guild.id];
            }
          });

          const batchSize = Math.ceil(Object.keys(Data).length / maxConcurrency);

          const batchedData = Object.entries(Data).reduce((batches, [key, value]) => {
            console.log(`${clc.yellow.bold("Server Vanity : ")}  [${clc.magenta.bold(value[0])}] || ${clc.yellow("Server Name :")} [${clc.magenta.bold(guilds[value[1]].name)}] || ${clc.yellow("Server Id :")} [${clc.magenta.bold(guilds[value[1]].id)}]`);
            const guild = guilds[value[1]];

            if (guild.vanity_url_code !== value[0]) {
              const batchIndex = Math.floor(batches.length / batchSize);
              if (!batches[batchIndex]) {
                batches[batchIndex] = [];
              }
              batches[batchIndex].push(value);
            }

            return batches;
          }, []);

          // Process batches in parallel with concurrency limit
          await Promise.all(batchedData.map((batch) => processBatch(batch)));
        } else if (packet.t === "GUILD_UPDATE") {
          const { d: data } = packet;

          const updatedGuilds = Object.entries(Data).filter(([key, value]) => {
            return data.id === value[1] && data.vanity_url_code !== value[0];
          });

          await Promise.all(updatedGuilds.map(([key, value]) => tryClaimVanity(value)));
        }
      });

      bot.connect();

      process.on("unhandledRejection", (error) => {
        console.log(error);
      });

      async function processBatch(batch) {
        await Promise.all(batch.map(tryClaimVanity));
      }

      async function tryClaimVanity(value) {
        try {
          if (claimedVanities.has(value[0])) {
            logMessage('Discord', `Vanity ${value[0]} is already claimed. Skipping...`);
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 0));

          const startTime = Date.now();          
          await axios.patch(
            `https://discord.com/api/v10/guilds/${guild}/vanity-url`,
            { code: value[0] },
            { headers: { authorization: Token } }
          );
          const endTime = Date.now();
          const elapsedMilliseconds = endTime - startTime;
          const elapsedSeconds = (elapsedMilliseconds / 1000).toFixed(3);
          const elapsedaasd = elapsedMilliseconds.toFixed(0);

          logMessage('Discord', `Claiming vanity ${value[0]} in guild ${guild}`);
          logMessage('Discord', `Claimed ${value[0]} in ${elapsedMilliseconds}ms (${elapsedSeconds}s): ${guild}`);
          logMessage('Discord', JSON.stringify({ code: value[0], uses: 0 }));
          await sendSuccessWebhook(value[0], guild, elapsedSeconds, elapsedaasd);

          claimedVanities.add(value[0]);
        } catch (err) {
          logMessage('AutoClaimer', 'No guilds left to claim!');
        }
      }

      async function sendWebhook(url, data) {
        try {
          await axios.post(url, data);
        } catch (error) {
          console.error("Error sending webhook:", error);
        }
      }

      async function sendSuccessWebhook(vanityUrlCode, guildId, elapsedSeconds, elapsedaasd) {
        const data = {
          content: "||@everyone||",
          embeds: [
            {
              title: "Vanity Claimed",
              fields: [
                {
                  name: "Vanity URL",
                  value: "```" + vanityUrlCode + "                       ```",
                },
                {
                  name: "Guild",
                  value: "```" + guild + "                       ```",
                },
                {
                  name: "Accuracy",
                  value: "```" + elapsedSeconds + "s                       ```",
                },
                {
                  name: "Speed",
                  value: "```" + elapsedaasd + "ms                       ```",
                },
                {
                  name: "Source",
                  value: "```Guild Update                       ```",
                },
              ],
              color: 3447003,
              footer: {
                text: "Vanity sniper ",
              },
            },
          ],
        };

        try {
          await sendWebhook(WEBHOOKS.success, data); // Use the "success" webhook URL
        } catch (error) {
          console.error("Error sending success webhook:", error);
        }
      }
      break;
    case '2':
      console.log("Running Turbo module...");
      console.log("We are currently working on it.");
      break;
    case '3':
      console.log("Running Swapper module...");
      console.log("We are currently working on it.");
      break;
    case '4':
      console.log("Running AutoClaimer module....");
      console.log("We are currently working on it.");
      break;
    case '5':
      console.log("Running Speed Test module...");
      console.log("We are currently working on it.");
      break;
    case '6':
      console.log("Running Monitor module...");
      console.log("We are currently working on it.");
      break;
    default:
      console.log("We are currently working on it.");
      break;
  }
  
  rl.close();
});
