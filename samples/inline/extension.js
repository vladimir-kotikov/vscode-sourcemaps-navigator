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
}
function navigateToDestination(destination) {
    vscode.workspace.openTextDocument(destination.file)
        .then(vscode.window.showTextDocument)
        .then(editor => {
        editor.selection = new vscode_1.Selection(destination, destination);
        editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLGlDQUFpQztBQUNqQyxtQ0FBK0M7QUFDL0MsaURBQThDO0FBQzlDLHFEQUFrRDtBQUVsRCxJQUFJLGNBQThCLENBQUM7QUFDbkMsSUFBSSxlQUEyQixDQUFDO0FBRWhDLGtCQUF5QixPQUFnQztJQUNyRCxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEYsY0FBYyxHQUFHLElBQUksK0JBQWMsRUFBRSxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBSkQsNEJBSUM7QUFFRDtJQUNJLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRTtTQUNyQyxJQUFJLENBQUMsYUFBYTtRQUNmLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxNQUFNLGNBQWMsR0FBRywyQkFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEQsTUFBTSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsRUFBRTtZQUM3QyxhQUFhLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDO1lBQ2pELGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzRCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsbUJBQW1CO1FBQ3JCLG1CQUFtQjtZQUNmLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDO1lBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsMkNBQTJDLENBQUMsQ0FBQztJQUMxRixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCwrQkFBK0IsV0FBeUI7SUFDcEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1NBQ3BDLElBQUksQ0FBQyxNQUFNO1FBQ1IsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0UsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIn0=