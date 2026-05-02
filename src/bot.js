import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import { commands } from './commands/index.js';
import { events } from './events/index.js';
import { startReminderScheduler, stopReminderScheduler } from './lib/reminders.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

for (const event of events) {
  client.on(event.name, (...args) => event.execute(...args));
}

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`Loaded ${commands.length} commands across ${new Set(commands.map((cmd) => cmd.category)).size} categories`);
  console.log(`Serving ${c.guilds.cache.size} guild(s)`);
  startReminderScheduler(c);
});

const shutdown = () => {
  console.log('Shutting down...');
  stopReminderScheduler();
  client.destroy();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.login(process.env.DISCORD_TOKEN);
