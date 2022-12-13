import * as vscode from 'vscode';




export function selectToDelimiters(innerDelimiterRelativeToAfterCaretEx: RegExp, delimiterLength: number, text: string, caretPositionRelativeToText: number, range: vscode.Range, doc: vscode.TextDocument): vscode.Selection | null {
	const beforeCaret = text.substring(doc.offsetAt(range.start), caretPositionRelativeToText);
	const afterCaret = text.substring(caretPositionRelativeToText);

	const possibleMatch = afterCaret.match(innerDelimiterRelativeToAfterCaretEx);
	if (!possibleMatch || possibleMatch.index == undefined) {
		return null;
	}
	const indexOfMatch = possibleMatch.index;

	let newStartRelativeToText = caretPositionRelativeToText;
	const possiblePartOfKeyBeforeCaret = beforeCaret.split('').reverse().join('').match(/(\w+)\W/);
	if (possiblePartOfKeyBeforeCaret && possiblePartOfKeyBeforeCaret[1]) {
		newStartRelativeToText -= possiblePartOfKeyBeforeCaret[1].length;
	}

	const newStart = doc.positionAt(newStartRelativeToText);
	const newEnd = doc.positionAt(caretPositionRelativeToText + indexOfMatch + possibleMatch[0].length - delimiterLength);

	return new vscode.Selection(newStart, newEnd);
}




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
