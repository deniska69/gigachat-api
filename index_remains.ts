import DB from './services/db.js';
import GPT from './services/gpt.js';
import { handlingInterrupt, logBalance, logRemaining } from './services/helpers.js';

console.clear();

const gpt = new GPT();
const db = new DB();

await db.init();

handlingInterrupt(db);

await logRemaining(db, 'log_remains.txt');
await logBalance(gpt, 'log_remains.txt');
