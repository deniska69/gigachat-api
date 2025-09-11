import * as fs from 'fs';
import chardet from 'chardet';
import DB from './db.js';
import GPT from './gpt.js';

export const readFile = () => {
	const file = fs.readFileSync('file.csv');
	const encoding = chardet.detect(file) || 'UTF-8';
	const decodedString = new TextDecoder(encoding).decode(file);
	return decodedString.split('\r\n');
};

export const getPromt = (title: string) => {
	return `напиши пожалуйста для раздела "${title}" тэги которые будут хорошо ранжироваться (META TITLE, META KEYWORDS, META DESCRIPTION), без геопривязки, без емодзи. Просто приведи по одному примеру текста, разделяя двоеточием, не добавляй слово "пример"`;
};

export const parseMessage = (
	text: string,
): { title?: string; keywords?: string; description?: string } => {
	const matchTitle = text.match(/META TITLE:\s*(.*?)\s*META KEYWORDS:/s);
	const matchKeywords = text.match(/META KEYWORDS:\s*(.*?)\s*META DESCRIPTION:/s);
	const matchDescription = text.match(/META DESCRIPTION:\s*(.*)/s);

	let data = {};

	if (matchTitle) data = { ...data, title: matchTitle[1]?.trim() };
	if (matchKeywords) data = { ...data, keywords: matchKeywords[1]?.trim() };
	if (matchDescription) data = { ...data, description: matchDescription[1]?.trim() };

	return data;
};

export const writeLogs = async (text: string, file = 'log.txt') => {
	await fs.promises.appendFile(file, `${text} - ${new Date().toTimeString()}\n`, 'utf8');
};

export const logRemaining = async (db: DB, file = 'log.txt') => {
	await writeLogs('\n[СТАРТ] Подсчёт оставшихся необработанных записей в БД', file);
	await db.read();

	const items = db.db?.data.items;
	if (!items) return console.error('[Error] items:', undefined);

	let counter = 0;

	for (const item of items) {
		if (!item.title || !item.description || !item.keywords) counter++;
	}

	const logMessage = `Количество не выполненных: ${counter}/${items.length}`;
	console.log(logMessage);
	await writeLogs(`${logMessage}`, file);
};

export const handlingInterrupt = (db: DB) => {
	process.on('SIGINT', async () => {
		await writeLogs('Скрипт завершён вручную.');
		await logRemaining(db);
		process.exit(0);
	});

	process.on('uncaughtException', async (err) => {
		await writeLogs('Необработанная ошибка.');
		await logRemaining(db);
		process.exit(1);
	});
};

export const logBalance = async (gpt: GPT, file = 'log.txt') => {
	await writeLogs('\n[СТАРТ] Подсчёт оставшихся токенов', file);

	await gpt.balance().then(async ({ balance }) => {
		await writeLogs(JSON.stringify(balance), file);
	});
};
