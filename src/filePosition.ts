import * as vscode from 'vscode';
import { Position } from 'vscode';
import { MappedPosition } from 'source-map';

export class FilePosition extends Position {
    public contents: string;

    constructor(line: number, character: number, public file: string) {
        super(line, character);
    }

    public static getActivePosition(): FilePosition {
        const currentEditor = vscode.window.activeTextEditor;
        const { line, character } = currentEditor.selection.active;
        return new FilePosition(line, character, currentEditor.document.fileName);
    }

    public static fromSmPosition(position: MappedPosition): FilePosition {
        // source map indexes are 1-based while vscode uses
        // zero-indexed values so substract 1 from line
        return new FilePosition(position.line - 1, position.column, position.source);
    }

    public toSmPosition(): MappedPosition {
        // Add 1 to line No since source-map uses 1-based indexes
        return { column: this.character, line: this.line + 1, source: this.file };
    }
}
