import * as path from 'path';
import * as vscode from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapConsumer, RawSourceMap } from 'source-map';

import { readFile } from './promisedFs';

export class SourceMapItem {
    public sourceFiles: string[];
    public generatedFile: string;
    private sourceMap: SourceMapConsumer;
    constructor(private rawSourceMap: RawSourceMap, private sourceMapFile: string){
        this.sourceMap = new SourceMapConsumer(rawSourceMap);

        this.sourceFiles = rawSourceMap.sources
            .map(source => {
                return path.resolve(path.dirname(sourceMapFile), (rawSourceMap.sourceRoot || ""), source);
            });

        this.generatedFile = rawSourceMap.file ?
            path.resolve(path.dirname(sourceMapFile), rawSourceMap.file) :
            sourceMapFile;
    }

    public static fromDataUrl(sourceMapUrl: string, sourceMapFile: string): Promise<SourceMapItem> {
        return new Promise<SourceMapItem>(resolve => {
            const data = sourceMapUrl.replace(/\r?\n/g, '').split(",")[1];
            resolve(SourceMapItem.fromString(new Buffer(data, "base64").toString("utf8"), sourceMapFile));
        });
    }

    public static fromFile(sourceMapFile: string): Promise<SourceMapItem> {
        return readFile(sourceMapFile)
        .then(fileContents => SourceMapItem.fromString(fileContents, sourceMapFile));
    }

    public static fromString(data: string, mapFile: string): SourceMapItem {
        const rawSourceMap = JSON.parse(data) as RawSourceMap;
        return new SourceMapItem(rawSourceMap, mapFile);
    }

    public isCurrentDocumentGenerated(): boolean {
        return this.generatedFile === vscode.window.activeTextEditor.document.fileName;
    }

    public generatedPositionFor(position: FilePosition): FilePosition {
        const { file } = position;
        const absSourceRoot = path.resolve(path.dirname(this.sourceMapFile),
            (this.rawSourceMap.sourceRoot || ""));
        const source = path.relative(absSourceRoot, file);
        const smPosition = this.sourceMap.generatedPositionFor({...position.toSmPosition(), source});
        return FilePosition.fromSmPosition({...smPosition, source: this.generatedFile});
    }

    public originalPositionFor(position: FilePosition): FilePosition {
        const smPosition = this.sourceMap.originalPositionFor(position.toSmPosition());
        const source = path.resolve(path.dirname(this.sourceMapFile),
            (this.rawSourceMap.sourceRoot || ""), smPosition.source);
        return FilePosition.fromSmPosition({...smPosition, source});
    }
}
