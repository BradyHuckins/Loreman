/* ============================================================
   DM Tips page
   ============================================================ */

function renderTips() {
  return `
    <div class="section-header"><h2>DM tips</h2></div>
    <p style="color: var(--ink-muted); margin-bottom: 24px; font-family: var(--serif); font-style: italic;">A few reminders worth keeping close. Especially when you're prepping at 11pm the night before a session.</p>
    <div class="stack-sm">
      ${TIPS.map(t => `
        <div class="tip-card">
          <div class="text"><span class="quote-mark">"</span>${esc(t)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

