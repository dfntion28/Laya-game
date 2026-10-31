# LAYA — Takasan ang Rat Race

Pinoy financial-freedom board game inspired by *Rich Dad Poor Dad*. Play solo, against bots, pass-and-play on one phone, or online with each player on their own phone.

## Play
```bash
npm install
npm run dev        # http://localhost:5173 (use --host to open on your phone over Wi-Fi)
npm run build      # static build in dist/
```
On a phone: open the site → browser menu → **Add to Home Screen** for full-screen play. Games autosave.

## Online play
One player creates a room and shares the link (or the 5-letter code). Up to 4 players, each on their own phone. The host's phone runs the game; the others send their moves to it. If the host leaves, the game pauses until they come back (opening the same link rejoins).

Online play needs a free [Supabase](https://supabase.com) project to pass messages between phones. One-time setup:
1. Create a free Supabase project.
2. In the project, open **Project Settings → API** and copy the **Project URL** and the **anon public** key (newer projects call it the *publishable* key). This key is meant to be public.
3. Open **Realtime → Settings** and make sure **Allow public access** is on.
4. In Vercel: **Project → Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production and Preview, then redeploy.

Notes: free projects pause after 7 days without use; resume them from the Supabase dashboard. Anyone with a room code can join that room, so share it only with your players.

Testing without Supabase: add `?net=local` to the URL and open two tabs of the same browser. The tabs act as two phones.

## Balance check
```bash
node scripts/simulate.mjs 100 1   # 100 bot games per profession, 1 player
node scripts/simulate.mjs 20 3    # 3-player games (also counts deal sales, loans and fixers)
node scripts/simulate.mjs versus 270  # Easy vs Normal vs Hard bots
```

## Deploy
Vercel builds the site from this repo. A GitHub Pages workflow also exists: `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`
(enable it once: repo **Settings → Pages → Source: GitHub Actions**).

See `GAMEPLAN.md` for the design.
