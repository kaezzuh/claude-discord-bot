import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';

const commandData = commands.map((c) => c.data.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log(`Registering ${commandData.length} slash commands globally...`);
  const data = await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commandData },
  );
  console.log(`Successfully registered ${data.length} commands.`);
} catch (error) {
  console.error('Failed to register commands:', error);
  process.exit(1);
}
