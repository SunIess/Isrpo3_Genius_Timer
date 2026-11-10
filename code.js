const vscode = require('vscode');

let timerInterval;
let remainingSeconds = 0;
let know;


function activate(context) {

  const startCmd = vscode.commands.registerCommand('focusTimer.start', () => {
    const con = vscode.workspace.getConfiguration('focusTimer');
    const sessMin = con.get('sessionMinutes', 25);

    if (timerInterval != null) {
      vscode.window.showInformationMessage('⏳ Таймер уже запущен!');
      return;
    }
    
    remainingSeconds = sessMin * 60;
    /*const helloCmd = vscode.commands.registerCommand('focusTimer.hello', () => {
      vscode.window.showInformationMessage('+');
    });
    context.subscriptions.push(helloCmd);*/
    know = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,100);

    know.text = `⏳ ${sessMin}:00`;
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
  const stopCmd = vscode.commands.registerCommand('focusTimer.stop', () => {
    if (!timerInterval) {
      vscode.window.showInformationMessage('Таймер не запущен.');
      return;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    know.dispose();
    vscode.window.showInformationMessage('⏹ Таймер остановлен вручную.');
  });
//  context.subscriptions.push(helloCmd);
  context.subscriptions.push(startCmd);
  context.subscriptions.push(stopCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };