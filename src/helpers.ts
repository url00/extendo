import * as vscode from 'vscode';



export function getTextNearCaret(editor: vscode.TextEditor, doc: vscode.TextDocument): [string, vscode.Range] {
	const heuristicPreviousMaxLines = 2;
	const heuristicNextMaxLines = 2;
	const caretPosition = getCaretPosition(editor);
	const startPosition = doc.lineAt(Math.max(caretPosition.line - heuristicPreviousMaxLines, 0)).range.start;
	const endPosition = caretPosition.translate(heuristicNextMaxLines);
	const range = new vscode.Range(startPosition, endPosition);
	const relevantText = doc.getText(range);
	return [relevantText, range];
}




export function getCaretPosition(editor: vscode.TextEditor): vscode.Position {
	return editor.selection.active;
}
