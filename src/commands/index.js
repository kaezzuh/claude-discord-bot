import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

async function loadCategory(category) {
  const dir = join(here, category);
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
  const loaded = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(join(dir, file)).href);
    loaded.push({ ...mod.default, category });
  }
  return loaded;
}

const categories = ['ai', 'moderation', 'info', 'fun', 'utility', 'leveling'];
const all = (await Promise.all(categories.map(loadCategory))).flat();

const helpModule = await import('./help.js');
all.push({ ...helpModule.default, category: 'meta' });

export const commands = all;
