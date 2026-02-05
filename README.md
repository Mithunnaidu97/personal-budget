# Personal Budget (Advanced) — GitHub Pages

This is a static website (HTML/CSS/JS) that works like an Excel personal budget template:
- Dashboard view (month selector, category totals, charts)
- Daily expense entry page (add/edit/delete)
- Income saved per month
- Auto calculations
- Currency: INR (₹)
- Works on GitHub Pages (no backend)

## Pages
- `index.html` — Dashboard
- `add-expense.html` — Daily expense entry

## Data storage
Data is saved in your browser using `localStorage`:
- Expenses key: `pb_entries_v1`
- Income key: `pb_income_v1`

If you want syncing across devices (husband/wife), we can add Firebase later.

## Run locally
Just open `index.html` in a browser.
(Or use VS Code Live Server.)

## Host on GitHub Pages
1) Create a repo, e.g. `personal-budget`
2) Upload all files/folders
3) GitHub → Settings → Pages
4) Source: `main` branch, folder `/ (root)`
5) Save → your site will be live at:
   `https://<username>.github.io/personal-budget/`

## Replace the 3 dashboard photos
Replace these files with your own screenshots:
- `assets/dashboard-1.png`
- `assets/dashboard-2.png`
- `assets/dashboard-3.png`