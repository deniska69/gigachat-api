import GPT from './gpt.js';
import { readFile } from './helpers.js';
import DB from './db.js';

const CONTENT =
	'напиши пожалуйста для раздела "Антенны" тэги которые будут хорошо ранжироваться (META TITLE, META KEYWORDS, META DESCRIPTION), без геопривязки, без емодзи. Просто приведи по одному примеру текста, разделяя двоеточием, не добавляй слово "пример"';

const gpt = new GPT();
const db = new DB();

console.clear();

const start = async () => {
	console.log('--------------- [START] ---------------');
	console.log('\nQuestion:');
	console.log('---------------------------------------');
	console.log(CONTENT);
	console.log('---------------------------------------');
	console.log('');

	// gpt.send(CONTENT).then((res) => {
	// 	console.log('\nAnswer:');
	// 	console.log('---------------------------------------');
	// 	console.log(res);
	// 	console.log('---------------------------------------');
	// 	console.log('');
	// 	console.log('---------------- [END] ----------------');
	// });

	gpt.balance().then((res) => console.log(res));
};

// start();

// const file = readFile();

await db.init();
await db.add('АТС (Автоматическая телефонная станция)');
await db.update('АТС (Автоматическая телефонная станция)', { title: 'test' });
