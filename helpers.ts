import * as fs from 'fs';
import { inferSchema, initParser } from 'udsv';

export const readFile = (): string[][] => {
	const file = fs.readFileSync('file.csv');
	const decodedString = new TextDecoder('windows-1251').decode(file);
	const parser = initParser(inferSchema(decodedString));
	const parsedFile = parser.typedArrs(decodedString);
	return parsedFile;
};
