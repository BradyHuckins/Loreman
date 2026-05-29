/* ============================================================
   Render router
   ============================================================ */

const appEl = () => document.getElementById('app');
const modalEl = () => document.getElementById('modal-mount');

function render() {
  const c = activeCampaign();
  const onboardingViews = ['onboard-pitch', 'onboard-setting', 'onboard-npcs', 'onboard-session1', 'onboard-complete'];
  const isOnboarding = onboardingViews.includes(state.view);
  const isRunMode = state.view === 'run-mode';
  const isEmpty = state.view === 'campaigns-empty';
  const showTopbar = !isOnboarding && !isRunMode && !isEmpty && c;

  let html = '';
  if (showTopbar) html += renderTopbar();
  html += '<div class="view-enter">';
  switch (state.view) {
    case 'campaigns-empty': html += renderEmpty(); break;
    case 'onboard-pitch': html += renderOnboardPitch(); break;
    case 'onboard-setting': html += renderOnboardSetting(); break;
    case 'onboard-npcs': html += renderOnboardNPCs(); break;
    case 'onboard-session1': html += renderOnboardSession1(); break;
    case 'onboard-complete': html += renderOnboardComplete(); break;
    case 'campaigns': html += renderCampaigns(); break;
    case 'dashboard': html += renderDashboard(); break;
    case 'all-npcs': html += renderAllNPCs(); break;
    case 'npc-edit': html += renderNPCEdit(); break;
    case 'all-sessions': html += renderAllSessions(); break;
    case 'session-edit': html += renderSessionEdit(); break;
    case 'threads': html += renderThreads(); break;
    case 'tips': html += renderTips(); break;
    case 'settings': html += renderSettings(); break;
    case 'run-mode': html += renderRunMode(); break;
    default: html += renderDashboard();
  }
  html += '</div>';
  appEl().innerHTML = html;

  // Modal
  if (state.modal) {
    modalEl().innerHTML = state.modal;
  } else {
    modalEl().innerHTML = '';
  }
}

function renderTopbar() {
  const c = activeCampaign();
  const v = state.view;
  const colors = bookColorFor(c);
  return `
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <button class="logo" onclick="go('dashboard')"><i class="ti ti-feather"></i> Loremaster</button>
        <div style="position: relative;">
          <button class="campaign-switcher" onclick="toggleSwitcher(event)" style="border-left: 4px solid ${colors.spine}; padding-left: 12px;">
            <div style="display: flex; flex-direction: column; align-items: start; gap: 0;">
              <span class="label">Campaign</span>
              <span class="name">${esc(c.name)}</span>
            </div>
            <i class="ti ti-chevron-down"></i>
          </button>
          ${state.showSwitcher ? renderSwitcherDropdown() : ''}
        </div>
      </div>
      <div class="nav-buttons">
        <button class="ghost ${v==='dashboard'?'active':''}" onclick="go('dashboard')" title="Home"><i class="ti ti-home"></i><span>Home</span></button>
        <button class="ghost ${v==='all-npcs'||v==='npc-edit'?'active':''}" onclick="go('all-npcs')" title="NPCs"><i class="ti ti-users"></i><span>NPCs</span></button>
        <button class="ghost ${v==='all-sessions'||v==='session-edit'?'active':''}" onclick="go('all-sessions')" title="Sessions"><i class="ti ti-notebook"></i><span>Sessions</span></button>
        <button class="ghost ${v==='threads'?'active':''}" onclick="go('threads')" title="Threads"><i class="ti ti-link"></i><span>Threads</span></button>
        <button class="ghost ${v==='tips'?'active':''}" onclick="go('tips')" title="DM tips"><i class="ti ti-bulb"></i></button>
        <button class="ghost ${v==='settings'?'active':''}" onclick="go('settings')" title="Settings"><i class="ti ti-settings"></i></button>
      </div>
    </div>
  `;
}

function toggleSwitcher(e) {
  e.stopPropagation();
  state.showSwitcher = !state.showSwitcher;
  render();
}

function renderSwitcherDropdown() {
  const c = activeCampaign();
  const sorted = [...state.campaigns].sort((a,b) => (b.lastOpened||0) - (a.lastOpened||0));
  return `
    <div class="dropdown" onclick="event.stopPropagation()">
      ${sorted.map(camp => {
        const cc = bookColorFor(camp);
        return `
        <div class="dropdown-item ${camp.id === c.id ? 'active' : ''}" onclick="switchCampaign('${camp.id}')" style="border-left: 4px solid ${cc.spine};">
          <div>
            <div class="name">${esc(camp.name)}</div>
            <div class="meta">${camp.sessions.length} session${camp.sessions.length === 1 ? '' : 's'} · ${fmtRelative(camp.lastOpened)}</div>
          </div>
          ${camp.id === c.id ? '<i class="ti ti-check" style="color: var(--accent);"></i>' : ''}
        </div>
      `;}).join('')}
      <div class="dropdown-item action" onclick="go('campaigns')">
        <span><i class="ti ti-list" style="vertical-align: -2px;"></i> Manage campaigns</span>
      </div>
      <div class="dropdown-item action" onclick="startNewCampaign()">
        <span><i class="ti ti-plus" style="vertical-align: -2px;"></i> New campaign</span>
      </div>
    </div>
  `;
}

function switchCampaign(id) {
  const camp = state.campaigns.find(c => c.id === id);
  if (camp) {
    state.activeId = id;
    camp.lastOpened = Date.now();
    state.showSwitcher = false;
    go('dashboard');
  }
}

// Close dropdown on outside click
document.addEventListener('click', () => {
  if (state.showSwitcher) {
    state.showSwitcher = false;
    render();
  }
});

