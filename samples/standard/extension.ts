'use strict';

import * as vscode from 'vscode';
import { Disposable, Selection } from 'vscode';
import { FilePosition } from './filePosition';
import { SourceMapStore } from './sourceMapStore';

let sourceMapStore: SourceMapStore;
let navigateCommand: Disposable;

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
        destinationPosition ?
            navigateToDestination(destinationPosition) :
            vscode.window.showInformationMessage(`Can't get source map for current document`);
    });
}

function navigateToDestination(destination: FilePosition): void {
    vscode.workspace.openTextDocument(destination.file)
    .then(vscode.window.showTextDocument)
    .then(editor => {
        editor.selection = new Selection(destination, destination);
        editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
    });
}
