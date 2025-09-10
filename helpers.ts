import * as fs from 'fs';
import chardet from 'chardet';

export const readFile = () => {
	const file = fs.readFileSync('file.csv');
	const encoding = chardet.detect(file) || 'UTF-8';
	const decodedString = new TextDecoder(encoding).decode(file);
	return decodedString.split('\r\n');
};
