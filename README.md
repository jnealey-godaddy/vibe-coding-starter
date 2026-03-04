# Site Dashboard -- Vibe Coding Starter

A hands-on starter project for the **PM Vibe Coding Workshop**. Participants use AI coding tools (like Cursor) to explore, modify, and extend a product metrics dashboard -- no prior coding experience required.

## Getting Started

1. Install [Cursor](https://cursor.com) (or any editor with AI chat)
2. Install [Node.js](https://nodejs.org) (v18+)
3. Clone the repo and install dependencies:
   ```
   git clone <repo-url> vibe-coding-starter
   cd vibe-coding-starter
   npm install
   ```
4. Start the dev server:
   ```
   npm start
   ```
5. Open the URL shown in your terminal (usually http://localhost:5173)

The dev server auto-reloads when you save changes.

## What You'll See

A dashboard with:
- **Summary cards** -- total sites, active sites, monthly revenue, average CSAT
- **Filters** -- search by name/owner/domain, filter by product type or status
- **Data table** -- 15 mock customer sites with name, owner, product, status, CSAT, revenue, and creation date
- **Exercise panel** -- click the "Exercises" button in the header to open the built-in guided exercises

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Dashboard page layout |
| `main.ts` | Dashboard logic (filtering, stats, table rendering) |
| `style.css` | All styling |
| `data/sites.json` | Mock data -- 15 customer sites with fields like name, owner, product, plan, status, CSAT, revenue, plugins, pageViews, and region |
| `exercises.ts` | Exercise panel UI (renders levels, tracks progress) |
| `exercise-data.ts` | All exercise content organized into levels |
| `package.json` | Dependencies (Vite, TypeScript) |
| `tsconfig.json` | TypeScript configuration |

## Built-in Exercises

The project includes **11 levels** of guided exercises accessible from the exercise panel. Each exercise includes a goal, a suggested AI prompt, the expected outcome, and optional pro tips.

| Level | Title | What You'll Practice |
|-------|-------|---------------------|
| 0 | Get Set Up | Install tools, clone the repo, start the server |
| 1 | Explore and Orient | Ask AI questions about the codebase |
| 2 | First Changes | Edit text, colors, and data |
| 3 | Read and Understand Data | Use AI to answer PM-relevant questions from the mock data |
| 4 | Add Features | Add columns, row highlighting, and summary cards |
| 5 | Bug Hunt | Find and fix an intentional bug in the code |
| 6 | Data Analysis | Add sorting, groupings, and performance badges |
| 7 | Visualization | Build bar charts and pie charts with pure CSS |
| 8 | Build a New View | Create detail panels, comparison mode, or exec summaries |
| 9 | Prototype Your Own Idea | Apply vibe coding to a real PM workflow problem |
| 10 | Ship It | Learn git basics -- branches, commits, PRs, and security review |

## Tech Stack

- **TypeScript** for type-safe dashboard logic
- **Vite** for dev server and builds
- No frameworks -- vanilla HTML/CSS/TS to keep things simple

## For Facilitators

The project includes intentional teaching moments:
- An **off-by-one bug** in the revenue calculation (`main.ts`, `calculateStats`) for the Bug Hunt exercises
- A **hardcoded API key** (`main.ts`, line 25) for the security awareness exercise
- Data fields like `pageViews` and `region` that exist in `sites.json` but aren't displayed in the table, giving participants something to add

Design docs are in `docs/plans/` and `docs/reviews/`.
