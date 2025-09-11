import DB from './services/db.js';
import { writeLogs, readFile, handlingInterrupt, logRemaining } from './services/helpers.js';

console.clear();

const db = new DB();

await db.init();

handlingInterrupt(db);

const logging = async (text: string) => await writeLogs(text, 'log_file.txt');

const readAndWriteFileToDB = async () => {
	await logging('\n[СТАРТ] Чтения файла и запись в БД');

	const arr = readFile();

	let counter = 0;

	for (const item of arr) {
		counter++;

		await db
			.add(item)
			.then(async () => {
				const logMessage = `${counter}/${arr.length} | ${item} - Успешно ✅`;
				console.log(logMessage);
				await logging(`${logMessage}`);
			})
			.catch(async (e) => {
				const logMessage = `${counter}/${arr.length} | ${item} - Ошибка добавления в БД ❌`;
				console.log(logMessage);
				await logging(logMessage);
			});
	}

	await logRemaining(db, 'log_file.txt');
};

await readAndWriteFileToDB();
