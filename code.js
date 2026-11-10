const vscode = require('vscode');

let timerInterval;
let remainingSeconds = 0;
let know;
let sessionStartTime;
let isBreak = false;


function activate(context) {

  const startCmd = vscode.commands.registerCommand('focusTimer.start', () => {
    if (timerInterval != null) {
      vscode.window.showInformationMessage('⏳ Таймер уже запущен!');
      return;
    }
    startTimer(context, false);
  });
  const stopCmd = vscode.commands.registerCommand('focusTimer.stop', () => {
    if (!timerInterval) {
      vscode.window.showInformationMessage('Таймер не запущен.');
      return;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    know.dispose();
    if (!isBreak) {
      saveSession(context, sessionStartTime, Date.now());
    }
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

function startTimer(context, breakMode) {
  const con = vscode.workspace.getConfiguration('focusTimer');
  isBreak = breakMode;
  const mins = isBreak ? con.get('breakMinutes', 5) : con.get('sessionMinutes', 25);
  secbefend = mins * 60;
  sessionStartTime = Date.now();
  know = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  know.text = isBreak ? `☕ ${mins}:00` : `⏳ ${mins}:00`;
  know.show();
  timerInterval = setInterval(() => {
    secbefend--;
    const min = Math.floor(secbefend / 60);
    const sec = secbefend % 60;
    const icon = isBreak ? '☕' : '⏳';
    know.text = `${icon} ${min}:${sec.toString().padStart(2, '0')}`;
    if (secbefend <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      know.dispose();
      if (con.get('soundEnabled', true)) {
        vscode.window.showInformationMessage(isBreak ? '🔔 Перерыв закончен!' : '🔔 Дзынь! Сессия завершена!');
      } else {
        vscode.window.showInformationMessage(isBreak ? 'Перерыв закончен!' : 'Сессия завершена!');
      }
      if (!isBreak) {
        saveSession(context, sessionStartTime, Date.now());
        if (con.get('autoStartNext', false)) {
          startTimer(context, true); 
        }
      } else {
        if (con.get('autoStartNext', false)) {
          startTimer(context, false); 
        }
      }
    }
  }, 1000);
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

function deactivate() {
  if (timerInterval) clearInterval(timerInterval);
  if (know) know.dispose();
}

module.exports = { activate, deactivate };