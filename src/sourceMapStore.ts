import * as Url from 'url';
import * as vscode from 'vscode';
import { Disposable, FileSystemWatcher, Range, TextDocument } from 'vscode';
import { SourceMapItem } from './sourceMapItem';

export class SourceMapStore implements Disposable {
    private cache: {[generatedPath: string]: SourceMapItem} = {};
    /** A table for reverse lookup, i.e. to find map for file generated from this one */
    private reverseLookupTable: {[sourcePath: string]: string } = {};
    private watchers: {[path: string]: FileSystemWatcher} = {};

    public addItem(item: SourceMapItem): SourceMapItem {
        this.cache[item.generatedFile] = item;
        this.watchers[item.generatedFile] = vscode.workspace.createFileSystemWatcher(item.generatedFile, true);
        this.watchers[item.generatedFile].onDidChange(() => this.removeItem(item.generatedFile));
        this.watchers[item.generatedFile].onDidDelete(() => this.removeItem(item.generatedFile));

        item.sourceFiles.forEach(sourceFile => this.reverseLookupTable[sourceFile] = item.generatedFile);

        return item;
    }

    public removeItem(generatedPath: string) {
        if (this.watchers[generatedPath]) {
            this.watchers[generatedPath].dispose();
            delete this.watchers[generatedPath];
        }

        if (this.cache[generatedPath]) {
            this.cache[generatedPath].sourceFiles.forEach(sourceFile => delete this.reverseLookupTable[sourceFile]);

            delete this.cache[generatedPath];
        }

    }

    public dispose() {
        Object.keys(this.cache).forEach(key => this.removeItem(key));
    }

    public getForCurrentDocument(): Promise<SourceMapItem> {
        const currentDocument = vscode.window.activeTextEditor.document;
        const result = this.cache[currentDocument.fileName] ||
            this.reverseLookupTable[currentDocument.fileName] ||
            fetchSourceMapUrl(currentDocument)
            .then(({url, fileUrl}) => isDataUrl(url) ?
                SourceMapItem.fromDataUrl(url, fileUrl) :
                SourceMapItem.fromFile(url))
            .then(sourceMapItem => this.addItem(sourceMapItem));

        return Promise.resolve(result);
    }
}

interface SourceMapFetchResult {
    url: string;
    fileUrl: string;
}

function isDataUrl(url: string): boolean {
    return Url.parse(url).protocol === 'data:';
}

function fetchSourceMapUrl(document: TextDocument): Promise<SourceMapFetchResult> {
    const SOURCE_MAPPING_MATCHER = new RegExp('^//[#@] ?sourceMappingURL=(.+)$');
    const lastTenLines = new Range(document.lineCount - 10, 0, document.lineCount + 1, 0);

    function tryExtractUrl(line: string): string {
        const matches = SOURCE_MAPPING_MATCHER.exec(line.trim());
        return matches && matches.length === 2 ? matches[1].trim() : "";
    }

    const url = document.getText(lastTenLines).split('\n')
    .reduceRight<string>((result, line) => {
        return result || tryExtractUrl(line);
    }, "");

    return url ? Promise.resolve({url, fileUrl: document.fileName}) :
        Promise.reject(`Can't fetch url from current document at ${document.fileName}`);
}
