import { Low } from 'lowdb';
import { JSONFile, JSONFilePreset } from 'lowdb/node';
import * as fs from 'fs';

const FILE_DB_NAME = 'db.json';

type TypeItem = {
	name: string;
	title?: string;
	keywords?: string;
	description?: string;
};

type TypeData = { items: TypeItem[] };

export default class DB {
	private db?: Low<TypeData>;

	constructor() {}

	init = async () => {
		if (!fs.existsSync(FILE_DB_NAME)) {
			const db = await JSONFilePreset<TypeData>(FILE_DB_NAME, { items: [] });
			const item = { id: 0, name: 'test', title: 'test', keywords: 'test', description: 'test' };
			await db.update(({ items }) => items.push(item));
		} else {
			const adapter = new JSONFile<TypeData>(FILE_DB_NAME);
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

		await this.write();
	};

	update = async (
		name: string,
		props: { title?: string; keywords?: string; description?: string },
	) => {
		await this.read();

		const item = this.db?.data.items.find((el) => el.name === name);

		if (item) {
			Object.assign(item, props);
			await this.write();
		}
	};
}
