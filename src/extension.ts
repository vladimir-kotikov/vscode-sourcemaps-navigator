'use strict';

import * as vscode from 'vscode';
import { Disposable, Selection, OutputChannel } from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapStore } from './sourceMapStore';

let sourceMapStore: SourceMapStore;
let navigateCommand: Disposable;

let outputChannel: OutputChannel;
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

function navigate() {
    sourceMapStore.getForCurrentDocument()
    .then(sourceMapping => {
        if (!sourceMapping) {
            return null;
        }

        const activePosition = FilePosition.getActivePosition();
        return sourceMapping.isCurrentDocumentGenerated() ?
            sourceMapping.originalPositionFor(activePosition) :
            sourceMapping.generatedPositionFor(activePosition);
    })
    .then(destinationPosition => {
        return destinationPosition ?
            navigateToDestination(destinationPosition) :
            vscode.window.showInformationMessage(`Can't get source map for current document`)
                .then(() => void 0);
    })
    .catch((err: Error) => {
        vscode.window.showWarningMessage(`Can\'t get source map for current document: ${err.message}`);
        getOutputChannel().appendLine(err.message);
        if (err.stack) {
            getOutputChannel().appendLine(err.stack);
        }
    });
}

function navigateToDestination(destination: FilePosition): PromiseLike<void> {
    return vscode.workspace.openTextDocument(destination.file)
    .then(vscode.window.showTextDocument)
    .then(editor => {
        editor.selection = new Selection(destination, destination);
        editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
    });
}
