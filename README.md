# MHW: Iceborne — Best Builds

A static, client-side build optimizer for Monster Hunter World: Iceborne. Pick a weapon (or a goal
like "Max Element") and get optimized builds with real in-game-style icons. No backend — the whole
optimizer runs in the browser.

## Live hosting on GitHub Pages

The site is fully static. For best performance it loads a pre-baked `data.json` (one CDN-cached
request instead of ~6 live API calls). If `data.json` is missing, the app automatically falls back to
fetching the source data live, so it works either way.

### One-time setup
1. Create a new GitHub repository and push these files to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. Push (or run the workflow manually under the **Actions** tab). The included workflow
   (`.github/workflows/deploy.yml`) bakes `data.json` and deploys the site.
   Your site goes live at `https://<user>.github.io/<repo>/`.

The workflow also re-bakes the data every Monday (cron) so armor/decoration data stays current.

### Update the baked data locally (optional)
```bash
node build/fetch-data.mjs   # Node 18+; writes data.json
```

## Files
| File | Purpose |
| --- | --- |
| `index.html` | The app (UI + damage model + optimizer, all inline). |
| `mhw-kulve-safi-supplement.js` | Kulve Taroth (Kjárr) + Safi'jiiva weapons (not in the base dataset). |
| `mhw-deco-colors.js` | Decoration → in-game gem colour index (from Kiranico), for real deco icons. |
| `build/fetch-data.mjs` | Fetches + merges all source data into `data.json`. |
| `.github/workflows/deploy.yml` | Bakes data and deploys to GitHub Pages. |
| `data.json` | Generated (git-ignored); produced by the build step. |

## Data sources, credits & licences
Fan-made and non-commercial — **not affiliated with or endorsed by Capcom**. *MONSTER HUNTER: WORLD*
data and imagery are © CAPCOM. Full attributions and licence texts are in **[CREDITS.md](CREDITS.md)**.

| Data | Source | Licence |
| --- | --- | --- |
| Weapons (base tree) | [MHWorldData](https://github.com/gatheringhallstudios/MHWorldData) — © Carlos Fernandez | MIT |
| Kjárr / Safi weapons | bundled `mhw-kulve-safi-supplement.js` | project file |
| Armor / decorations / charms / skills / set bonuses | [mhw-db.com](https://mhw-db.com) — © LartTyler | AGPL-3.0 (API software) |
| Icons | [MHW_Icons_SVG](https://github.com/OthelloRhin/MHW_Icons_SVG) — © Thibault "Othello" Benoit | MIT |
| Decoration gem colours | [Kiranico](https://mhworld.kiranico.com) | game-ripped assets, no open licence |

The damage model (EFR/EFE) is an approximation. To use only openly-licensed assets, disable the
Kiranico image source in `index.html` so the MIT `MHW_Icons_SVG` icons are used exclusively.
