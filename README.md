## Headline

Minimal, modern news headline reader.

- **Frontend**: React + Vite + Tailwind (port `3000`)
- **Backend**: Express RSS polling server (port `3001`)
- **Data**: Polls a curated set of RSS feeds every minute, caches results in memory, and serves them via a JSON API.

### Features

- **Clean black UI** with categories
- **Count filter** (how many headlines to show)
- **Sports subcategories** (Soccer / Basketball / Football) driven by source filters
- Click any headline card to **open the article immediately in a new tab**

### Run locally

**Prereqs**: Node.js 18+ recommended

Install deps:

```bash
npm install
```

Start the backend (RSS poller):

```bash
npm run server
```

In a second terminal, start the frontend:

```bash
npm run dev
```

Open:

- `http://localhost:3000` (web app)
- `http://localhost:3001/api/headlines?category=All&limit=10` (API)

### Deploy (GitHub Pages + hosted backend)

GitHub Pages can only host the static frontend. You must host the backend somewhere public (Render/Fly/Heroku/etc).

1. **Deploy backend** and get a public base URL, for example:
   - `https://your-backend.example.com`

2. In your GitHub repo, set Actions secret:
   - `VITE_API_BASE_URL` = your backend base URL

3. Push to `main`. The workflow in `.github/workflows/deploy-gh-pages.yml` will:
   - build the frontend
   - publish `dist/` to the `gh-pages` branch

### Environment variables

- **Frontend**: `VITE_API_BASE_URL` (optional for local, required for deployed frontend)
  - local default: `http://localhost:3001`

