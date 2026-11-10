const vscode = require('vscode');

let timerInterval;
let remainingSeconds = 0;
let know;
let sessionStartTime;


function activate(context) {

  const startCmd = vscode.commands.registerCommand('focusTimer.start', () => {
    const con = vscode.workspace.getConfiguration('focusTimer');
    const sessMin = con.get('sessionMinutes', 25);

    if (timerInterval != null) {
      vscode.window.showInformationMessage('⏳ Таймер уже запущен!');
      return;
    }

    sessionStartTime = Date.now();

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
        saveSession(context, sessionStartTime, Date.now());
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
    saveSession(context, sessionStartTime, Date.now());
    vscode.window.showInformationMessage('⏹ Таймер остановлен вручную.');
  });
  const statsCmd = vscode.commands.registerCommand('focusTimer.showStats', () => {
    showStatsPanel(context);
  });
//  context.subscriptions.push(helloCmd);
  context.subscriptions.push(startCmd);
  context.subscriptions.push(stopCmd);
  context.subscriptions.push(statsCmd);
}

function saveSession(opt, start, end) {
  const istory = opt.globalState.get('focusTimer.istory', []);
  istory.push({
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    durationMinutes: Math.round((end - start) / 60000)
  });
  opt.globalState.update('focusTimer.istory', istory);
}

async function showStatsPanel(context) {
  const istory = context.globalState.get('focusTimer.istory', []);
  if (istory.length === 0) {
    vscode.window.showInformationMessage('Пока нет завершеных сесий!');
    return;
  }
  const daiMin = {};
  for (let i = 0; i < istory.length; i++) {
    const  sess = istory[i];
    const day = sess.start.split('T')[0];
    if (!daiMin[day]) {
      daiMin[day] = 0;
    }
    daiMin[day] += sess.durationMinutes;
  }
  const labels = Object.keys(daiMin).sort();
  let maxMin = 0;
  for (let i = 0; i < labels.length; i++) {
    if (daiMin[labels[i]] > maxMin) {
      maxMin = daiMin[labels[i]];
    }
  }
  let text = '# 📊 Статистика Focus Timer\n\n';
  text += '| Дата | Минут | График |\n';
  text += '| :--- | :---: | :--- |\n';
  for (let i = 0; i < labels.length; i++) {
    const day = labels[i];
    const min = daiMin[day];
    const barLength = Math.round((min / maxMin) * 20);
    let bar = '';
    for (let j = 0; j < barLength; j++) {
      bar += '🟦';
    }
    text += `| ${day} | ${min} | ${bar} |\n`;
  }
  const doc = await vscode.workspace.openTextDocument({
    content: text,
    language: 'markdown'
  });
  
  vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
}

function deactivate() {}

module.exports = { activate, deactivate };