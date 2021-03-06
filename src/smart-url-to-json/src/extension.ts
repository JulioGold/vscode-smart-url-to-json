// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('urltojson.urltojson', () => {

		let textEditor = vscode.window.activeTextEditor;
		
		if (textEditor != null) {
			let selection = textEditor.selection;
			
			if(!selection.isEmpty) {

				let range: vscode.Range = new vscode.Range(selection.start, selection.end);
				let text = range ? textEditor.document.getText(range).trim() : "";
				let isAWS = text.indexOf(".amazonaws.com") >= 0;
				let isPHP = text.indexOf("/rest/mobile/") >= 0;
				let tempItems = [];
				let items = [];
				
				if (isAWS) {
					let delimiterPos = text.indexOf("?");
					let queryString = text.substr(delimiterPos + 1, text.length - (delimiterPos - 1));

					tempItems = queryString.split("&");
				
					for (let i=0; i < tempItems.length; i++) {
				
						let params = tempItems[i].split("=");
				
						items.push(createJsonPropertyValue(params[0], params[1]));
					}

					writeIntoClipboard(items);
				} else if (isPHP) {
					let delimiterPos = text.indexOf("/rest/mobile/");
					let queryString = text.substr(delimiterPos + 13, text.length - (delimiterPos - 1));
					
					tempItems = queryString.split("/");
					
					for (let i=0; i < tempItems.length; i = (i + 2)) {
						items.push(createJsonPropertyValue(tempItems[i], tempItems[i + 1]));
					}

					writeIntoClipboard(items);
				} else {
					vscode.window.showInformationMessage('Padrão de URL não identificado!');
				}
			}
		}
	});

	function writeIntoClipboard(items: string[]) {
		let finalJson = buildStringToJson(items);

		vscode.env.clipboard.writeText(finalJson)
		.then((text) => {
			vscode.window.showInformationMessage('Conteúdo disponível na área de transferência!');
		});
	}

	function buildStringToJson(items: string[]) {
		return `{\n    ${items.join(',\n    ')}\n}`;
	}

	function createJsonPropertyValue(propertyName: string, propertyValue: string) {
		return `'${propertyName}': '${propertyValue}'`;
	}

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
