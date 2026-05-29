/* ============================================================
   All NPCs page
   ============================================================ */

function renderAllNPCs() {
  const c = activeCampaign();
  const anyPlayed = hasAnyPlayedSession(c);
  return `
    <div class="section-header">
      <h2>NPCs</h2>
      <div class="actions">
        <button onclick="showStuck('npc-page')"><i class="ti ti-dice"></i> Random one</button>
        <button class="primary" onclick="addCustomNPC()"><i class="ti ti-plus"></i> Add NPC</button>
      </div>
    </div>
    ${state.stuck === 'npc-page' ? renderStuckNPCsPage() : ''}
    ${c.npcs.length === 0 ? `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <i class="ti ti-users" style="font-size: 36px; color: var(--ink-faint); margin-bottom: 12px; display: block;"></i>
        <p style="font-family: var(--serif); font-style: italic; color: var(--ink-muted);">No NPCs yet. Adding a couple before your next session is the single best use of 5 minutes.</p>
      </div>
    ` : `
      <div class="stack-sm">
        ${c.npcs.map(n => `
          <div class="npc-card clickable" onclick="go('npc-edit', {editing: '${n.id}'})">
            <div class="name-row">
              <span class="name">${esc(n.name) || '(unnamed)'}</span>
              <span class="role-tag ${roleClass(n.role)}">${esc(n.role || 'neutral')}</span>
              ${anyPlayed && n.lastSeen ? `<span style="font-size: 11px; color: var(--ink-faint);">last seen S${n.lastSeen}</span>` : anyPlayed && !n.lastSeen ? '<span style="font-size: 11px; color: var(--ink-faint);">not yet seen</span>' : ''}
            </div>
            <div class="desc">${esc(n.description) || '<em style="color: var(--ink-faint);">no description</em>'}</div>
            <div class="want"><span class="label">Wants:</span> ${esc(n.want) || '<em style="color: var(--ink-faint);">unknown</em>'}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function renderStuckNPCsPage() {
  const c = activeCampaign();
  const exclude = c.npcs.map(n => n.name);
  const picks = state.stuckData || randomFrom(NPC_POOL.filter(n => !exclude.includes(n.name)), 3);
  state.stuckData = picks;
  return `
    <div class="card" style="margin-bottom: 16px;">
      <span class="eyebrow">Pick one — edit anything afterwards</span>
      <div class="stack-sm" style="margin-top: 12px;">
        ${picks.map((n, i) => `
          <div class="npc-card clickable" onclick="useNPC(${i})">
            <div class="name-row">
              <span class="name">${esc(n.name)}</span>
              <span class="role-tag ${roleClass(n.role)}">${esc(n.role)}</span>
            </div>
            <div class="desc">${esc(n.description)}</div>
            <div class="want"><span class="label">Wants:</span> ${esc(n.want)}</div>
          </div>
        `).join('')}
      </div>
      <div class="actions" style="margin-top: 14px;">
        <button class="small" onclick="rerollStuck('npc-page')"><i class="ti ti-refresh"></i> Different ones</button>
        <button class="small ghost" onclick="cancelStuck()">Cancel</button>
      </div>
    </div>
  `;
}

/* ============================================================
   NPC edit
   ============================================================ */

function renderNPCEdit() {
  const c = activeCampaign();
  const n = c.npcs.find(x => x.id === state.editing);
  if (!n) { go('all-npcs'); return ''; }
  return `
    <button class="detail-back" onclick="go('all-npcs')"><i class="ti ti-arrow-left"></i> All NPCs</button>
    <div class="card">
      <span class="eyebrow">NPC</span>
      <div class="stack" style="margin-top: 12px;">
        <div>
          <span class="field-label">Name</span>
          <input type="text" placeholder="Name (or speech tic — 'the man with the limp')" value="${esc(n.name)}" oninput="updateNPC('${n.id}','name',this.value)">
        </div>
        <div>
          <span class="field-label">Role</span>
          <div class="pills">
            ${['Ally','Antagonist','Quest-giver','Neutral','Mystery','Comic relief'].map(r => `
              <button class="pill ${n.role===r?'selected':''}" onclick="updateNPC('${n.id}','role','${escAttr(r)}'); render();">${esc(r)}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <span class="field-label">One-line description</span>
          <input type="text" placeholder="A weathered ranger who guides travelers through the woods." value="${esc(n.description)}" oninput="updateNPC('${n.id}','description',this.value)">
          <div class="field-hint">Tip: pick a real-world accent or speech tic. Makes voicing them way easier at the table.</div>
        </div>
        <div>
          <span class="field-label">What do they want?</span>
          <input type="text" placeholder="To find her missing sister." value="${esc(n.want)}" oninput="updateNPC('${n.id}','want',this.value)">
          <div class="field-hint">If you know the want, you can roleplay them anywhere.</div>
        </div>
        <div>
          <span class="field-label">Notes (optional)</span>
          <textarea placeholder="Voice, mannerisms, secrets they're hiding..." oninput="updateNPC('${n.id}','notes',this.value)">${esc(n.notes || '')}</textarea>
        </div>
      </div>
      <div class="actions spread" style="margin-top: 24px;">
        <button class="danger" onclick="deleteNPCById('${n.id}')"><i class="ti ti-trash"></i> Delete</button>
        <button class="primary" onclick="go('all-npcs')">Done</button>
      </div>
    </div>
  `;
}

function updateNPC(id, key, value) {
  const c = activeCampaign();
  const n = c.npcs.find(x => x.id === id);
  if (n) { n[key] = value; save(); }
}

function deleteNPCById(id) {
  if (!confirm("Delete this NPC?")) return;
  const c = activeCampaign();
  c.threads = c.threads.filter(t => t.sourceId !== id);
  c.npcs = c.npcs.filter(n => n.id !== id);
  save();
  go('all-npcs');
}

