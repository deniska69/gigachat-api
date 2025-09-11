import GPT from './gpt.js';
import DB from './db.js';
import { flushLogs, getPromt, parseMessage, readFile } from './helpers.js';

console.clear();

const gpt = new GPT();
const db = new DB();

await db.init();

process.on('SIGINT', async () => {
	await flushLogs('Скрипт завершён вручную.');
	await countRemaining();
	process.exit(0);
});

process.on('uncaughtException', async (err) => {
	await flushLogs('Необработанная ошибка.');
	await countRemaining();
	process.exit(1);
});

const readAndWriteFileToDB = async () => {
	const arr = readFile();

	let counter = 0;

	for (const item of arr) {
		counter++;

		await db
			.add(item)
			.then(() => console.log(counter, '/', arr.length, '|', item, `✅`))
			.catch((e) => {
				console.log(counter, '/', arr.length, '|', item, `❌`);
				console.log(e);
				return;
			});
	}
};

const gptProcessing = async () => {
	await flushLogs('\n[СТАРТ] Генерация мета тегов');
	await db.read();

	const items = db.db?.data.items;
	if (!items) return console.error('[Error] items:', undefined);

	let counter = 0;

	for (const item of items) {
		counter++;

		if (item.title && item.keywords && item.description) {
			const logMissed = `${counter}/${items.length} | ${item.name} - Пропущено 🟡`;
			console.log(logMissed);
			// await flushLogs(logMissed);
			continue;
		}

		try {
			await gpt.send(getPromt(item.name)).then(async (message) => {
				const meta = parseMessage(message);

				if (meta.title && meta.keywords && meta.description) {
					db.update(item.name, meta);

					const logMessage = `${counter}/${items.length} | ${item.name} - Успешно ✅`;
					console.log(logMessage);
					await flushLogs(`${logMessage}`);
				} else {
					const logMessage = `${counter}/${items.length} | ${item.name} - Ошибка парсинга ответа gpt ❌`;
					console.log(logMessage);
					console.log({ message });
					await flushLogs(logMessage);
					await flushLogs(JSON.stringify(message));
				}
			});
		} catch (error) {
			const logMessage = `${counter}/${items.length} | ${item.name} - Ошибка выполнения запроса ❌`;
			console.log(logMessage);
			await flushLogs(logMessage);
		}
	}

	await countRemaining();
};

const countRemaining = async () => {
	await flushLogs('\n[СТАРТ] Подсчёт оставшихся');
	await db.read();

	const items = db.db?.data.items;
	if (!items) return console.error('[Error] items:', undefined);

	let counter = 0;

	for (const item of items) {
		if (!item.title || !item.description || !item.keywords) counter++;
	}

	const logMessage = `Количество не выполненных: ${counter}/${items.length}`;
	console.log(logMessage);
	await flushLogs(`${logMessage}`);
};

// await readAndWriteFileToDB();
// await countRemaining();
await gptProcessing();
