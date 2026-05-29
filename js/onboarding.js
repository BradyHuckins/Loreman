/* ============================================================
   Empty state — first time
   ============================================================ */

function renderEmpty() {
  return `
    <div class="welcome-hero">
      <i class="ti ti-feather feather"></i>
      <h1>Loremaster</h1>
      <p class="tagline">Run your first D&amp;D campaign without the overwhelm.</p>
    </div>
    <div class="card" style="text-align: center; padding: 48px 32px; max-width: 560px; margin: 0 auto;">
      <p style="margin-bottom: 28px; font-family: var(--serif); font-style: italic; font-size: 17px;">No campaigns yet. Let's build your first one — takes about ten minutes, and you can skip anything you're not ready for.</p>
      <button class="primary" style="padding: 12px 24px; font-size: 15px;" onclick="startNewCampaign()"><i class="ti ti-sparkles"></i> Start my first campaign</button>
    </div>
  `;
}

function startNewCampaign() {
  const c = defaultCampaign();
  state.campaigns.push(c);
  state.activeId = c.id;
  state.showSwitcher = false;
  go('onboard-pitch');
}

/* ============================================================
   Onboarding: Pitch (with calibration folded in)
   ============================================================ */

function renderOnboardPitch() {
  const c = activeCampaign();
  return `
    <div class="progress-bar">
      <div class="current"></div><div></div><div></div><div></div>
    </div>
    <p class="onboarding-tip">${esc(rotatingTip())}</p>
    <div class="card">
      <span class="eyebrow">Step 1 of 3 · The pitch</span>
      <h2 style="margin-top: 8px; margin-bottom: 8px;">What's your campaign about?</h2>
      <p style="margin-bottom: 20px;">Two or three sentences. Pretend you're texting a friend to get them excited. Don't overthink it — you'll change it later.</p>

      <div class="example-box">
        <span class="eyebrow">Example</span>
        "The kingdom of Veyra is rotting from the inside — the king is dead, his heirs are at each other's throats, and something old is stirring in the mountains. You're a band of nobodies who happen to be in the wrong place at the right time."
      </div>

      <textarea placeholder="Your pitch..." oninput="setField('pitch', this.value)">${esc(c.pitch)}</textarea>

      ${state.stuck === 'pitch' ? renderStuckPitches() : ''}

      <div class="actions" style="margin-top: 14px;">
        <button onclick="showStuck('pitch')"><i class="ti ti-dice-5"></i> I'm stuck — give me ideas</button>
      </div>

      <div style="border-top: 1px solid var(--border); margin-top: 24px; padding-top: 20px;">
        <span class="field-sublabel">Quick context (optional, helps us help you)</span>
        <div class="stack">
          <div>
            <span class="field-label">Have you DM'd before?</span>
            <div class="pills">
              ${['Never','Once or twice','A few sessions','Lots'].map(o => `
                <button class="pill ${c.experience===o?'selected':''}" onclick="setField('experience','${escAttr(o)}'); render();">${esc(o)}</button>
              `).join('')}
            </div>
          </div>
          <div>
            <span class="field-label">System?</span>
            <div class="pills">
              ${['D&D 5e','Pathfinder','Homebrew','Other'].map(o => `
                <button class="pill ${c.system===o?'selected':''}" onclick="setField('system','${escAttr(o)}'); render();">${esc(o)}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="actions spread" style="margin-top: 24px;">
        <button onclick="abandonOnboarding()"><i class="ti ti-x"></i> Cancel</button>
        <div class="actions">
          <button class="ghost" onclick="go('onboard-setting')">Skip</button>
          <button class="primary" onclick="go('onboard-setting')">Continue <i class="ti ti-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function abandonOnboarding() {
  if (confirm("Cancel and discard this new campaign?")) {
    state.campaigns = state.campaigns.filter(c => c.id !== state.activeId);
    state.activeId = state.campaigns[0]?.id || null;
    save();
    go(state.campaigns.length === 0 ? 'campaigns-empty' : 'dashboard');
  }
}

function setField(key, value) {
  const c = activeCampaign();
  if (!c) return;
  c[key] = value;
  save();
}

function setNestedField(path, value) {
  const c = activeCampaign();
  if (!c) return;
  const parts = path.split('.');
  let obj = c;
  for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
  obj[parts[parts.length - 1]] = value;
  save();
}

function showStuck(kind) { state.stuck = kind; state.stuckData = null; render(); }
function rerollStuck(kind) { state.stuckData = null; state.stuck = kind; render(); }
function cancelStuck() { state.stuck = null; state.stuckData = null; render(); }

function renderStuckPitches() {
  const picks = state.stuckData || randomFrom(PITCH_POOL, 3);
  state.stuckData = picks;
  return `
    <div class="stuck-suggestions">
      <span class="eyebrow">Pick one to use as a starting point — you can edit anything</span>
      ${picks.map((p, i) => `<div class="stuck-card" onclick="usePitch(${i})">${esc(p)}</div>`).join('')}
      <div class="stuck-actions">
        <button class="small" onclick="rerollStuck('pitch')"><i class="ti ti-refresh"></i> Different ones</button>
        <button class="small ghost" onclick="cancelStuck()">Cancel</button>
      </div>
    </div>
  `;
}

function usePitch(i) {
  activeCampaign().pitch = state.stuckData[i];
  state.stuck = null;
  state.stuckData = null;
  save();
  render();
}

/* ============================================================
   Onboarding: Setting
   ============================================================ */

function renderOnboardSetting() {
  const c = activeCampaign();
  const s = c.setting;
  return `
    <div class="progress-bar">
      <div class="done"></div><div class="current"></div><div></div><div></div>
    </div>
    <p class="onboarding-tip">${esc(rotatingTip())}</p>
    <div class="card">
      <span class="eyebrow">Step 2 of 3 · Where it starts</span>
      <h2 style="margin-top: 8px; margin-bottom: 8px;">Set the stage</h2>
      <p style="margin-bottom: 20px;">Pick the path of least resistance. You don't need to build a world from scratch.</p>

      <span class="field-label">What kind of setting?</span>
      <div class="pills" style="margin-bottom: 18px;">
        <button class="pill ${s.type==='published'?'selected':''}" onclick="setNestedField('setting.type','published'); render();">Use a published setting</button>
        <button class="pill ${s.type==='borrowed'?'selected':''}" onclick="setNestedField('setting.type','borrowed'); render();">Borrow a world I love</button>
        <button class="pill ${s.type==='homebrew'?'selected':''}" onclick="setNestedField('setting.type','homebrew'); render();">Build my own</button>
      </div>

      ${s.type ? `
        <div style="margin-bottom: 18px;">
          <span class="field-label">${s.type==='published'?'Which setting?':s.type==='borrowed'?'What world?':'Name your world'}</span>
          <input type="text" placeholder="${s.type==='published'?'Forgotten Realms, Eberron...':s.type==='borrowed'?'Middle-earth, Hyrule, Star Wars...':'Ardenmoor, The Shattered Coast...'}" value="${esc(s.name)}" oninput="setNestedField('setting.name', this.value)">
        </div>
      ` : ''}

      <div style="margin-bottom: 18px;">
        <span class="field-label">Where does Session 1 begin?</span>
        <input type="text" placeholder="A muddy tavern, a temple at dawn, the deck of a ship..." value="${esc(s.starting_location)}" oninput="setNestedField('setting.starting_location', this.value)">
        <div class="field-hint">A tavern works. A tavern always works.</div>
      </div>

      <div style="border-top: 1px solid var(--border); padding-top: 18px; margin-top: 22px;">
        <div class="row" style="margin-bottom: 12px;">
          <span class="field-label" style="margin-bottom: 0;">Major factions (optional)</span>
          <span style="font-size: 12px; color: var(--ink-faint);">${c.factions.length} of 3</span>
        </div>
        <div class="stack-sm">
          ${c.factions.map((f, i) => `
            <div class="faction-row">
              <i class="ti ti-shield-half"></i>
              <div class="body">
                <div class="name">${esc(f.name) || '(unnamed)'}</div>
                <div class="want">Wants: ${esc(f.want) || '...'}</div>
              </div>
              <button class="ghost small" onclick="removeFaction(${i})" title="Remove"><i class="ti ti-x"></i></button>
            </div>
          `).join('')}
          ${c.factions.length < 3 ? `
            <button class="dashed" style="width: 100%; padding: 12px;" onclick="showStuck('faction')"><i class="ti ti-plus"></i> Add a faction (we'll help)</button>
          ` : ''}
        </div>
        ${state.stuck === 'faction' ? renderStuckFactions() : ''}
        <div class="field-hint" style="margin-top: 10px;">Three is plenty for a starter campaign.</div>
      </div>

      <div class="actions spread" style="margin-top: 24px;">
        <button onclick="go('onboard-pitch')"><i class="ti ti-arrow-left"></i> Back</button>
        <div class="actions">
          <button class="ghost" onclick="go('onboard-npcs')">Skip</button>
          <button class="primary" onclick="go('onboard-npcs')">Continue <i class="ti ti-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderStuckFactions() {
  const c = activeCampaign();
  const exclude = c.factions.map(f => f.name);
  const picks = state.stuckData || randomFrom(FACTION_POOL.filter(f => !exclude.includes(f.name)), 3);
  state.stuckData = picks;
  return `
    <div class="stuck-suggestions" style="margin-top: 10px;">
      <span class="eyebrow">Pick one — or use as inspiration for your own</span>
      ${picks.map((f, i) => `
        <div class="stuck-card" onclick="useFaction(${i})">
          <strong style="font-family: var(--serif); font-style: normal; color: var(--ink); display: block; margin-bottom: 2px;">${esc(f.name)}</strong>
          <span>Wants ${esc(f.want)}</span>
        </div>
      `).join('')}
      <div class="stuck-actions">
        <button class="small" onclick="rerollStuck('faction')"><i class="ti ti-refresh"></i> Different ones</button>
        <button class="small" onclick="addCustomFaction()"><i class="ti ti-pencil"></i> Write my own</button>
        <button class="small ghost" onclick="cancelStuck()">Cancel</button>
      </div>
    </div>
  `;
}

function useFaction(i) {
  activeCampaign().factions.push({ ...state.stuckData[i] });
  state.stuck = null;
  state.stuckData = null;
  save();
  render();
}

function addCustomFaction() {
  activeCampaign().factions.push({ name: '', want: '' });
  state.stuck = null;
  state.stuckData = null;
  save();
  render();
}

function removeFaction(i) {
  activeCampaign().factions.splice(i, 1);
  save();
  render();
}

function updateFaction(i, key, value) {
  activeCampaign().factions[i][key] = value;
  save();
}

/* ============================================================
   Onboarding: NPCs
   ============================================================ */

function renderOnboardNPCs() {
  const c = activeCampaign();
  return `
    <div class="progress-bar">
      <div class="done"></div><div class="done"></div><div class="current"></div><div></div>
    </div>
    <p class="onboarding-tip">${esc(rotatingTip())}</p>
    <div class="card">
      <span class="eyebrow">Step 3 of 3 · Starting cast & session one</span>
      <h2 style="margin-top: 8px; margin-bottom: 8px;">Who will the party meet?</h2>
      <p style="margin-bottom: 20px;">Three NPCs is enough to start. You'll invent more at the table — you always do.</p>

      <div class="stack-sm">
        ${c.npcs.map((n, i) => renderNPCCardCompact(n, i)).join('')}
        ${c.npcs.length < 5 ? `
          <button class="dashed" style="width: 100%; padding: 14px;" onclick="showStuck('npc')"><i class="ti ti-dice"></i> Add an NPC (we'll help)</button>
        ` : ''}
      </div>
      ${state.stuck === 'npc' ? renderStuckNPCs() : ''}
      ${c.npcs.length === 0 ? '<div class="field-hint" style="margin-top: 14px; text-align: center;">You can skip — but a couple of NPCs ready before Session 1 saves you mid-game.</div>' : ''}

      <div class="actions spread" style="margin-top: 24px;">
        <button onclick="go('onboard-setting')"><i class="ti ti-arrow-left"></i> Back</button>
        <div class="actions">
          <button class="ghost" onclick="go('onboard-session1')">Skip</button>
          <button class="primary" onclick="go('onboard-session1')">Continue <i class="ti ti-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderNPCCardCompact(n, i) {
  return `
    <div class="npc-card" style="padding: 14px 18px;">
      <div class="name-row">
        <span class="name">${esc(n.name) || '(unnamed)'}</span>
        <span class="role-tag ${roleClass(n.role)}">${esc(n.role || 'neutral')}</span>
        <div style="flex: 1;"></div>
        <button class="ghost small" onclick="removeNPC(${i})" title="Remove"><i class="ti ti-x"></i></button>
      </div>
      <div class="desc">${esc(n.description)}</div>
      <div class="want"><span class="label">Wants:</span> ${esc(n.want)}</div>
    </div>
  `;
}

function renderStuckNPCs() {
  const c = activeCampaign();
  const exclude = c.npcs.map(n => n.name);
  const picks = state.stuckData || randomFrom(NPC_POOL.filter(n => !exclude.includes(n.name)), 3);
  state.stuckData = picks;
  return `
    <div class="stuck-suggestions" style="margin-top: 12px;">
      <span class="eyebrow">Pick one — edit anything once added</span>
      ${picks.map((n, i) => `
        <div class="stuck-card" onclick="useNPC(${i})" style="display: block;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-style: normal;">
            <strong style="font-family: var(--serif); color: var(--ink);">${esc(n.name)}</strong>
            <span class="role-tag ${roleClass(n.role)}" style="font-size: 9px;">${esc(n.role)}</span>
          </div>
          <div style="font-style: normal; font-family: var(--sans); font-size: 13px; line-height: 1.5;">${esc(n.description)}</div>
          <div style="font-style: italic; color: var(--ink-muted); margin-top: 4px;">Wants ${esc(n.want).toLowerCase()}</div>
        </div>
      `).join('')}
      <div class="stuck-actions">
        <button class="small" onclick="rerollStuck('npc')"><i class="ti ti-refresh"></i> Different ones</button>
        <button class="small" onclick="addCustomNPC()"><i class="ti ti-pencil"></i> Write my own</button>
        <button class="small ghost" onclick="cancelStuck()">Cancel</button>
      </div>
    </div>
  `;
}

function useNPC(i) {
  const c = activeCampaign();
  const npc = { ...state.stuckData[i], id: uid(), lastSeen: null, notes: '' };
  c.npcs.push(npc);
  if (npc.want) {
    c.threads.push({
      id: uid(),
      text: `${npc.name}'s want — ${npc.want.toLowerCase().replace(/\.$/, '')}`,
      created: Date.now(),
      lastTouched: null,
      sourceType: 'npc',
      sourceId: npc.id,
      linkedNpcIds: [npc.id]
    });
  }
  state.stuck = null;
  state.stuckData = null;
  save();
  render();
}

function addCustomNPC() {
  const c = activeCampaign();
  const npc = { id: uid(), name: '', role: 'Neutral', description: '', want: '', lastSeen: null, notes: '' };
  c.npcs.push(npc);
  state.stuck = null;
  state.stuckData = null;
  save();
  if (state.view === 'onboard-npcs') {
    render();
  } else {
    go('npc-edit', { editing: npc.id });
  }
}

function removeNPC(i) {
  const c = activeCampaign();
  const npc = c.npcs[i];
  c.threads = c.threads.filter(t => t.sourceId !== npc.id);
  c.npcs.splice(i, 1);
  save();
  render();
}

/* ============================================================
   Onboarding: Session 1
   ============================================================ */

function renderOnboardSession1() {
  const c = activeCampaign();
  if (c.sessions.length === 0) {
    c.sessions.push({
      id: uid(),
      num: 1,
      date: '',
      opening: '',
      hook: '',
      first_location: c.setting.starting_location || '',
      ending_goal: '',
      backup: '',
      npcs_present: [],
      played: false,
      notes: ''
    });
    save();
  }
  const s = c.sessions[0];
  return `
    <div class="progress-bar">
      <div class="done"></div><div class="done"></div><div class="done"></div><div class="current"></div>
    </div>
    <p class="onboarding-tip">${esc(rotatingTip())}</p>
    <div class="card">
      <span class="eyebrow">Almost done · Session one</span>
      <h2 style="margin-top: 8px; margin-bottom: 8px;">Plan just the first session</h2>
      <p style="margin-bottom: 20px;">The arc can wait. Focus on the one session you'll actually run.</p>

      <div class="stack">
        <div>
          <span class="field-label">Opening scene</span>
          <textarea placeholder="Where are the characters as the camera fades in? What's happening?" oninput="updateSession('${s.id}','opening',this.value)">${esc(s.opening)}</textarea>
        </div>
        <div>
          <span class="field-label">The hook — what disrupts normal and forces a choice?</span>
          <textarea placeholder="A stranger collapses at their feet. A fire starts. A bounty appears." oninput="updateSession('${s.id}','hook',this.value)">${esc(s.hook)}</textarea>
          ${state.stuck === 'hook' ? renderStuckHooks() : `<button class="dashed small" style="margin-top: 8px;" onclick="showStuck('hook')"><i class="ti ti-dice-5"></i> I'm stuck — give me hooks</button>`}
        </div>
        <div>
          <span class="field-label">How do you want it to end?</span>
          <div class="pills">
            ${['Cliffhanger','Clear next goal','New mystery','Hard-won rest'].map(o => `
              <button class="pill ${s.ending_goal===o?'selected':''}" onclick="updateSession('${s.id}','ending_goal','${escAttr(o)}'); render();">${esc(o)}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="actions spread" style="margin-top: 24px;">
        <button onclick="go('onboard-npcs')"><i class="ti ti-arrow-left"></i> Back</button>
        <div class="actions">
          <button class="ghost" onclick="finishOnboarding()">Skip</button>
          <button class="primary" onclick="finishOnboarding()">Finish setup <i class="ti ti-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function updateSession(id, key, value) {
  const c = activeCampaign();
  const s = c.sessions.find(x => x.id === id);
  if (s) { s[key] = value; save(); }
}

function renderStuckHooks() {
  const picks = state.stuckData || randomFrom(HOOK_POOL, 3);
  state.stuckData = picks;
  return `
    <div class="stuck-suggestions" style="margin-top: 10px;">
      <span class="eyebrow">Pick a hook to use as-is or as inspiration</span>
      ${picks.map((p, i) => `<div class="stuck-card" onclick="useHook(${i})">${esc(p)}</div>`).join('')}
      <div class="stuck-actions">
        <button class="small" onclick="rerollStuck('hook')"><i class="ti ti-refresh"></i> Different ones</button>
        <button class="small ghost" onclick="cancelStuck()">Cancel</button>
      </div>
    </div>
  `;
}

function useHook(i) {
  const c = activeCampaign();
  c.sessions[0].hook = state.stuckData[i];
  state.stuck = null;
  state.stuckData = null;
  save();
  render();
}

function finishOnboarding() {
  const c = activeCampaign();
  // Pull a name from the pitch if still default
  if (c.name === 'New campaign' && c.pitch) {
    const firstSentence = c.pitch.split(/[.!?]/)[0].trim();
    if (firstSentence.length < 50 && firstSentence.length > 4) c.name = firstSentence;
  }
  save();
  go('onboard-complete');
}

/* ============================================================
   Onboarding complete — proper celebration with summary
   ============================================================ */

function renderOnboardComplete() {
  const c = activeCampaign();
  const s1 = c.sessions[0];
  return `
    <div class="complete-screen">
      <div class="icon-wrap"><i class="ti ti-confetti complete-icon"></i></div>
      <h1>You have a campaign.</h1>
      <p class="subtitle">That's further than most aspiring DMs ever get. Here's what you built:</p>

      <div class="summary-card">
        <div class="label">Your campaign</div>
        <div class="campaign-name">${esc(c.name)}</div>
        ${c.pitch ? `<div class="campaign-pitch">"${esc(c.pitch.slice(0, 220))}${c.pitch.length > 220 ? '...' : ''}"</div>` : ''}
        <div class="summary-stats">
          <div class="summary-stat">
            <div class="num">${c.npcs.length}</div>
            <div class="lbl">NPC${c.npcs.length === 1 ? '' : 's'}</div>
          </div>
          <div class="summary-stat">
            <div class="num">${c.factions.length}</div>
            <div class="lbl">Faction${c.factions.length === 1 ? '' : 's'}</div>
          </div>
          <div class="summary-stat">
            <div class="num">${s1 && (s1.hook || s1.opening) ? '✓' : '○'}</div>
            <div class="lbl">Session 1</div>
          </div>
          <div class="summary-stat">
            <div class="num">${c.threads.length}</div>
            <div class="lbl">Thread${c.threads.length === 1 ? '' : 's'}</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <button class="primary" style="padding: 12px 24px;" onclick="go('dashboard')">Open dashboard <i class="ti ti-arrow-right"></i></button>
      </div>
    </div>
  `;
}

