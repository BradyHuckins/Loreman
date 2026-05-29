/* ============================================================
   Dashboard
   ============================================================ */

function renderDashboard() {
  const c = activeCampaign();
  const nextSession = c.sessions.find(s => !s.played) || null;
  const prep = nextSession ? sessionPrepPercent(nextSession) : 0;
  const untouched = c.threads.filter(t => !t.lastTouched);

  return `
    <div class="dashboard-hero">
      <div style="flex: 1;">
        <h1>${esc(c.name)}</h1>
        <div class="pitch">${esc(c.pitch) || '<em style="color: var(--ink-faint); font-style: normal;">No pitch yet — add one in settings</em>'}</div>
      </div>
      <button class="ghost" onclick="go('settings')" title="Edit"><i class="ti ti-edit"></i></button>
    </div>

    ${nextSession ? `
      <div class="next-session-card">
        <div class="row">
          <div>
            <span class="eyebrow">Next session</span>
            <div class="title" style="margin-top: 4px;">Session ${nextSession.num}${nextSession.date ? ' · ' + fmtDate(nextSession.date) : ''}</div>
          </div>
          <div class="actions">
            <button onclick="go('run-mode', {editing: '${nextSession.id}'})"><i class="ti ti-player-play"></i> Run mode</button>
            <button class="primary" onclick="go('session-edit', {editing: '${nextSession.id}'})"><i class="ti ti-pencil"></i> Prep</button>
          </div>
        </div>
        <div class="row" style="margin-top: 6px;">
          <div class="progress"><div style="width: ${prep}%;"></div></div>
          <span style="font-size: 12px; color: var(--accent-deep); font-weight: 500;">Prep: ${prep}%</span>
        </div>
      </div>
    ` : `
      <div class="next-session-card">
        <div class="row">
          <div>
            <span class="eyebrow">No upcoming session</span>
            <div class="title" style="margin-top: 4px;">Ready to plan another?</div>
          </div>
          <button class="primary" onclick="createNewSession()"><i class="ti ti-plus"></i> Plan next session</button>
        </div>
      </div>
    `}

    <div class="quick-actions">
      <button onclick="showLogModal()"><i class="ti ti-pencil-plus"></i> Quick log: what just happened</button>
      <button onclick="showAddThreadModal()"><i class="ti ti-link"></i> Add a thread</button>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-header">
          <div class="left"><i class="ti ti-notebook"></i><h4>Sessions (${c.sessions.length})</h4></div>
          <span class="panel-link" onclick="go('all-sessions')">See all <i class="ti ti-arrow-right" style="font-size: 12px;"></i></span>
        </div>
        ${c.sessions.length === 0 ? '<div class="empty-state">No sessions yet</div>' : c.sessions.slice(-3).reverse().map(s => `
          <div class="item-row" onclick="go('session-edit', {editing: '${s.id}'})">
            <div class="title">Session ${s.num}${s.hook ? ' · ' + esc(s.hook.slice(0, 44)) + (s.hook.length > 44 ? '...' : '') : ''}</div>
            <div class="meta">${s.played ? 'Played' : 'Planned'}${s.date ? ' · ' + fmtDate(s.date) : ''}</div>
          </div>
        `).join('')}
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="left"><i class="ti ti-users"></i><h4>NPCs (${c.npcs.length})</h4></div>
          <span class="panel-link" onclick="go('all-npcs')">See all <i class="ti ti-arrow-right" style="font-size: 12px;"></i></span>
        </div>
        ${c.npcs.length === 0 ? '<div class="empty-state">No NPCs yet</div>' : c.npcs.slice(0, 4).map(n => `
          <div class="item-row" onclick="go('npc-edit', {editing: '${n.id}'})">
            <div class="row" style="gap: 8px;">
              <span class="title">${esc(n.name) || '(unnamed)'}</span>
              <span class="role-tag ${roleClass(n.role)}">${esc(n.role || 'neutral')}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="panel" style="margin-top: 16px;">
      <div class="panel-header">
        <div class="left"><i class="ti ti-link"></i><h4>Loose threads (${c.threads.length})</h4></div>
        <span class="panel-link" onclick="go('threads')">Manage <i class="ti ti-arrow-right" style="font-size: 12px;"></i></span>
      </div>
      ${c.threads.length === 0 ? '<div class="empty-state">No threads yet. Add one when an unanswered question comes up at the table.</div>' :
        c.threads.slice(0, 5).map(t => `
          <div class="thread">
            <span class="dot">●</span>
            <div class="text">
              ${esc(t.text)}${renderThreadLinks(t, c)}
              <span class="meta"> · ${t.lastTouched ? 'last touched ' + fmtRelative(t.lastTouched) : 'untouched'}</span>
            </div>
            <div class="thread-actions">
              <button class="ghost small" onclick="useThreadAsHook('${t.id}')" title="Use as next session's hook"><i class="ti ti-arrow-up-right"></i></button>
            </div>
          </div>
        `).join('')
      }
    </div>

    <div class="tip-footer">
      <span class="eyebrow">A reminder</span>
      <span class="quote-mark">"</span>${esc(rotatingTip())}
    </div>
  `;
}

function renderThreadLinks(t, c) {
  if (!t.linkedNpcIds || t.linkedNpcIds.length === 0) return '';
  return t.linkedNpcIds.map(id => {
    const n = c.npcs.find(x => x.id === id);
    return n ? `<span class="npc-link">${esc(n.name)}</span>` : '';
  }).join('');
}

function sessionPrepPercent(s) {
  const checks = [s.opening, s.hook, s.first_location, s.ending_goal, s.backup, (s.npcs_present||[]).length > 0];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function createNewSession() {
  const c = activeCampaign();
  const lastNum = c.sessions.reduce((max, s) => Math.max(max, s.num), 0);
  const newSession = {
    id: uid(),
    num: lastNum + 1,
    date: '',
    opening: '',
    hook: '',
    first_location: '',
    ending_goal: '',
    backup: '',
    npcs_present: [],
    played: false,
    notes: ''
  };
  c.sessions.push(newSession);
  save();
  go('session-edit', { editing: newSession.id });
}

/* ============================================================
   Use thread as next session's hook
   ============================================================ */

function useThreadAsHook(tid) {
  const c = activeCampaign();
  const t = c.threads.find(x => x.id === tid);
  if (!t) return;
  let nextSession = c.sessions.find(s => !s.played);
  if (!nextSession) {
    const lastNum = c.sessions.reduce((max, s) => Math.max(max, s.num), 0);
    nextSession = {
      id: uid(),
      num: lastNum + 1,
      date: '',
      opening: '',
      hook: t.text,
      first_location: '',
      ending_goal: '',
      backup: '',
      npcs_present: [...(t.linkedNpcIds || [])],
      played: false,
      notes: ''
    };
    c.sessions.push(nextSession);
  } else {
    if (nextSession.hook && !confirm(`Replace the hook for Session ${nextSession.num}?\n\nCurrent: ${nextSession.hook.slice(0, 80)}`)) return;
    nextSession.hook = t.text;
    (t.linkedNpcIds || []).forEach(id => {
      if (!nextSession.npcs_present.includes(id)) nextSession.npcs_present.push(id);
    });
  }
  t.lastTouched = new Date().toISOString().slice(0, 10);
  save();
  go('session-edit', { editing: nextSession.id });
}

/* ============================================================
   Quick log modal — fast "what just happened"
   ============================================================ */

function showLogModal() {
  const c = activeCampaign();
  const lastPlayedNum = c.sessions.filter(s => s.played).reduce((m, s) => Math.max(m, s.num), 0);
  const plannedSession = c.sessions.find(s => !s.played);
  const targetSession = plannedSession || { id: 'NEW', num: lastPlayedNum + 1 };
  state.modal = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <h3>Quick log — Session ${targetSession.num}</h3>
        <p style="font-size: 14px; margin-bottom: 18px;">Three things. Three minutes. The full editor's there when you want it.</p>
        <div class="stack">
          <div>
            <span class="field-label">What happened? (bullets are fine)</span>
            <textarea id="quick-notes" placeholder="• The party rescued Brenna&#10;• Hooded Man got away&#10;• Found a strange amulet" style="min-height: 100px;"></textarea>
          </div>
          <div>
            <span class="field-label">New thread? (something unanswered to track)</span>
            <input type="text" id="quick-thread" placeholder="Who is the Hooded Man working for?">
          </div>
          <div>
            <span class="field-label">NPCs who appeared</span>
            <div class="pills" id="quick-npcs">
              ${c.npcs.length === 0 ? '<span style="font-size: 13px; color: var(--ink-faint);">No NPCs yet</span>' :
                c.npcs.map(n => `
                  <button class="pill" data-id="${n.id}" onclick="this.classList.toggle('selected')">${esc(n.name)}</button>
                `).join('')
              }
            </div>
          </div>
        </div>
        <div class="actions end" style="margin-top: 24px;">
          <button onclick="closeModal()">Cancel</button>
          <button class="primary" onclick="submitQuickLog('${targetSession.id}')"><i class="ti ti-check"></i> Log it</button>
        </div>
      </div>
    </div>
  `;
  render();
}

function closeModal() { state.modal = null; render(); }

function submitQuickLog(targetSessionId) {
  const c = activeCampaign();
  const notes = document.getElementById('quick-notes').value.trim();
  const newThread = document.getElementById('quick-thread').value.trim();
  const selectedNPCs = [...document.querySelectorAll('#quick-npcs .pill.selected')].map(b => b.dataset.id);

  let session;
  if (targetSessionId === 'NEW') {
    const lastNum = c.sessions.reduce((max, s) => Math.max(max, s.num), 0);
    session = {
      id: uid(),
      num: lastNum + 1,
      date: new Date().toISOString().slice(0, 10),
      opening: '', hook: '', first_location: '', ending_goal: '', backup: '',
      npcs_present: selectedNPCs,
      played: true,
      notes
    };
    c.sessions.push(session);
  } else {
    session = c.sessions.find(s => s.id === targetSessionId);
    if (session) {
      session.played = true;
      session.notes = session.notes ? session.notes + '\n' + notes : notes;
      if (!session.date) session.date = new Date().toISOString().slice(0, 10);
      selectedNPCs.forEach(id => {
        if (!session.npcs_present.includes(id)) session.npcs_present.push(id);
      });
    }
  }
  // Update lastSeen
  selectedNPCs.forEach(id => {
    const npc = c.npcs.find(n => n.id === id);
    if (npc) npc.lastSeen = session.num;
  });
  // Add new thread
  if (newThread) {
    c.threads.push({
      id: uid(),
      text: newThread,
      created: Date.now(),
      lastTouched: null,
      sourceType: 'session',
      sourceSessionId: session.id,
      linkedNpcIds: []
    });
  }
  save();
  state.modal = null;
  go('dashboard');
}

/* ============================================================
   Add thread modal
   ============================================================ */

function showAddThreadModal() {
  const c = activeCampaign();
  state.modal = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <h3>Add a loose thread</h3>
        <p style="font-size: 14px; margin-bottom: 18px;">An unanswered question, an unused backstory hook, a promise to follow up on.</p>
        <div class="stack">
          <div>
            <span class="field-label">The thread</span>
            <input type="text" id="thread-text" placeholder="Who is the Hooded Man working for?">
          </div>
          ${c.npcs.length > 0 ? `
            <div>
              <span class="field-label">Linked NPCs (optional)</span>
              <div class="pills" id="thread-npcs">
                ${c.npcs.map(n => `
                  <button class="pill" data-id="${n.id}" onclick="this.classList.toggle('selected')">${esc(n.name)}</button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="actions end" style="margin-top: 24px;">
          <button onclick="closeModal()">Cancel</button>
          <button class="primary" onclick="submitAddThread()"><i class="ti ti-plus"></i> Add thread</button>
        </div>
      </div>
    </div>
  `;
  render();
}

function submitAddThread() {
  const c = activeCampaign();
  const text = document.getElementById('thread-text').value.trim();
  if (!text) { closeModal(); return; }
  const selectedNPCs = [...document.querySelectorAll('#thread-npcs .pill.selected')].map(b => b.dataset.id);
  c.threads.push({
    id: uid(),
    text,
    created: Date.now(),
    lastTouched: null,
    sourceType: 'manual',
    linkedNpcIds: selectedNPCs
  });
  save();
  state.modal = null;
  render();
}

