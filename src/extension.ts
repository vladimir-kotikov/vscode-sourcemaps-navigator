'use strict';

import * as vscode from 'vscode';
import { Selection, OutputChannel } from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapStore } from './sourceMapStore';
import { SourceMapLinkProvider } from './sourceMapLinkProvider';
import { SourceMapContentProvider } from './sourceMapContentProvider';

let sourceMapStore: SourceMapStore;
let outputChannel: OutputChannel;

/**
 * An utility function to get or create an output channel
 */
function getOutputChannel(): OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Source maps');
    }

    return outputChannel;
}

export function activate(context: vscode.ExtensionContext) {
    sourceMapStore = new SourceMapStore();
    context.subscriptions.push(
        sourceMapStore,
        vscode.commands.registerCommand('smnavigator.navigate', navigate),
        vscode.languages.registerDocumentLinkProvider(
            ['javascript', 'javascriptreact'], new SourceMapLinkProvider()),
        vscode.workspace.registerTextDocumentContentProvider(
            'sourcemap', new SourceMapContentProvider())
    );
}

/**
 * The entry point for source maps bavigation. Tries to fetch source maps from
 * current document (possibly using source map store's internal cache), determine
 * mapping direction (generated -> source and back), determine the target file to
 * open and  then open it at restective position.
 *
 * In case of errors reports them via informational message and prints error trace
 * to output window.
 */
function navigate() {
    sourceMapStore.getForCurrentDocument()
    .then(sourceMapping => {
        const activePosition = FilePosition.getActivePosition();
        return sourceMapping.isCurrentDocumentGenerated() ?
            sourceMapping.originalPositionFor(activePosition) :
            sourceMapping.generatedPositionFor(activePosition);
    })
    .then(destinationPosition =>
        navigateToDestination(destinationPosition))
    .catch((err: string|Error) => {
        let message: string  = typeof err === 'string' ? err :
            (err as Error).message;

        vscode.window.showWarningMessage(`Can\'t get source map for current document: ${message}`);
        getOutputChannel().appendLine(message);
        if (err instanceof Error && err.stack) {
            getOutputChannel().appendLine(err.stack);
        }
    });
}

/**
 * Opens the file at position, specified in filePosition parameter
 * @returns {Promise}
 */
function navigateToDestination(destination: FilePosition): Promise<void> {
    return promisify(vscode.workspace.openTextDocument(destination.file))
        .catch(() => {
            if (!destination.contents) {
                return Promise.reject(`Original source doesn't exist and source map doesn't provide inline source`);
            }

            const untitledFile = vscode.Uri.file(destination.file).with({ scheme: 'untitled' });
            return vscode.workspace.openTextDocument(untitledFile);
        })
        .then(vscode.window.showTextDocument)
        .then(editor => {
            if (!editor.document.isUntitled) {
                return editor;
            }

            const builderOptions = { undoStopBefore: false, undoStopAfter: true };
            return editor
                .edit(builder => {
                    const wholeDoc = new vscode.Range(
                        editor.document.positionAt(0),
                        editor.document.positionAt(editor.document.getText().length)
                    );
                    return builder.replace(wholeDoc, destination.contents);
                }, builderOptions)
                .then(() => editor);
        })
        .then((editor: vscode.TextEditor) => {
            editor.selection = new Selection(destination, destination);
            editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
        });

}

function promisify<T>(thenable: Thenable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        thenable.then(resolve, reject);
    });
}
