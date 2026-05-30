/* ============================================================
   State management
   ============================================================ */

let state = {
  view:          'campaigns-empty',
  campaigns:     [],
  activeId:      null,
  stuck:         null,
  stuckData:     null,
  editing:       null,
  showSwitcher:  false,
  showUserMenu:  false,
  showLogModal:  false,
  modal:         null,
  // Auth
  userId:        null,
  userEmail:     null,
  booting:       true
};

function defaultCampaign() {
  return {
    id:          uid(),
    name:        'New campaign',
    pitch:       '',
    system:      '',
    experience:  '',
    has_players: '',
    setting:     { type: '', name: '', starting_location: '' },
    factions:    [],
    tone:        [],
    npcs:        [],
    sessions:    [],
    threads:     [],
    created:     Date.now(),
    lastOpened:  Date.now()
  };
}

function activeCampaign() {
  return state.campaigns.find(c => c.id === state.activeId) || null;
}

/* ------ Save ------ */
// 1. Writes to localStorage immediately (synchronous, instant)
// 2. Debounces a Supabase sync 1.5s after the last change

let syncTimer  = null;
let savedTimer = null;

function save() {
  const c = activeCampaign();
  if (c) c.lastOpened = Date.now();

  // Always persist locally first
  saveToLocalStorage();
  flashSaved();

  // Debounce Supabase sync
  if (state.userId && c) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncCampaignToSupabase(c), 1500);
  }
}

function flashSaved() {
  const el = document.getElementById('saved-indicator');
  if (!el) return;
  el.classList.add('show');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => el.classList.remove('show'), 1200);
}

/* ------ Load from localStorage (synchronous, instant) ------ */

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem('loremaster_v2_state');
    if (raw) {
      const data = JSON.parse(raw);
      state.campaigns = data.campaigns || [];
      state.activeId  = data.activeId  || null;
      const savedView = data.view || 'campaigns-empty';

      if (state.campaigns.length === 0) {
        state.view     = 'campaigns-empty';
        state.activeId = null;
      } else if (!state.activeId || !activeCampaign()) {
        state.activeId = state.campaigns[0].id;
        state.view     = 'dashboard';
      } else {
        state.view = savedView;
      }
    } else {
      state.campaigns = [];
      state.activeId  = null;
      state.view      = 'campaigns-empty';
    }
  } catch (e) {
    state.campaigns = [];
    state.activeId  = null;
    state.view      = 'campaigns-empty';
  }
}

/* ------ Reset (dev tool) ------ */

function resetApp() {
  if (confirm("Reset everything? You'll lose all local data. This can't be undone.")) {
    localStorage.removeItem('loremaster_v2_state');
    state = {
      view:         'campaigns-empty',
      campaigns:    [],
      activeId:     null,
      stuck:        null,
      stuckData:    null,
      editing:      null,
      showSwitcher: false,
      showUserMenu: false,
      modal:        null,
      userId:       state.userId,    // keep auth
      userEmail:    state.userEmail,
      booting:      false
    };
    render();
  }
}

/* ------ Utilities ------ */

function uid() { return Math.random().toString(36).slice(2, 10); }

function go(view, params = {}) {
  state.view         = view;
  state.stuck        = null;
  state.stuckData    = null;
  state.showSwitcher = false;
  state.showUserMenu = false;
  state.modal        = null;
  Object.assign(state, params);
  save();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomFrom(arr, n = 1, exclude = []) {
  const pool = arr.filter(x => !exclude.includes(x.name || x));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function rotatingTip() { return TIPS[Math.floor(Math.random() * TIPS.length)]; }

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
function escAttr(s) { return esc(s); }

function roleClass(role) {
  if (!role) return 'role-neutral';
  return 'role-' + role.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtRelative(d) {
  if (!d) return '';
  const date   = new Date(d);
  const diff   = Date.now() - date.getTime();
  const days   = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0)  return 'today';
  if (days === 1)  return 'yesterday';
  if (days < 7)   return days + ' days ago';
  if (days < 30)  return Math.floor(days / 7) + ' weeks ago';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function hasAnyPlayedSession(c) {
  return c.sessions.some(s => s.played);
}
