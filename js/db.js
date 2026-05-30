/* ============================================================
   Database — Supabase read/write operations
   ============================================================
   Strategy:
   - save() in state.js writes to localStorage immediately (instant)
   - save() then debounces syncCampaignToSupabase() 1.5s later
   - syncCampaignToSupabase upserts the campaign row and
     delete+reinserts all its sub-records (npcs, sessions, threads)
   - dbDeleteCampaign handles explicit campaign deletions
   ============================================================ */

/* ------ Load all campaigns from Supabase ------ */

async function loadFromSupabase() {
  if (!state.userId) return;

  try {
    // Fetch all campaigns for this user
    const { data: campaigns, error: campErr } = await sb
      .from('campaigns')
      .select('*')
      .eq('user_id', state.userId)
      .order('last_opened', { ascending: false });

    if (campErr) throw campErr;
    if (!campaigns || campaigns.length === 0) {
      state.campaigns = [];
      state.activeId = null;
      state.view = 'campaigns-empty';
      saveToLocalStorage();
      return;
    }

    // Fetch all sub-records for every campaign in one round trip each
    const ids = campaigns.map(c => c.id);

    const [
      { data: npcs },
      { data: sessions },
      { data: threads }
    ] = await Promise.all([
      sb.from('npcs').select('*').in('campaign_id', ids),
      sb.from('sessions').select('*').in('campaign_id', ids).order('num', { ascending: true }),
      sb.from('threads').select('*').in('campaign_id', ids)
    ]);

    // Map DB row format → app format
    state.campaigns = campaigns.map(c => ({
      id:          c.id,
      name:        c.name        || 'New campaign',
      pitch:       c.pitch       || '',
      system:      c.system      || '',
      experience:  c.experience  || '',
      has_players: c.has_players || '',
      setting:     c.setting     || { type: '', name: '', starting_location: '' },
      factions:    c.factions    || [],
      tone:        c.tone        || [],
      created:     new Date(c.created_at).getTime(),
      lastOpened:  new Date(c.last_opened).getTime(),

      npcs: (npcs || [])
        .filter(n => n.campaign_id === c.id)
        .map(n => ({
          id:          n.id,
          name:        n.name        || '',
          role:        n.role        || 'Neutral',
          description: n.description || '',
          want:        n.want        || '',
          notes:       n.notes       || '',
          lastSeen:    n.last_seen   || null
        })),

      sessions: (sessions || [])
        .filter(s => s.campaign_id === c.id)
        .map(s => ({
          id:             s.id,
          num:            s.num,
          date:           s.date           || '',
          opening:        s.opening        || '',
          hook:           s.hook           || '',
          first_location: s.first_location || '',
          ending_goal:    s.ending_goal    || '',
          backup:         s.backup         || '',
          npcs_present:   s.npcs_present   || [],
          played:         s.played         || false,
          notes:          s.notes          || ''
        })),

      threads: (threads || [])
        .filter(t => t.campaign_id === c.id)
        .map(t => ({
          id:              t.id,
          text:            t.text             || '',
          lastTouched:     t.last_touched     || null,
          sourceType:      t.source_type      || 'manual',
          sourceId:        t.source_id        || null,
          sourceSessionId: t.source_session_id || null,
          linkedNpcIds:    t.linked_npc_ids   || [],
          created:         new Date(t.created_at).getTime()
        }))
    }));

    // Preserve active campaign selection
    if (!state.activeId || !state.campaigns.find(c => c.id === state.activeId)) {
      state.activeId = state.campaigns[0].id;
    }

    // Only reset view if we're on the empty screen
    if (state.view === 'campaigns-empty' && state.campaigns.length > 0) {
      state.view = 'dashboard';
    }

    saveToLocalStorage();

  } catch (err) {
    console.error('loadFromSupabase failed:', err);
    // Silently fall through — local state is still good
  }
}

/* ------ Sync the active campaign to Supabase ------ */

async function syncCampaignToSupabase(c) {
  if (!state.userId || !c) return;

  try {
    // 1. Upsert campaign row
    const { error: campErr } = await sb.from('campaigns').upsert({
      id:          c.id,
      user_id:     state.userId,
      name:        c.name        || 'New campaign',
      pitch:       c.pitch       || '',
      system:      c.system      || '',
      experience:  c.experience  || '',
      has_players: c.has_players || '',
      setting:     c.setting     || {},
      factions:    c.factions    || [],
      tone:        c.tone        || [],
      last_opened: new Date(c.lastOpened || Date.now()).toISOString()
    });
    if (campErr) throw campErr;

    // 2. NPCs — delete all for this campaign then re-insert current ones
    await sb.from('npcs').delete().eq('campaign_id', c.id);
    if (c.npcs && c.npcs.length > 0) {
      const { error: npcErr } = await sb.from('npcs').insert(
        c.npcs.map(n => ({
          id:          n.id,
          campaign_id: c.id,
          user_id:     state.userId,
          name:        n.name        || '',
          role:        n.role        || 'Neutral',
          description: n.description || '',
          want:        n.want        || '',
          notes:       n.notes       || '',
          last_seen:   n.lastSeen    || null
        }))
      );
      if (npcErr) throw npcErr;
    }

    // 3. Sessions
    await sb.from('sessions').delete().eq('campaign_id', c.id);
    if (c.sessions && c.sessions.length > 0) {
      const { error: sessErr } = await sb.from('sessions').insert(
        c.sessions.map(s => ({
          id:             s.id,
          campaign_id:    c.id,
          user_id:        state.userId,
          num:            s.num,
          date:           s.date           || '',
          opening:        s.opening        || '',
          hook:           s.hook           || '',
          first_location: s.first_location || '',
          ending_goal:    s.ending_goal    || '',
          backup:         s.backup         || '',
          npcs_present:   s.npcs_present   || [],
          played:         s.played         || false,
          notes:          s.notes          || ''
        }))
      );
      if (sessErr) throw sessErr;
    }

    // 4. Threads
    await sb.from('threads').delete().eq('campaign_id', c.id);
    if (c.threads && c.threads.length > 0) {
      const { error: threadErr } = await sb.from('threads').insert(
        c.threads.map(t => ({
          id:                  t.id,
          campaign_id:         c.id,
          user_id:             state.userId,
          text:                t.text             || '',
          last_touched:        t.lastTouched       || null,
          source_type:         t.sourceType        || 'manual',
          source_id:           t.sourceId          || null,
          source_session_id:   t.sourceSessionId   || null,
          linked_npc_ids:      t.linkedNpcIds      || []
        }))
      );
      if (threadErr) throw threadErr;
    }

  } catch (err) {
    console.error('syncCampaignToSupabase failed:', err);
  }
}

/* ------ Delete a campaign from Supabase ------ */
// Sub-records (npcs, sessions, threads) cascade-delete via FK constraint

async function dbDeleteCampaign(id) {
  if (!state.userId) return;
  try {
    const { error } = await sb
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', state.userId); // safety: only delete own campaigns
    if (error) throw error;
  } catch (err) {
    console.error('dbDeleteCampaign failed:', err);
  }
}

/* ------ Helper: write current state to localStorage ------ */

function saveToLocalStorage() {
  try {
    localStorage.setItem('loremaster_v2_state', JSON.stringify({
      campaigns: state.campaigns,
      activeId:  state.activeId,
      view:      state.view
    }));
  } catch (e) {
    console.error('localStorage write failed', e);
  }
}
