import * as vscode from 'vscode';
import { getCaretPosition, getTextNearCaret } from "./helpers";





export function tryHandleJson(editor: vscode.TextEditor, doc: vscode.TextDocument, wasHandled: boolean): boolean {
	if (doc.languageId !== "json") {
		return wasHandled;
	}

	const [text, range] = getTextNearCaret(editor, doc);
	wasHandled = tryHandleSqlServerConnectionString(editor, doc, text, range, wasHandled);
	return wasHandled;
}





export function getChanceOfSqlServerConnectionString(text: string): number {
	// Search around from the caret position to see if this is likely a connection string.
	let connectionStringChance = 0;
	if (text.match(/^\s*"?\w+"?:/m)) {
		connectionStringChance += 0.1;
	}
	const delimiterMatches = text.match(/=|;/g);
	connectionStringChance += delimiterMatches ? delimiterMatches.length > 0 ? 0.7 : 0 : 0;
	return connectionStringChance;
}


export function tryHandleSqlServerConnectionString(editor: vscode.TextEditor, doc: vscode.TextDocument, text: string, range: vscode.Range, wasHandled: boolean): boolean {
	if (getChanceOfSqlServerConnectionString(text) < 0.5) {
		return wasHandled;
	}

	// We are likely in a SQL connection string.
	// Try to expand to select either the whole key, the whole value, or the whole key-value pair.
	// Fallback to normal expand for selecting the whole string.
	// todo handle we already have a selection case
	const caretPosition = getCaretPosition(editor);
	const caretPositionRelativeToText = doc.offsetAt(caretPosition) - doc.offsetAt(range.start);


	const beforeCaret = text.substring(doc.offsetAt(range.start), caretPositionRelativeToText);
	const afterCaret = text.substring(caretPositionRelativeToText);

	// Check if we are in a key.
	const keyEx = /^\w+(?!;)=/;
	const isKey = afterCaret.match(keyEx);
	if (isKey && isKey.index != undefined) {

		const indexOfMatch = isKey.index;

		let newStartRelativeToText = caretPositionRelativeToText;
		const possiblePartOfKeyBeforeCaret = beforeCaret.split('').reverse().join('').match(/(\w+)\W/);
		if (possiblePartOfKeyBeforeCaret && possiblePartOfKeyBeforeCaret[1]) {
			newStartRelativeToText -= possiblePartOfKeyBeforeCaret[1].length;
		}

		const newStart = doc.positionAt(newStartRelativeToText);
		const newEnd = doc.positionAt(caretPositionRelativeToText + indexOfMatch + isKey[0].length - 1);

		editor.selection = new vscode.Selection(newStart, newEnd);
		return true;
	}


	// Check if we are in a value.
	const isValue = afterCaret.match(/^\w+(?!=);/);

	// Check if we are wanting to expand to a key-value.


	
	return wasHandled;
}