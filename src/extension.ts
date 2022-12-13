import * as vscode from 'vscode';
import { tryHandleJson } from './json';



export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extendo.doExtendo', () => {
		const editor = vscode.window.activeTextEditor;
		const doc = editor?.document;
		if (!doc) {
			return;
		}

		let wasHandled = false;
		wasHandled = tryHandleJson(editor, doc, wasHandled);
		// todo add module to check if extents + 1 of selection are both non-word chars (assume they are delimiters) and extend selection to include them
		if (!wasHandled) {
			// Fallback to internal selection expand.
			vscode.commands.executeCommand("editor.action.smartSelect.expand");
		}
	});

	context.subscriptions.push(disposable);
}



export function deactivate() {
}
