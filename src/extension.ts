'use strict';

import * as vscode from 'vscode';
import { Disposable, Selection, OutputChannel } from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapStore } from './sourceMapStore';

let sourceMapStore: SourceMapStore;
let navigateCommand: Disposable;
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
    navigateCommand = vscode.commands.registerCommand('smnavigator.navigate', navigate);
    sourceMapStore = new SourceMapStore();
    context.subscriptions.push(navigateCommand, sourceMapStore);
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
    .catch((err: Error) => {
        vscode.window.showWarningMessage(`Can\'t get source map for current document: ${err.message}`);
        getOutputChannel().appendLine(err.message);
        if (err.stack) {
            getOutputChannel().appendLine(err.stack);
        }
    });
}

/**
 * Opens the file at position, specified in filePosition parameter
 * @returns {PromiseLike}
 */
function navigateToDestination(destination: FilePosition): PromiseLike<void> {
    return vscode.workspace.openTextDocument(destination.file)
    .then(vscode.window.showTextDocument)
    .then(editor => {
        editor.selection = new Selection(destination, destination);
        editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
    });
}
