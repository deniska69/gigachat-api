import { Low } from 'lowdb';
import { JSONFile, JSONFilePreset } from 'lowdb/node';
import * as fs from 'fs';

const DB_FILENAME = 'db.json';

type TypeItem = {
	name: string;
	title?: string;
	keywords?: string;
	description?: string;
};

type TypeData = { items: TypeItem[] };

export default class DB {
	db?: Low<TypeData>;

	constructor() {}

	init = async () => {
		if (!fs.existsSync(DB_FILENAME)) {
			const db = await JSONFilePreset<TypeData>(DB_FILENAME, { items: [] });
			const item = { id: 0, name: 'test', title: 'test', keywords: 'test', description: 'test' };
			await db.update(({ items }) => items.push(item));
		} else {
			const adapter = new JSONFile<TypeData>(DB_FILENAME);
			this.db = new Low(adapter, { items: [] });
		}
	};

	read = async () => await this.db?.read();

	write = async () => await this.db?.write();

	add = async (
		name: string,
		props?: { title?: string; keywords?: string; description?: string },
	) => {
		await this.read();

		const isExists = this.db?.data.items.some((item) => item.name === name);

		if (isExists) return;

		this.db?.data.items.push({ name, ...props });

		return await this.write();
	};

	update = async (
		name: string,
		props: { title?: string; keywords?: string; description?: string },
	) => {
		await this.read();

		const item = this.db?.data.items.find((el) => el.name === name);

		if (item) {
			Object.assign(item, props);
			return await this.write();
		}

		return Promise.reject();
	};

	getTotal = async () => {
		await this.read();
		console.log({ total: this.db?.data.items.length });
	};
}
