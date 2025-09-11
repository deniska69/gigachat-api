import * as fs from 'fs';
import chardet from 'chardet';
import DB from './db.js';
import GPT from './gpt.js';

export const readFile = (fileName: string) => {
	const file = fs.readFileSync(fileName);
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
		console.log('Баланс токенов:');
		console.log(balance);
		await writeLogs(JSON.stringify(balance), file);
	});
};

export const removeEmojis = (text: string) => {
	return text.replace(
		/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D|\u231A|\u23F0|\u23F3|\u2600-\u26FF|\u2194-\u21FF|\u2B50|\u2B06|\u2B05|\u2B07|\u2934|\u2935|\u25AA|\u25AB|\u25B6|\u25C0|\u25FB-\u25FE|\u2600-\u26FF|\u1F004|\u1F0CF|\u1F300-\u1F5FF|\u1F600-\u1F64F|\u1F680-\u1F6FF|\u1F700-\u1F77F|\u1F780-\u1F7FF|\u1F800-\u1F8FF|\u1F900-\u1F9FF|\u1FA00-\u1FA6F|\u1FA70-\u1FAFF|\u1FB00-\u1FBFF)+/gu,
		'',
	);
};

export const normalizeText = (text: string) => {
	return removeEmojis(text).replaceAll(';', ';').replaceAll('\n', '');
};
