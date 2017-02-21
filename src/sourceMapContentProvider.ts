
import { CancellationToken, TextDocumentContentProvider, Uri } from 'vscode';

export class SourceMapContentProvider implements TextDocumentContentProvider {
    public provideTextDocumentContent(uri: Uri, token: CancellationToken): string {
        if (!uri.fragment.includes(',')) {
            throw new Error('Provided uri is not a valid data URI');
        }

        // Don't bother about reading encoding and mime type - they are
        // always utf-8 and 'application/json' (according to the spec)
        const data = uri.fragment.split(',', 2)[1];
        return Buffer.from(data, 'base64').toString('utf8');
    }
}
