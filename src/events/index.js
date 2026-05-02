import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.js') && f !== 'index.js');

const events = [];
for (const file of files) {
  const mod = await import(pathToFileURL(join(here, file)).href);
  events.push(mod.default);
}

export { events };
