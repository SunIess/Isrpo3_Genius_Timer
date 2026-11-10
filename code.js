const vscode = require('vscode');

let timerInterval;
let remainingSeconds = 0;


function activate(context) {
  const helloCmd = vscode.commands.registerCommand('focusTimer.hello', () => {
    vscode.window.showInformationMessage('+');
  });
  context.subscriptions.push(helloCmd);
  const startCmd = vscode.commands.registerCommand('focusTimer.start', () => {
    remainingSeconds = 25 * 60;
    const know = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    know.text = `⏳ 25:00`;
    know.show();
    timerInterval = setInterval(() => {
      remainingSeconds--;
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      know.text = `⏳ ${min}:${sec.toString().padStart(2, '0')}`;
        if (remainingSeconds <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          know.dispose();
          vscode.window.showInformationMessage('✅ Сессия завершена!');
        }
      }, 1000);
  });
  context.subscriptions.push(helloCmd);
  context.subscriptions.push(startCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };