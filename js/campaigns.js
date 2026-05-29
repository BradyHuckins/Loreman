/* ============================================================
   Campaigns page
   ============================================================ */

// 8 book color schemes that cycle through — chosen to feel like aged leather/cloth bindings
const BOOK_COLORS = [
  { spine: '#6B2C2C', cover: '#8B3A3A', ink: '#F5E8D8' },  // deep crimson
  { spine: '#1F3B4D', cover: '#2D5170', ink: '#E8E0D0' },  // ocean navy
  { spine: '#3C4A2E', cover: '#556B3A', ink: '#F0E8D4' },  // forest green
  { spine: '#4A2C5E', cover: '#6B4280', ink: '#EFE4F2' },  // plum
  { spine: '#5C3A1E', cover: '#7C5530', ink: '#F2E5CB' },  // weathered tan
  { spine: '#2C4A47', cover: '#3F6864', ink: '#E8EFE4' },  // teal
  { spine: '#6B3B1A', cover: '#8E5128', ink: '#F4E5CC' },  // burnt orange
  { spine: '#2E2E3A', cover: '#454556', ink: '#E5E0D8' }   // slate
];

function bookColorFor(c) {
  // Deterministic by campaign id so each book keeps its color forever
  let hash = 0;
  for (let i = 0; i < c.id.length; i++) hash = (hash * 31 + c.id.charCodeAt(i)) | 0;
  return BOOK_COLORS[Math.abs(hash) % BOOK_COLORS.length];
}

function renderCampaigns() {
  const sorted = [...state.campaigns].sort((a,b) => (b.lastOpened||0) - (a.lastOpened||0));
  return `
    <div class="section-header">
      <h2>The shelf</h2>
      <button class="primary" onclick="startNewCampaign()"><i class="ti ti-plus"></i> New campaign</button>
    </div>
    <p style="color: var(--ink-muted); margin-bottom: 8px; font-family: var(--serif); font-style: italic;">Each campaign is a book. Pull one off the shelf to switch parties, start a new one when the muse strikes.</p>

    <div class="bookshelf-wrap">
      <div class="shelf">
        ${sorted.map(c => renderBook(c)).join('')}
        <div class="book-empty" onclick="startNewCampaign()">
          <i class="ti ti-plus"></i>
          <div>Add a campaign</div>
        </div>
      </div>
    </div>
  `;
}

function renderBook(c) {
  const colors = bookColorFor(c);
  const isActive = c.id === state.activeId;
  return `
    <div class="book ${isActive ? 'active' : ''}"
         style="--spine: ${colors.spine}; --cover: ${colors.cover}; --book-ink: ${colors.ink};"
         onclick="switchCampaign('${c.id}')"
         title="${esc(c.name)}">
      ${isActive ? '<span class="book-active-mark">Active</span>' : ''}
      <div class="book-spine"></div>
      <div class="book-cover">
        <div class="book-eyebrow">${esc(c.system || 'Campaign')}</div>
        <div class="book-title">${esc(c.name)}</div>
        <div class="book-pitch">${esc(c.pitch) || 'No pitch yet.'}</div>
        <div class="book-stats">
          <div class="book-stat">
            <span class="num">${c.sessions.length}</span>
            <span class="lbl">SESS</span>
          </div>
          <div class="book-stat">
            <span class="num">${c.npcs.length}</span>
            <span class="lbl">NPCS</span>
          </div>
          <div class="book-stat">
            <span class="num">${c.threads.length}</span>
            <span class="lbl">THRD</span>
          </div>
        </div>
      </div>
      <div class="book-actions">
        ${!isActive ? `<button class="small" onclick="event.stopPropagation(); switchCampaign('${c.id}')">Open</button>` : ''}
        <button class="small danger" onclick="event.stopPropagation(); deleteCampaign('${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>
  `;
}

function deleteCampaign(id) {
  const camp = state.campaigns.find(c => c.id === id);
  if (!camp) return;
  if (!confirm(`Delete "${camp.name}"? This can't be undone.`)) return;
  state.campaigns = state.campaigns.filter(c => c.id !== id);
  if (state.activeId === id) {
    state.activeId = state.campaigns[0]?.id || null;
  }
  save();
  if (state.campaigns.length === 0) go('campaigns-empty');
  else render();
}

