import * as path from 'path';
import * as vscode from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapConsumer, RawSourceMap } from 'source-map';

import { readFile } from './promisedFs';

export class SourceMapItem {
    constructor(protected sourceMap: SourceMapConsumer,
                public sourceFiles: string[],
                public generatedFile: string,
                public sourceMapFile?: string){};

    public static fromDataUrl(url: string, mapFile: string): Promise<SourceMapItem> {
        return new Promise<SourceMapItem>(resolve => {
            const data = url.replace(/\r?\n/g, '').split(",", 1)[1];
            resolve(SourceMapItem.fromString(new Buffer(data, "base64").toString("utf8"), mapFile));
        });
    }

    public static fromFile(sourceMapFile: string): Promise<SourceMapItem> {
        return readFile(sourceMapFile)
        .then(fileContents => SourceMapItem.fromString(fileContents, sourceMapFile));
    }

    public static fromString(data: string, mapFile: string): SourceMapItem {
        const rawSourceMap = <RawSourceMap>JSON.parse(data);
        const sources = rawSourceMap.sources
            .map(source => path.resolve(rawSourceMap.sourceRoot || "", source));

        return new SourceMapItem(new SourceMapConsumer(rawSourceMap),
            sources, mapFile, rawSourceMap.file || mapFile);
    }

    public isCurrentDocumentGenerated(): boolean {
        return this.generatedFile === vscode.window.activeTextEditor.document.fileName;
    }

    public generatedPositionFor(position: FilePosition): FilePosition {
        const smPosition = this.sourceMap.generatedPositionFor(position.toSmPosition());
        return FilePosition.fromSmPosition({...smPosition, source: this.generatedFile});
    }

    public originalPositionFor(position: FilePosition): FilePosition {
        const smPosition = this.sourceMap.originalPositionFor(position.toSmPosition());
        return FilePosition.fromSmPosition(smPosition);
    }
}
