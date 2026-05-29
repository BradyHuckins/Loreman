/* ============================================================
   Threads page — now with linked NPCs
   ============================================================ */

function renderThreads() {
  const c = activeCampaign();
  return `
    <div class="section-header">
      <h2>Loose threads</h2>
      <button class="primary" onclick="showAddThreadModal()"><i class="ti ti-plus"></i> Add thread</button>
    </div>
    <p style="color: var(--ink-muted); margin-bottom: 24px; font-family: var(--serif); font-style: italic;">Unanswered questions, unused backstory hooks, player promises. The list you reach for when planning a session.</p>
    <div class="card">
      ${c.threads.length === 0 ? `
        <div class="empty-state" style="padding: 32px;">
          No threads yet. Add one when a player asks something you can't answer, or when an unused backstory hook is sitting there waiting.
        </div>
      ` : `
        <div class="stack-sm">
          ${c.threads.map((t, i) => `
            <div class="thread" style="padding: 14px 0; align-items: start;">
              <span class="dot" style="margin-top: 7px;">●</span>
              <div style="flex: 1;">
                <input type="text" value="${esc(t.text)}" oninput="updateThread(${i},'text',this.value)" style="border: none; background: transparent; padding: 0; font-family: var(--serif); font-size: 15px; box-shadow: none;">
                <div style="margin-top: 6px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                  ${(t.linkedNpcIds || []).map(id => {
                    const n = c.npcs.find(x => x.id === id);
                    return n ? `<span class="npc-link" style="font-family: var(--sans);">${esc(n.name)}</span>` : '';
                  }).join('')}
                  <span style="font-size: 11px; color: var(--ink-faint);">
                    ${t.lastTouched ? 'Last touched ' + fmtRelative(t.lastTouched) : 'Untouched'}
                    ${t.sourceType === 'npc' ? ' · from NPC' : t.sourceType === 'session' ? ' · from session' : ''}
                  </span>
                </div>
              </div>
              <div style="display: flex; gap: 4px;">
                <button class="ghost small" onclick="useThreadAsHook('${t.id}')" title="Use as next hook"><i class="ti ti-arrow-up-right"></i></button>
                <button class="ghost small" onclick="markThreadTouched(${i}); render();" title="Mark touched today"><i class="ti ti-check"></i></button>
                <button class="ghost small" onclick="removeThread(${i}); render();" title="Remove"><i class="ti ti-x"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function updateThread(i, key, value) {
  activeCampaign().threads[i][key] = value;
  save();
}

function markThreadTouched(i) {
  activeCampaign().threads[i].lastTouched = new Date().toISOString().slice(0,10);
  save();
}

function removeThread(i) {
  activeCampaign().threads.splice(i, 1);
  save();
}

