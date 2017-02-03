'use strict';
const vscode = require("vscode");
const vscode_1 = require("vscode");
const filePosition_1 = require("./filePosition");
const sourceMapStore_1 = require("./sourceMapStore");
let sourceMapStore;
let navigateCommand;
function activate(context) {
    navigateCommand = vscode.commands.registerCommand('smnavigator.navigate', navigate);
    sourceMapStore = new sourceMapStore_1.SourceMapStore();
    context.subscriptions.push(navigateCommand, sourceMapStore);
}
exports.activate = activate;
function navigate() {
    sourceMapStore.getForCurrentDocument()
        .then(sourceMapping => {
        if (!sourceMapping) {
            return null;
        }
        const activePosition = filePosition_1.FilePosition.getActivePosition();
        return sourceMapping.isCurrentDocumentGenerated() ?
            sourceMapping.originalPositionFor(activePosition) :
            sourceMapping.generatedPositionFor(activePosition);
    })
        .then(destinationPosition => {
        destinationPosition ?
            navigateToDestination(destinationPosition) :
            vscode.window.showInformationMessage(`Can't get source map for current document`);
    });
    //     const originalPosition = sourceMapping.sourceMap.originalPositionFor(getCurrentPosition());
    //     const resolvedOriginalPath = path.resolve(path.dirname(sourceMapping.sourceMapFile), originalPosition.source)
    // })
    // .catch(err => console.error(err));
}
function navigateToDestination(destination) {
    vscode.workspace.openTextDocument(destination.file)
        .then(vscode.window.showTextDocument)
        .then(editor => {
        const rangeToShow = new vscode_1.Range(destination, destination);
        editor.revealRange(rangeToShow, vscode.TextEditorRevealType.InCenter);
        editor.selection = new vscode_1.Selection(destination, destination);
    });
}
//# sourceMappingURL=extension.js.map