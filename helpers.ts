import * as fs from 'fs';
import chardet from 'chardet';

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

export const flushLogs = async (text: string) => {
	try {
		await fs.promises.appendFile('log.txt', `${text} - ${new Date().toTimeString()}\n`, 'utf8');
		// console.log('✅ Логи записаны в файл.');
	} catch (err) {
		// console.error('❌ Ошибка при записи логов');
	}
};
