/* ============================================================
   Auth — sign in, sign up, sign out, session check
   ============================================================ */

let authMode    = 'signin'; // 'signin' | 'signup'
let authError   = '';
let authLoading = false;
let authConfirmSent = false;

/* ------ Render auth screen ------ */

function renderAuth() {
  if (authConfirmSent) return renderAuthConfirm();

  return `
    <div class="auth-wrap">
      <div class="auth-header">
        <i class="ti ti-feather auth-feather"></i>
        <h1 class="auth-title">Loremaster</h1>
        <p class="auth-tagline">Run your first D&amp;D campaign without the overwhelm.</p>
      </div>

      <div class="auth-card">
        <div class="auth-tabs">
          <button class="auth-tab ${authMode === 'signin' ? 'active' : ''}"
                  onclick="setAuthMode('signin')">Sign in</button>
          <button class="auth-tab ${authMode === 'signup' ? 'active' : ''}"
                  onclick="setAuthMode('signup')">Create account</button>
        </div>

        ${authError ? `
          <div class="auth-error">
            <i class="ti ti-alert-circle"></i> ${esc(authError)}
          </div>
        ` : ''}

        <div class="stack" style="margin-top: 20px;">
          <div>
            <span class="field-label">Email</span>
            <input type="text" id="auth-email" placeholder="you@example.com"
                   autocomplete="email"
                   onkeydown="if(event.key==='Enter') submitAuth()">
          </div>
          <div>
            <span class="field-label">Password</span>
            <input type="password" id="auth-password" placeholder="••••••••"
                   autocomplete="${authMode === 'signin' ? 'current-password' : 'new-password'}"
                   onkeydown="if(event.key==='Enter') submitAuth()">
          </div>
          ${authMode === 'signup' ? `
            <div>
              <span class="field-label">Confirm password</span>
              <input type="password" id="auth-confirm" placeholder="••••••••"
                     autocomplete="new-password"
                     onkeydown="if(event.key==='Enter') submitAuth()">
            </div>
          ` : ''}
        </div>

        <button class="primary auth-submit" onclick="submitAuth()" ${authLoading ? 'disabled' : ''}>
          ${authLoading
            ? '<i class="ti ti-loader-2 spin"></i> One moment...'
            : authMode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <p class="auth-switch">
          ${authMode === 'signin'
            ? `No account? <span class="auth-switch-link" onclick="setAuthMode('signup')">Create one free</span>`
            : `Already have an account? <span class="auth-switch-link" onclick="setAuthMode('signin')">Sign in</span>`}
        </p>
      </div>

      <p class="auth-footer-note">
        Your campaigns are saved securely to the cloud.<br>
        Access them from any device.
      </p>
    </div>
  `;
}

function renderAuthConfirm() {
  return `
    <div class="auth-wrap">
      <div class="auth-header">
        <i class="ti ti-feather auth-feather"></i>
        <h1 class="auth-title">Loremaster</h1>
      </div>
      <div class="auth-card" style="text-align: center; padding: 40px 32px;">
        <i class="ti ti-mail" style="font-size: 48px; color: var(--accent); display: block; margin-bottom: 16px;"></i>
        <h3 style="margin-bottom: 12px;">Check your email</h3>
        <p style="color: var(--ink-muted); line-height: 1.6; margin-bottom: 24px;">
          We sent a confirmation link to your email.<br>
          Click it to activate your account, then come back and sign in.
        </p>
        <button onclick="backToSignIn()">Back to sign in</button>
      </div>
    </div>
  `;
}

/* ------ Auth mode toggle ------ */

function setAuthMode(mode) {
  authMode = mode;
  authError = '';
  authConfirmSent = false;
  render();
  setTimeout(() => {
    const el = document.getElementById('auth-email');
    if (el) el.focus();
  }, 50);
}

function backToSignIn() {
  authMode = 'signin';
  authError = '';
  authConfirmSent = false;
  render();
}

/* ------ Submit (sign in or sign up) ------ */

async function submitAuth() {
  const email    = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  const confirm  = document.getElementById('auth-confirm')?.value;

  // Validate
  if (!email || !password) {
    authError = 'Please enter your email and password.';
    render();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    authError = 'Please enter a valid email address.';
    render();
    return;
  }
  if (authMode === 'signup') {
    if (password.length < 6) {
      authError = 'Password must be at least 6 characters.';
      render();
      return;
    }
    if (password !== confirm) {
      authError = "Passwords don't match.";
      render();
      return;
    }
  }

  authLoading = true;
  authError = '';
  render();

  try {
    if (authMode === 'signin') {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await onSignedIn(data.session);

    } else {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        // Email confirmation disabled in Supabase — signed in immediately
        await onSignedIn(data.session);
      } else {
        // Email confirmation required — show confirmation screen
        authLoading = false;
        authConfirmSent = true;
        render();
      }
    }
  } catch (err) {
    authLoading = false;
    authError = friendlyAuthError(err.message);
    render();
  }
}

/* ------ Called after a successful sign in ------ */

async function onSignedIn(session) {
  state.userId    = session.user.id;
  state.userEmail = session.user.email;
  authLoading     = false;
  authError       = '';

  // Show local data instantly
  loadFromLocalStorage();
  state.booting = false;
  render();

  // Then pull fresh data from Supabase
  await loadFromSupabase();
  render();
}

/* ------ Sign out ------ */

async function signOut() {
  if (state.showUserMenu) {
    state.showUserMenu = false;
  }
  await sb.auth.signOut();
  state.userId    = null;
  state.userEmail = null;
  state.campaigns = [];
  state.activeId  = null;
  state.view      = 'campaigns-empty';
  state.showSwitcher = false;
  authMode    = 'signin';
  authError   = '';
  authConfirmSent = false;
  render();
}

/* ------ Friendly error messages ------ */

function friendlyAuthError(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password')) {
    return 'Incorrect email or password.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for the confirmation link.';
  }
  if (m.includes('already registered') || m.includes('user already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('password') && m.includes('character')) {
    return 'Password must be at least 6 characters.';
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
    return 'Network error — check your connection and try again.';
  }
  if (m.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return 'Something went wrong. Please try again.';
}

/* ------ Auth state change listener ------ */
// Handles session expiry, sign out from another tab, etc.

sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' && state.userId) {
    state.userId    = null;
    state.userEmail = null;
    state.campaigns = [];
    state.activeId  = null;
    state.view      = 'campaigns-empty';
    render();
  }
  if (event === 'TOKEN_REFRESHED' && session) {
    state.userId    = session.user.id;
    state.userEmail = session.user.email;
  }
});

/* ------ Boot: check session, load data, render ------ */

async function boot() {
  state.booting = true;
  render(); // Show loading spinner

  try {
    const { data: { session } } = await sb.auth.getSession();

    if (session) {
      state.userId    = session.user.id;
      state.userEmail = session.user.email;

      // Instant render from localStorage
      loadFromLocalStorage();
      state.booting = false;
      render();

      // Then sync fresh data from Supabase
      await loadFromSupabase();
      render();

    } else {
      state.booting = false;
      render(); // Show auth screen
    }

  } catch (err) {
    console.error('Boot error:', err);
    state.booting = false;
    // Fall back to local data
    loadFromLocalStorage();
    render();
  }
}
