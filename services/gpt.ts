import dotenv from 'dotenv';
import GigaChat from 'gigachat';
import { Agent } from 'node:https';

dotenv.config();

export default class GPT {
	private httpsAgent: InstanceType<typeof Agent> = new Agent();
	client: InstanceType<typeof GigaChat> = new GigaChat({});

	constructor() {
		this.httpsAgent = new Agent({ rejectUnauthorized: false });

		this.client = new GigaChat({
			timeout: 10,
			model: 'GigaChat-2', // GigaChat-2, GigaChat-2-Pro, GigaChat-2-Max
			credentials: process.env.GIGA_AUTH_KEY,
			httpsAgent: this.httpsAgent,
		});
	}

	send = async (content: string) => {
		return this.client
			.chat({
				messages: [
					{
						role: 'user',
						content,
					},
				],
			})
			.then((resp) => Promise.resolve(resp.choices[0]?.message.content));
	};

	balance = async () => await this.client.balance();
}
