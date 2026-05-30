# Loremaster — Backend Setup Guide

Follow these steps in order. Takes about 15 minutes.

---

## Step 1: Create a Supabase project

1. Go to **supabase.com** and sign up (free)
2. Click **New project**
3. Name it `loremaster`, pick a region close to you, set a database password
4. Wait ~2 minutes for it to finish setting up

---

## Step 2: Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/schema.sql` from this project folder
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned." — that's correct.

---

## Step 3: Disable email confirmation (recommended for development)

By default Supabase requires users to confirm their email before signing in.
To skip this during development:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **Confirm email** OFF
3. Click **Save**

You can turn it back on when you're ready to go live.

---

## Step 4: Get your API keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the **Project URL** — looks like `https://xyzxyz.supabase.co`
3. Copy the **anon/public** key — a long string starting with `eyJ...`

---

## Step 5: Add your keys to the app

Open `js/config.js` in VS Code. Replace the placeholder values:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co'  // ← paste URL here
const SUPABASE_ANON_KEY = 'eyJ...'                           // ← paste key here
```

Save the file.

---

## Step 6: Test it

1. Open the project with Live Server in VS Code
2. You should see the Loremaster sign in / create account screen
3. Create a test account and build a campaign
4. Open a different browser or incognito window, sign in with the same account
5. Your campaign should appear — that means the backend is working

---

## How data sync works

- When you make any change, it saves to **localStorage instantly** (no delay)
- 1.5 seconds after the last change, it **syncs to Supabase in the background**
- When you log in, the app loads your **local data first** (fast), then **refreshes from Supabase** (authoritative)
- If you're offline, the app still works — changes will sync next time you connect

---

## Going live (when you're ready)

When you want real users on a real URL:

1. **Netlify** (easiest): drag and drop your project folder at netlify.com/drop
2. **Vercel**: connect your GitHub repo at vercel.com
3. **GitHub Pages**: push to a repo, enable Pages in settings

All three are free for this scale. Netlify drop is the fastest way to get a shareable URL right now.

For production, re-enable **Confirm email** in Supabase Auth settings so users verify their emails.

---

## Supabase free tier limits

- 500MB database storage
- 50,000 monthly active users
- 2GB bandwidth/month

More than enough for an indie TTRPG tool with real users.
