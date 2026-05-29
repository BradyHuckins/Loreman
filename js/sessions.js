/* ============================================================
   All sessions
   ============================================================ */

function renderAllSessions() {
  const c = activeCampaign();
  return `
    <div class="section-header">
      <h2>Sessions</h2>
      <div class="actions">
        <button onclick="showLogModal()"><i class="ti ti-pencil-plus"></i> Quick log</button>
        <button class="primary" onclick="createNewSession()"><i class="ti ti-plus"></i> Plan a session</button>
      </div>
    </div>
    ${c.sessions.length === 0 ? `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <i class="ti ti-notebook" style="font-size: 36px; color: var(--ink-faint); margin-bottom: 12px; display: block;"></i>
        <p style="font-family: var(--serif); font-style: italic; color: var(--ink-muted);">No sessions yet.</p>
      </div>
    ` : `
      <div class="stack-sm">
        ${[...c.sessions].sort((a,b) => b.num - a.num).map(s => `
          <div class="npc-card clickable" onclick="go('session-edit', {editing: '${s.id}'})">
            <div class="name-row">
              <span class="name">Session ${s.num}</span>
              ${s.played ? '<span class="role-tag role-ally">Played</span>' : '<span class="role-tag role-neutral">Planned</span>'}
              ${s.date ? `<span style="font-size: 12px; color: var(--ink-faint);">${fmtDate(s.date)}</span>` : ''}
            </div>
            <div class="desc">${esc(s.hook) || '<em style="color: var(--ink-faint);">no hook yet</em>'}</div>
            ${!s.played ? `<div style="margin-top: 8px; font-size: 12px; color: var(--accent-deep);">Prep: ${sessionPrepPercent(s)}%</div>` : ''}
          </div>
        `).join('')}
      </div>
    `}
  `;
}

/* ============================================================
   Session edit
   ============================================================ */

function renderSessionEdit() {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === state.editing);
  if (!s) { go('all-sessions'); return ''; }
  const prevSession = c.sessions.filter(x => x.num < s.num && x.played).sort((a,b) => b.num - a.num)[0];

  return `
    <button class="detail-back" onclick="go('all-sessions')"><i class="ti ti-arrow-left"></i> All sessions</button>
    <div class="row" style="margin-bottom: 4px;">
      <h2>Session ${s.num} ${s.played ? '<span class="role-tag role-ally" style="font-size: 11px; vertical-align: middle;">Played</span>' : ''}</h2>
      <input type="date" style="width: auto; max-width: 180px;" value="${esc(s.date)}" oninput="updateSession('${s.id}','date',this.value)">
    </div>
    <p style="color: var(--ink-muted); margin-bottom: 20px; font-family: var(--serif); font-style: italic;">${s.played ? 'Logged session. Edit notes below.' : 'Fill what you know. Skip what you don\'t.'}</p>

    ${!s.played ? `
      <div class="actions" style="margin-bottom: 20px;">
        <button onclick="go('run-mode', {editing: '${s.id}'})"><i class="ti ti-player-play"></i> Run mode (during play)</button>
      </div>
    ` : ''}

    ${prevSession ? `
      <div class="card" style="background: var(--bg-warm); margin-bottom: 16px; padding: 18px 22px;">
        <div class="row" style="margin-bottom: 8px;">
          <span class="eyebrow">Last session recap</span>
          <span class="status-tag status-auto">auto from S${prevSession.num}</span>
        </div>
        <div style="font-family: var(--serif); font-style: italic; color: var(--ink-soft); line-height: 1.65; font-size: 14px;">
          ${prevSession.notes ? esc(prevSession.notes).split('\n').filter(Boolean).slice(0,3).map(l => '• ' + l).join('<br>') : '<em style="color: var(--ink-faint);">No notes from last session yet.</em>'}
        </div>
      </div>
    ` : ''}

    <div class="card">
      <div class="stack">
        <div>
          <span class="field-label">Opening scene</span>
          <textarea placeholder="Where the camera fades in..." oninput="updateSession('${s.id}','opening',this.value)">${esc(s.opening)}</textarea>
        </div>
        <div>
          <span class="field-label">The hook / inciting incident</span>
          <textarea placeholder="What forces a choice this session?" oninput="updateSession('${s.id}','hook',this.value)">${esc(s.hook)}</textarea>
        </div>
        <div>
          <span class="field-label">First location</span>
          <input type="text" placeholder="A tavern, a forest edge, a guard post..." value="${esc(s.first_location)}" oninput="updateSession('${s.id}','first_location',this.value)">
        </div>
        <div>
          <span class="field-label">How do you want it to end?</span>
          <div class="pills">
            ${['Cliffhanger','Clear next goal','New mystery','Hard-won rest'].map(o => `
              <button class="pill ${s.ending_goal===o?'selected':''}" onclick="updateSession('${s.id}','ending_goal','${escAttr(o)}'); render();">${esc(o)}</button>
            `).join('')}
          </div>
        </div>

        <div>
          <span class="field-label">NPCs likely to appear</span>
          <div class="pills">
            ${c.npcs.length === 0 ? '<span style="font-size: 13px; color: var(--ink-faint);">No NPCs yet</span>' :
              c.npcs.map(n => `
                <button class="pill ${(s.npcs_present||[]).includes(n.id)?'selected':''}" onclick="toggleSessionNPC('${s.id}','${n.id}'); render();">${esc(n.name)}</button>
              `).join('')
            }
          </div>
        </div>

        <div class="backup-box">
          <div class="header">
            <i class="ti ti-bulb"></i> Backup plan <span class="recommended-tag">strongly recommended</span>
          </div>
          <div class="hint">If the party goes sideways, you'll thank yourself. One encounter, location, or NPC.</div>
          <input type="text" placeholder="A friendly bar fight, a wandering bard, a sudden storm..." value="${esc(s.backup)}" oninput="updateSession('${s.id}','backup',this.value)" style="background: white;">
        </div>

        <div>
          <span class="field-label">Notes ${s.played ? '(what happened)' : '(prep notes)'}</span>
          <textarea placeholder="${s.played ? 'Quick bullets — what happened, what threads opened...' : 'Anything else to remember...'}" oninput="updateSession('${s.id}','notes',this.value)" style="min-height: 120px;">${esc(s.notes)}</textarea>
        </div>
      </div>

      <div class="actions spread" style="margin-top: 24px;">
        <button class="danger" onclick="deleteSession('${s.id}')"><i class="ti ti-trash"></i> Delete</button>
        <div class="actions">
          ${!s.played ? `<button class="primary" onclick="markPlayed('${s.id}')"><i class="ti ti-check"></i> Mark as played</button>` : `<button onclick="unmarkPlayed('${s.id}')">Mark as unplayed</button>`}
          <button onclick="go('dashboard')">Done</button>
        </div>
      </div>
    </div>
  `;
}

function toggleSessionNPC(sid, nid) {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === sid);
  if (!s) return;
  if (!s.npcs_present) s.npcs_present = [];
  if (s.npcs_present.includes(nid)) {
    s.npcs_present = s.npcs_present.filter(x => x !== nid);
  } else {
    s.npcs_present.push(nid);
  }
  save();
}

function markPlayed(id) {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === id);
  if (s) {
    s.played = true;
    (s.npcs_present || []).forEach(nid => {
      const npc = c.npcs.find(n => n.id === nid);
      if (npc) npc.lastSeen = s.num;
    });
    save();
    render();
  }
}

function unmarkPlayed(id) {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === id);
  if (s) { s.played = false; save(); render(); }
}

function deleteSession(id) {
  if (!confirm("Delete this session?")) return;
  const c = activeCampaign();
  c.sessions = c.sessions.filter(x => x.id !== id);
  save();
  go('all-sessions');
}

/* ============================================================
   Run mode — for use during actual play
   ============================================================ */

function renderRunMode() {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === state.editing) || c.sessions.find(x => !x.played);
  if (!s) { go('dashboard'); return ''; }
  const presentNPCs = (s.npcs_present || []).map(id => c.npcs.find(n => n.id === id)).filter(Boolean);
  const openThreads = c.threads.slice(0, 6);

  return `
    <div class="run-mode">
      <button class="exit-run" onclick="go('dashboard')"><i class="ti ti-x"></i> Exit</button>

      <div class="exit-inline">
        <button onclick="go('dashboard')"><i class="ti ti-arrow-left"></i> Back to dashboard</button>
        <button onclick="go('session-edit', {editing: '${s.id}'})"><i class="ti ti-pencil"></i> Edit session</button>
      </div>

      <div class="run-header">
        <span class="eyebrow">Run mode — Session ${s.num}</span>
        <h2 style="margin-top: 4px;">${esc(c.name)}</h2>
      </div>

      ${s.opening ? `
        <div class="run-card">
          <h4><i class="ti ti-player-play"></i> Opening</h4>
          <div class="body">${esc(s.opening)}</div>
        </div>
      ` : ''}
      ${s.hook ? `
        <div class="run-card">
          <h4><i class="ti ti-flame"></i> The hook</h4>
          <div class="body">${esc(s.hook)}</div>
        </div>
      ` : ''}
      ${s.first_location ? `
        <div class="run-card">
          <h4><i class="ti ti-map-pin"></i> Starting location</h4>
          <div class="body">${esc(s.first_location)}</div>
        </div>
      ` : ''}
      ${s.backup ? `
        <div class="run-card">
          <h4><i class="ti ti-bulb"></i> Backup plan (if they go sideways)</h4>
          <div class="body">${esc(s.backup)}</div>
        </div>
      ` : ''}

      ${presentNPCs.length > 0 ? `
        <div class="run-card">
          <h4><i class="ti ti-users"></i> NPCs in play</h4>
          ${presentNPCs.map(n => `
            <div class="run-npc">
              <div class="name">${esc(n.name)} <span style="font-size: 11px; padding: 2px 8px; background: rgba(232, 183, 101, 0.15); color: var(--accent-light); border-radius: 999px; margin-left: 6px; text-transform: uppercase; letter-spacing: 0.06em;">${esc(n.role || 'neutral')}</span></div>
              ${n.description ? `<div class="want">${esc(n.description)}</div>` : ''}
              ${n.want ? `<div class="want" style="margin-top: 4px;"><em>Wants: ${esc(n.want)}</em></div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${openThreads.length > 0 ? `
        <div class="run-card">
          <h4><i class="ti ti-link"></i> Open threads</h4>
          ${openThreads.map(t => `
            <div class="thread">
              <span class="dot">●</span>
              <div class="text">${esc(t.text)}${renderThreadLinks(t, c)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="run-card">
        <h4><i class="ti ti-pencil"></i> Log a moment</h4>
        <div style="font-size: 13px; color: rgba(245, 239, 224, 0.7); margin-bottom: 10px; font-family: var(--serif); font-style: italic;">Capture things as they happen — players' great ideas, NPC reactions, new threads.</div>
        <textarea id="run-log" placeholder="Player X tried to seduce the goblin. It worked. Add to memorable moments..." style="min-height: 80px;"></textarea>
        <div class="actions" style="margin-top: 12px;">
          <button class="primary" onclick="appendToSessionNotes('${s.id}')"><i class="ti ti-plus"></i> Add to session notes</button>
          <button onclick="addThreadFromRun('${s.id}')"><i class="ti ti-link"></i> Save as new thread</button>
        </div>
      </div>

      <div class="exit-bottom">
        <button class="primary" onclick="go('dashboard')" style="padding: 12px 24px;"><i class="ti ti-door-exit"></i> Exit run mode</button>
        <div style="font-size: 12px; color: rgba(245, 239, 224, 0.5); margin-top: 12px; font-family: var(--serif); font-style: italic;">Don't forget to mark the session as played when you're done.</div>
      </div>
    </div>
  `;
}

function appendToSessionNotes(sid) {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === sid);
  const txt = document.getElementById('run-log').value.trim();
  if (!txt || !s) return;
  s.notes = s.notes ? s.notes + '\n• ' + txt : '• ' + txt;
  document.getElementById('run-log').value = '';
  save();
}

function addThreadFromRun(sid) {
  const c = activeCampaign();
  const txt = document.getElementById('run-log').value.trim();
  if (!txt) return;
  c.threads.push({
    id: uid(),
    text: txt,
    created: Date.now(),
    lastTouched: null,
    sourceType: 'session',
    sourceSessionId: sid,
    linkedNpcIds: []
  });
  document.getElementById('run-log').value = '';
  save();
  render();
}

