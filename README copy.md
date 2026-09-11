# Transit Access Map — Setup Guide

## What's here
- `index.html` / `css/style.css` / `js/app.js` — the map app
- `data/*.min.geojson` — your five datasets, trimmed for the web (see below)

Your Mapbox token is already set in `js/app.js`. **One thing to know:** it's a
public token pasted directly into client-side JS, which is normal for Mapbox
(that's what the "public" token is for) — but it's visible to anyone who views
source on the hosted page. If you'd rather not have it exposed, you can add a
URL restriction on the token in your Mapbox account (Tokens → edit → restrict
to your GitHub Pages / Netlify domain) so it only works on your site.

## About the data
Each original file (~19–27MB) had a lot of columns not needed for rendering
(per-5-minute job/area breakdowns, source-file metadata, lat/long duplicated
in the geometry, etc.). I stripped each down to just `blockid20`, `category`,
and one headline `metric_value` for the popup — that cut total size from
~110MB to ~63MB. The map only fetches the file for whichever metric is
selected (not all five at once), so a page load is ~12MB rather than 63MB.

If you want it faster still — especially on mobile or a slow connection —
the next step up is converting these to vector tiles (e.g. with `tippecanoe`
or by uploading to Mapbox Studio as a tileset) rather than raw GeoJSON. That's
a bigger lift; happy to help with it if load time becomes an issue.

## Swap in updated data
If you regenerate these files, keep the same three properties per feature —
`blockid20`, `category` (must match one of the 20 percentile-bin strings in
`CATEGORY_ORDER` in `app.js`), and `metric_value`. Drop the new file in
`data/` under the same name, or update the path in the `LAYERS` object at the
top of `app.js`.

## Host it (GitHub Pages)
1. Create a new repo on github.com (e.g. `transit-access-map`).
2. Upload this whole folder's contents to the repo root.

   **Note:** GitHub's web upload UI caps out around 25MB per file — all five
   `.min.geojson` files here are under that, so drag-and-drop upload should
   work. If GitHub ever rejects one, push via `git` instead (no size limit
   until ~100MB, and GitHub Pages itself has no strict per-file cap).
3. **Settings → Pages → Source → Deploy from a branch → main / (root)**. Save.
4. Your live URL: `https://yourusername.github.io/transit-access-map/`

## Embed it in an ArcGIS StoryMap
1. Open your story, add an **Embed** block (`</>` icon in the block picker).
2. Paste your GitHub Pages URL in.
3. Resize the embed block to taste — it renders as an iframe.
