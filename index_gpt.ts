import GPT from './services/gpt.js';
import DB from './services/db.js';
import {
	writeLogs,
	getPromt,
	parseMessage,
	logRemaining,
	handlingInterrupt,
	logBalance,
} from './services/helpers.js';

console.clear();

const gpt = new GPT();
const db = new DB();

await db.init();

handlingInterrupt(db);

const logging = async (text: string) => await writeLogs(text, 'log_gpt.txt');

const gptProcessing = async () => {
	await logging('\n[СТАРТ] Генерация мета тегов');
	await db.read();

	const items = db.db?.data.items;
	if (!items) return console.error('[Error] items:', undefined);

	let counter = 0;

	for (const item of items) {
		counter++;

		if (item.title && item.keywords && item.description) {
			const logMissed = `${counter}/${items.length} | ${item.name} - Пропущено 🟡`;
			console.log(logMissed);
			continue;
		}

		try {
			await gpt.send(getPromt(item.name)).then(async (message) => {
				const meta = parseMessage(message);

				if (meta.title && meta.keywords && meta.description) {
					db.update(item.name, meta);

					const logMessage = `${counter}/${items.length} | ${item.name} - Успешно ✅`;
					console.log(logMessage);
					await logging(`${logMessage}`);
				} else {
					const logMessage = `${counter}/${items.length} | ${item.name} - Ошибка парсинга ответа gpt ❌`;
					console.log(logMessage);
					console.log({ message });
					await logging(logMessage);
					await logging(JSON.stringify(message));
				}
			});
		} catch (error) {
			const logMessage = `${counter}/${items.length} | ${item.name} - Ошибка выполнения запроса ❌`;
			console.log(logMessage);
			await logging(logMessage);
			await logBalance(gpt, 'log_gpt.txt');
		}
	}

	await logRemaining(db, 'log_gpt.txt');
};

await gptProcessing();
