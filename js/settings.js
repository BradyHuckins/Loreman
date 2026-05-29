/* ============================================================
   Settings — campaign details only
   ============================================================ */

function renderSettings() {
  const c = activeCampaign();
  return `
    <div class="section-header"><h2>Campaign settings</h2></div>
    <div class="card">
      <div class="stack">
        <div>
          <span class="field-label">Campaign name</span>
          <input type="text" value="${esc(c.name)}" oninput="setField('name', this.value)">
        </div>
        <div>
          <span class="field-label">Pitch</span>
          <textarea oninput="setField('pitch', this.value)">${esc(c.pitch)}</textarea>
        </div>
        <div>
          <span class="field-label">System</span>
          <div class="pills">
            ${['D&D 5e','Pathfinder','Homebrew','Other'].map(o => `
              <button class="pill ${c.system===o?'selected':''}" onclick="setField('system','${escAttr(o)}'); render();">${esc(o)}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <span class="field-label">Starting location</span>
          <input type="text" value="${esc(c.setting.starting_location)}" oninput="setNestedField('setting.starting_location', this.value)">
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 18px;">
          <div class="row" style="margin-bottom: 12px;">
            <span class="field-label" style="margin-bottom: 0;">Factions</span>
            <span style="font-size: 12px; color: var(--ink-faint);">${c.factions.length} of 3</span>
          </div>
          <div class="stack-sm">
            ${c.factions.map((f, i) => `
              <div class="faction-row">
                <i class="ti ti-shield-half"></i>
                <div class="body" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <input type="text" placeholder="Name" value="${esc(f.name)}" oninput="updateFaction(${i},'name',this.value)" style="flex: 1; min-width: 140px;">
                  <input type="text" placeholder="What they want..." value="${esc(f.want)}" oninput="updateFaction(${i},'want',this.value)" style="flex: 2; min-width: 180px;">
                </div>
                <button class="ghost small" onclick="removeFaction(${i}); render();"><i class="ti ti-x"></i></button>
              </div>
            `).join('')}
            ${c.factions.length < 3 ? `<button class="dashed" onclick="showStuck('faction-settings')" style="width: 100%; padding: 12px;"><i class="ti ti-plus"></i> Add a faction</button>` : ''}
          </div>
          ${state.stuck === 'faction-settings' ? renderStuckFactions() : ''}
        </div>
      </div>
    </div>

    <div class="actions spread" style="margin-top: 16px;">
      <button onclick="go('campaigns')"><i class="ti ti-list"></i> Manage all campaigns</button>
      <button class="danger" onclick="deleteCampaign('${c.id}')"><i class="ti ti-trash"></i> Delete this campaign</button>
    </div>
  `;
}

