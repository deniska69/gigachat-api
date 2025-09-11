import * as fs from 'fs';
import DB from './services/db.js';
import { writeLogs, handlingInterrupt, normalizeText } from './services/helpers.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const iconv = require('iconv-lite');

console.clear();

const db = new DB();

await db.init();

handlingInterrupt(db);

const CODIROVKA = 'windows-1251';

const logging = async (text: string) => await writeLogs(text, 'log_csv.txt');

const writeCSV = async () => {
	await logging('\n[СТАРТ] записи БД в CSV');
	await db.read();

	const items = db.db?.data.items;
	if (!items) return console.error('[Error] items:', undefined);

	let counter = 0;
	let text = '';

	text += `name;title;description;keywords\r\n`;

	for (const item of items) {
		counter++;

		try {
			const name = normalizeText(item.name);
			const title = normalizeText(item.title || '');
			const description = normalizeText(item.description || '');
			const keywords = normalizeText(item.keywords || '');

			text += `${name};${title};${description};${keywords}\r\n`;

			const logMessage = `${counter}/${items.length} | ${item.name} - Успешно ✅`;
			console.log(logMessage);
			await logging(`${logMessage}`);
		} catch (error) {
			const logMessage = `${counter}/${items.length} | ${item.name} - Ошибка ❌`;
			console.log(logMessage);
			console.log(error);
			await logging(logMessage);
			await logging(JSON.stringify(error));
			break;
		}
	}

	const textEncoded = iconv.encode(text, CODIROVKA);

	fs.writeFile('result.csv', textEncoded, async (error) => {
		if (error) {
			const logMessage = '\nОшибка записи CSV ❌';
			console.log(logMessage);
			console.log(error);
			await logging(logMessage);
			await logging(JSON.stringify(error));
			return;
		} else {
			const logMessage = '\nCSV Успешно записан! ✅';
			console.log(logMessage);
			await logging(`${logMessage}`);
		}
	});
};

await writeCSV();
