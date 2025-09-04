import dotenv from 'dotenv';
import GigaChat from 'gigachat';
import { Agent } from 'node:https';

console.clear();
console.log(' ---------- [START] ---------- ');

dotenv.config();

const AUTH_TOKEN = process.env.GIGA_AUTH_KEY;

const CONTENT =
	'У меня есть категория на сайте "Ноутбуки". Придумай для этой категории текст для вставки в тег meta description';

console.log('\nQuestion:');
console.log('--------------------------------------');
console.log(CONTENT);
console.log('--------------------------------------');
console.log('');

const httpsAgent = new Agent({ rejectUnauthorized: false });

const client = new GigaChat({
	timeout: 600,
	model: 'GigaChat',
	credentials: AUTH_TOKEN,
	httpsAgent,
});

client
	.chat({
		messages: [
			{
				role: 'user',
				content: CONTENT,
			},
		],
	})
	.then((resp) => {
		console.log('\nAnswer:');
		console.log('--------------------------------------');
		console.log(resp.choices[0]?.message.content);
		console.log('--------------------------------------');
		console.log('');
	});
