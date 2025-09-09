import GPT from './gpt.js';
import { readFile } from './helpers.js';

const CONTENT =
	'напиши пожалуйста для раздела "Антенны" тэги которые будут хорошо ранжироваться (META TITLE, META KEYWORDS, META DESCRIPTION), без геопривязки, без емодзи. Просто приведи по одному примеру текста, разделяя двоеточием, не добавляй слово "пример"';

const gpt = new GPT();

const start = async () => {
	console.clear();
	console.log('--------------- [START] ---------------');
	console.log('\nQuestion:');
	console.log('---------------------------------------');
	console.log(CONTENT);
	console.log('---------------------------------------');
	console.log('');

	gpt.send(CONTENT).then((res) => {
		console.log('\nAnswer:');
		console.log('---------------------------------------');
		console.log(res);
		console.log('---------------------------------------');
		console.log('');
		console.log('---------------- [END] ----------------');
	});
};

start();

// const file = readFile();

// console.log(file[0][0]);
