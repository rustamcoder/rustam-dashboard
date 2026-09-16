window.RUSTAM_SUPABASE = {
  url: 'https://jeasqgznbjvwurscrcox.supabase.co',
  publishableKey: 'sb_publishable_9Z01h5lDNMg9UXNIGOIZIg_CRcZg4NG',
  allowedEmail: 'torixtube077@gmail.com'
};

// Keep every dashboard metric honest when the account has no activity yet.
window.addEventListener('load', () => {
  const frame = document.querySelector('#frame');
  if (!frame) return;

  function state() {
    try { return JSON.parse(localStorage.getItem('rustam-app') || '{}'); }
    catch { return {}; }
  }

  function emptyCard(doc, selector, text) {
    const box = doc.querySelector(selector);
    if (box && !box.children.length) {
      box.innerHTML = `<div style="padding:18px 0;color:#8e95a3;font-size:11px">${text}</div>`;
    }
  }

  function applyRealMetrics() {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc?.body) return;

    const d = state();
    const goals = Array.isArray(d.goals) ? d.goals : [];
    const tasks = Array.isArray(d.tasks) ? d.tasks : [];
    const habits = Array.isArray(d.habits) ? d.habits : [];
    const focus = Number(d.focus) || 0;
    const done = tasks.filter(t => t && t[3]).length;
    const avg = goals.length ? Math.round(goals.reduce((sum, g) => sum + (Number(g[2]) || 0), 0) / goals.length) : 0;
    const streak = habits.length ? Math.max(0, ...habits.map(h => Number(h?.[1]) || 0)) : 0;

    const kpi = [...doc.querySelectorAll('#kpis .kpi b')];
    const values = [`${done}/${tasks.length}`, `${focus} мин`, `${streak} дней`, `${avg}%`];
    kpi.forEach((el, i) => { if (values[i] !== undefined) el.textContent = values[i]; });

    const statValues = [tasks.length || habits.length || focus ? '—' : '0%', `${streak} дней`, `${focus} мин`, String(done)];
    [...doc.querySelectorAll('#statsKpi .panel b')].forEach((el, i) => {
      if (statValues[i] !== undefined) el.textContent = statValues[i];
    });

    const noActivity = !goals.length && !tasks.length && !habits.length && focus === 0;
    const donut = doc.querySelector('.donut b');
    if (donut && noActivity) donut.textContent = '0%';
    if (noActivity) {
      doc.querySelectorAll('.chart svg').forEach(svg => svg.style.opacity = '.08');
      doc.querySelectorAll('.legend li b').forEach(el => el.textContent = '0%');
    }
    if (!habits.length) {
      doc.querySelectorAll('#heat i').forEach(el => el.style.setProperty('background', '#282d36', 'important'));
    }

    emptyCard(doc, '#overviewGoals', 'Добавь первую цель — здесь появится её прогресс.');
    emptyCard(doc, '#overviewTasks', 'На сегодня пока нет задач.');
    emptyCard(doc, '#goalGrid', 'Целей пока нет. Нажми «Добавить цель», чтобы начать.');
  }

  frame.addEventListener('load', () => {
    applyRealMetrics();
    setInterval(applyRealMetrics, 700);
  });
});
