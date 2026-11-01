# Sleeper Fantasy Football Analytics & AI Newsletter Dashboard

A full-featured, bilingual (EN / UK) fantasy football analytics dashboard and AI-powered weekly newsletter studio built for **Sleeper** leagues using Next.js, Tailwind CSS, and Cloudflare Pages / Edge Runtime.

## Features

- **Broadcast Command Center**: Live #1 seed spotlight, league pulse metrics, Official Power Rankings, 5-axis Manager Scout Dossier radar, and 11+ dynamic weekly performance badges.
- **True Standings (All-Play)**: Eliminate schedule luck by comparing every manager against the entire league each week.
- **The Multiverse**: Schedule swap simulator to see what your record would be with any other manager's schedule.
- **All-Time Rivalries & Franchise History**: Multi-season head-to-head records, Kryptonite sweeps, single-week record vaults, and past champions/toilet bowls.
- **The Hindsight Draft Report**: VOE (Value Over Expectation) draft grades, steals, busts, positional reaches, waiver heroes, and a hindsight Redraft Board.
- **AI Weekly Newsletter Studio**: Automatically generate, preview, export (PDF/JPG), and publish weekly league recaps powered by Google Gemini, OpenAI, Anthropic Claude, or OpenRouter.
- **In-App Site Admin Panel (`/admin`)**: Update the Sleeper League ID, switch LLM providers/models/keys, customize the AI beat-writer persona & newspaper masthead, or toggle the newsletter feature on/off without touching code.

---

## Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd sleepingtigers
   npm install
   ```

2. **Configure Environment (Optional)**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   You can set `NEXT_PUBLIC_SLEEPER_LEAGUE_ID`, `ADMIN_PASSWORD`, and your preferred LLM API key in `.env` — **or** configure everything directly in the browser via the Admin Panel at `/en/admin`.

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard, or click the **Gear icon** in the top navigation bar (`/en/admin`) to configure your Sleeper League ID and AI settings.

---

## Site Admin & Persistence

- **Admin Panel (`/en/admin` or `/uk/admin`)**:
  - Protected by `ADMIN_PASSWORD` (from `.env`) or an initial password set on your first visit to `/admin`.
  - **League Settings**: Verify any Sleeper League ID against the live Sleeper API and optionally set a custom site title.
  - **LLM API Settings**: Choose between **Google Gemini**, **OpenAI**, **Anthropic Claude**, or **OpenRouter / Custom OpenAI-compatible** endpoints, pick a model ID, and store your API key server-side.
  - **Newsletter Studio Settings**: Enable/disable the public newsletter tab, customize the newspaper masthead/subtitle, customize the AI writer persona prompt, and manage published editions.
- **Storage**:
  - When deployed to **Cloudflare Pages** with the `NEWSLETTERS` KV namespace bound (`wrangler.toml`), all admin settings and published newsletters persist globally in Cloudflare KV.
  - In local development (`next dev`) or non-KV environments, settings persist in server runtime memory with automatic fallback to `.env`.
