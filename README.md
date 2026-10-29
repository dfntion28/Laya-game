# LAYA — Takasan ang Rat Race

Pinoy financial-freedom board game inspired by *Rich Dad Poor Dad*. Play solo, against bots, or pass-and-play on one phone.

## Play
```bash
npm install
npm run dev        # http://localhost:5173 (use --host to open on your phone over Wi-Fi)
npm run build      # static build in dist/
```
On a phone: open the site → browser menu → **Add to Home Screen** for full-screen play. Games autosave.

## Balance check
```bash
node scripts/simulate.mjs 100 1   # 100 bot games per profession, 1 player
node scripts/simulate.mjs 20 3    # 3-player games
```

## Deploy
`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`
(enable it once: repo **Settings → Pages → Source: GitHub Actions**).

See `GAMEPLAN.md` for the design.
