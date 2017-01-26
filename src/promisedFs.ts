import * as fs from 'fs';

export function readFile(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
}
