const vscode = require('vscode');

function activate(context) {
    const helloCmd = vscode.commands.registerCommand('focusTimer.hello', () => {
        vscode.window.showInformationMessage('+');
    });
    context.subscriptions.push(helloCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };