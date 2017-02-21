
import * as path from 'path';
import { CancellationToken, DocumentLink, DocumentLinkProvider, TextDocument } from 'vscode';
import { Position, Range, Uri } from 'vscode';

const SOURCE_MAPPING_MATCHER = /^(\/\/[#@] ?sourceMappingURL\s*=\s*)(.+)$/;

export class SourceMapLinkProvider implements DocumentLinkProvider {
    public provideDocumentLinks(document: TextDocument, token: CancellationToken): Promise<DocumentLink[]> {
        const url = findSourceMapUrl(document);
        return Promise.resolve(url ? [url] : []);
    }
}

function findSourceMapUrl(document: TextDocument): DocumentLink | undefined {
    for (let l = document.lineCount - 1; l >= Math.max(document.lineCount - 10, 0); l--) {
        // only search for url in the last 10 lines
        const line = document.lineAt(l);
        const matches = SOURCE_MAPPING_MATCHER.exec(line.text);

        if (matches && matches.length === 3) {
            const link = matches[2].trim();
            const start = new Position(line.lineNumber, matches[1].length);
            const end = start.translate(0, link.length);

            let url: Uri;
            try {
                url = Uri.parse(link);
            } catch (error) {
                // TODO: log error here
                return;
            }

            if (url.scheme === 'data') {
                url = url.with({
                    scheme: 'sourcemap',
                    path: `${document.fileName}.map`,
                    fragment: url.path
                });
            } else {
                url = url.with({
                    scheme: 'file',
                    path: path.resolve(path.dirname(document.fileName), url.fsPath)
                });
            }

            return new DocumentLink(new Range(start, end), url);
        }
    }

    return;
}
