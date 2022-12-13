import * as vscode from 'vscode';
import { getCaretPosition, getTextNearCaret, selectToDelimiters } from "./helpers";





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


	// Check if we are in a key.
	const possibleKeySelection = selectToDelimiters(/^\w*(?!;)=/, "=".length, text, caretPositionRelativeToText, range, doc);
	if (possibleKeySelection) {
		editor.selection = possibleKeySelection;
		return true;
	}

	// Check if we are in a value.
	const possibleValueSelection = selectToDelimiters(/^\w*(?!=);/, ";".length, text, caretPositionRelativeToText, range, doc);
	if (possibleValueSelection) {
		editor.selection = possibleValueSelection;
		return true;
	}

	// Check if we are wanting to expand to a key-value.



	return wasHandled;
}