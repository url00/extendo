// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';




function getCaretPosition(editor: vscode.TextEditor): vscode.Position {
	return editor.selection.active;
}



function getTextNearCaret(editor: vscode.TextEditor, doc: vscode.TextDocument): [string, vscode.Range] {
	const heuristicPreviousMaxLines = 2;
	const heuristicNextMaxLines = 2;
	const caretPosition = getCaretPosition(editor);
	const startPosition = doc.lineAt(Math.max(caretPosition.line - heuristicPreviousMaxLines, 0)).range.start;
	const endPosition = caretPosition.translate(heuristicNextMaxLines);
	const range = new vscode.Range(startPosition, endPosition);
	const relevantText = doc.getText(range);
	return [relevantText, range];
}




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "extendo" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extendo.doExtendo', () => {
		let wasHandled = false;

		console.log('Trying to get active editor.');
		const editor = vscode.window.activeTextEditor;
		const doc = editor?.document;
		if (!doc) {
			return;
		}



		if (doc.languageId == "json") {

			const [text, range] = getTextNearCaret(editor, doc);

			// Search around from the caret position to see if this is likely a connection string.
			let connectionStringChance = 0;

			const connectionStringKeyValueDelimRegex =  /(=|;)/g;
			const delimResult = text.matchAll(connectionStringKeyValueDelimRegex);
			let equalCount = 0;
			let semiCount = 0;
			if (delimResult) {
				for (let item of delimResult) {
					if (!item.groups) continue;

					if (item.groups[0] === "=") {
						equalCount++;
						continue;
					}

					if (item.groups[0] === ";") {
						semiCount++;
						continue;
					}
				}
			}

			// todo more analysis
			if (equalCount == semiCount) {
				connectionStringChance = 1;
			}


			if (connectionStringChance > 0.5) {
				// We are likely in a SQL connection string.
				// Try to expand to select either the whole key, the whole value, or the whole key-value pair.
				// Fallback to normal expand for selecting the whole string.

				// todo handle we already have a selection case
				const caretPosition = getCaretPosition(editor);

				const beforeCaret = text.substring(doc.offsetAt(range.start), doc.offsetAt(caretPosition) - doc.offsetAt(range.start));
				const afterCaret = text.substring(doc.offsetAt(caretPosition) - doc.offsetAt(range.start));

				// Check if we are in a key.

				// Check if we are in a value.

				// Check if we are wanting to expand to a key-value.

				const start = doc.positionAt(0);
				const end = doc.positionAt(100);
				editor.selection = new vscode.Selection(start, end);
	
				wasHandled = true;
			}
			

			


		}




		if (!wasHandled) {
			// Fallback to internal selection expand.
			vscode.commands.executeCommand("expandSelection");
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {


	console.log('Deactivated');

}