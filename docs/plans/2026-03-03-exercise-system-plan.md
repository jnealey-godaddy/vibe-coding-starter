# Exercise System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 10-level, 43-exercise interactive sidebar into the Site Dashboard app that teaches PMs to vibe code through progressive challenges.

**Architecture:** TypeScript with two-module split: `exercise-data.ts` (pure typed content, easy to edit) and `exercises.ts` (DOM rendering, localStorage, events). Existing `main.js` converted to `main.ts`. Vite handles TS compilation natively. Panel overlays content (no layout shift). Progress persists in localStorage. Auto-expands first incomplete level on load.

**Tech Stack:** TypeScript, Vite (already installed, handles TS natively), vanilla DOM APIs, localStorage

**Design doc:** `docs/plans/2026-03-03-exercise-system-design.md`

---

### Task 1: Convert project to TypeScript

**Files:**
- Create: `tsconfig.json`
- Rename: `main.js` -> `main.ts`
- Modify: `index.html` (update script tags)

**Step 1: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["*.ts"]
}
```

**Step 2: Rename main.js to main.ts**

```bash
git mv main.js main.ts
```

**Step 3: Add Site type and fix type errors in main.ts**

Add at the top of `main.ts`:

```ts
interface Site {
  id: number;
  name: string;
  owner: string;
  product: string;
  plan: string;
  status: "active" | "inactive" | "pending";
  csat: number | null;
  monthlyRevenue: number;
  domain: string;
  created: string;
  plugins: string[];
  pageViews: number;
  region: string;
}
```

Update the import to be typed:

```ts
import sites from "./data/sites.json" with { type: "json" };
const typedSites: Site[] = sites as Site[];
```

Then replace all references to `sites` (the import) with `typedSites` throughout the file. Update function signatures to use `Site[]`:

```ts
function calculateStats(filteredSites: Site[]) {
```

```ts
function renderTable(filteredSites: Site[]) {
```

```ts
function getCsatClass(csat: number | null): string {
```

Note: keep the intentional off-by-one bug on the revenue loop (`i < filteredSites.length - 1`). Do NOT fix it.

**Step 4: Update index.html script tags**

Change:
```html
<script type="module" src="main.js"></script>
<script type="module" src="exercises.js"></script>
```
To:
```html
<script type="module" src="main.ts"></script>
<script type="module" src="exercises.ts"></script>
```

(Vite resolves `.ts` files in dev and compiles them for build.)

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 6: Verify app still works**

```bash
npm start
```

Open http://localhost:5173. Dashboard should render exactly as before.

**Step 7: Commit**

```bash
git add tsconfig.json main.ts index.html
git rm main.js 2>/dev/null; true
git commit -m "Convert project to TypeScript"
```

---

### Task 2: Create exercise-data.ts with all 43 exercises

**Files:**
- Create: `exercise-data.ts`

**Step 1: Define types and export exercise content**

Create `exercise-data.ts` with typed interfaces and all 10 levels of content data. This file is pure data -- no DOM, no localStorage, no side effects.

```ts
export interface Exercise {
  id: string;
  title: string;
  difficulty: "warm-up" | "core" | "stretch";
  goal: string;
  hint: string;
  outcome: string;
  proTip: string | null;
}

export interface Level {
  id: number;
  title: string;
  theme: string;
  exercises: Exercise[];
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Explore and Orient",
    theme: "Learn to ask your AI tool questions about code",
    exercises: [
      {
        id: "1-1",
        title: "What does this project do?",
        difficulty: "warm-up",
        goal: "Ask your AI tool to explain the project structure and what each file does.",
        hint: "Can you explain what this project does and walk me through each file?",
        outcome: "You understand that index.html is the page, main.ts has the logic, style.css has the styling, and sites.json has the data.",
        proTip: null,
      },
      {
        id: "1-2",
        title: "Explain a function",
        difficulty: "core",
        goal: "Ask AI to explain the calculateStats function in main.ts in plain English.",
        hint: "Explain what the calculateStats function in main.ts does, step by step, in non-technical language.",
        outcome: "AI breaks down that it counts total sites, counts active sites, sums up revenue, and averages CSAT scores.",
        proTip: null,
      },
      {
        id: "1-3",
        title: "Where does the data come from?",
        difficulty: "core",
        goal: "Ask AI to trace where the site data originates and how it flows to the table.",
        hint: "Trace the data flow -- where does the site data come from and how does it end up in the table?",
        outcome: "You understand the path: sites.json is imported in main.ts, filtered by applyFilters(), then rendered as table rows by renderTable().",
        proTip: null,
      },
      {
        id: "1-4",
        title: "What would happen if...?",
        difficulty: "stretch",
        goal: "Ask AI what would happen if you deleted the applyFilters() call near the bottom of main.ts.",
        hint: "What would happen if I removed the applyFilters() call near the bottom of main.ts?",
        outcome: "AI explains the page would load with an empty table and empty summary cards because nothing triggers the initial render.",
        proTip: null,
      },
      {
        id: "1-5",
        title: "What events fire?",
        difficulty: "stretch",
        goal: "Ask AI what event fires when the product filter dropdown is changed. Trace from the HTML element to the handler.",
        hint: "What event fires when the product filter dropdown is changed? Trace from the HTML element to the event listener.",
        outcome: "You understand that the 'change' event on #filter-product triggers the applyFilters function, which re-renders everything.",
        proTip: "In real production repos, you can ask AI to find event tracking instrumentation the same way -- \"What analytics event fires when a user clicks [button]?\"",
      },
      {
        id: "1-6",
        title: "Vague vs. structured prompt",
        difficulty: "stretch",
        goal: "See how prompt quality changes AI output by trying two versions of the same question.",
        hint: "First ask: \"Tell me about the data.\" Then ask: \"Analyze sites.json and give me a summary table showing: count of sites per product type, average CSAT per product type, and total monthly revenue per product type. Format as a markdown table.\" Compare the two responses.",
        outcome: "The vague prompt gives a generic overview. The structured prompt gives you an actionable table you could paste into a Slack message or a slide.",
        proTip: "The pattern is: specify the data source, the exact metrics you want, the grouping, and the output format. This works the same way when you ask AI to analyze a CSV, a database query result, or a QuickSight dataset.",
      },
    ],
  },
  {
    id: 2,
    title: "First Changes",
    theme: "Make your first visible modifications",
    exercises: [
      {
        id: "2-1",
        title: "Change the page title",
        difficulty: "warm-up",
        goal: "Update the header text from \"Site Dashboard\" to something of your own.",
        hint: "Change the h1 heading in index.html from 'Site Dashboard' to 'My Product Dashboard'.",
        outcome: "The header in your browser shows your new title.",
        proTip: null,
      },
      {
        id: "2-2",
        title: "Change the header color",
        difficulty: "warm-up",
        goal: "Swap the dark header background to a color you like.",
        hint: "Change the header background color in style.css from black (#111) to dark blue.",
        outcome: "The header bar in your browser is now the color you chose.",
        proTip: null,
      },
      {
        id: "2-3",
        title: "Edit a site name",
        difficulty: "core",
        goal: "Change \"Bella's Bakery\" to a business name you make up in sites.json.",
        hint: "In data/sites.json, change the name of the first site from 'Bella's Bakery' to 'Nealey's Taco Shop'.",
        outcome: "The first row in the table shows your new business name.",
        proTip: null,
      },
      {
        id: "2-4",
        title: "Add yourself",
        difficulty: "stretch",
        goal: "Add a 16th site to sites.json with your own made-up business.",
        hint: "Add a new site to data/sites.json with id 16, called [your business name], with WordPress as the product, active status, and a CSAT of 6.0.",
        outcome: "The table now shows 16 rows and the Total Sites card says 16.",
        proTip: null,
      },
    ],
  },
  {
    id: 3,
    title: "Read and Understand Data",
    theme: "Use AI to answer PM-relevant questions from the data",
    exercises: [
      {
        id: "3-1",
        title: "Which product has the most sites?",
        difficulty: "warm-up",
        goal: "Ask AI to analyze sites.json and tell you which product type has the most sites.",
        hint: "Look at data/sites.json and tell me which product type (WordPress, Managed WordPress, Websites + Marketing) has the most sites.",
        outcome: "AI tells you WordPress has 6 sites, Managed WordPress has 4, Websites + Marketing has 5.",
        proTip: null,
      },
      {
        id: "3-2",
        title: "Who has the worst CSAT?",
        difficulty: "core",
        goal: "Ask AI which site has the lowest CSAT and why that might matter from a PM perspective.",
        hint: "Which site in sites.json has the lowest CSAT score? What might that tell a product manager?",
        outcome: "AI identifies Paws & Play Pet Care (3.2) and may note it's also inactive -- low satisfaction may have led to churn.",
        proTip: null,
      },
      {
        id: "3-3",
        title: "Revenue breakdown",
        difficulty: "core",
        goal: "Ask AI to calculate total monthly revenue grouped by product type.",
        hint: "Calculate the total monthly revenue for each product type in sites.json.",
        outcome: "AI gives you revenue totals per product (WordPress, Managed WordPress, Websites + Marketing).",
        proTip: null,
      },
      {
        id: "3-4",
        title: "Find the AI Builder users",
        difficulty: "stretch",
        goal: "Ask AI which sites use the AI Builder plugin and what patterns you see.",
        hint: "Which sites in sites.json have 'AI Builder' in their plugins list? What do they have in common?",
        outcome: "AI identifies the AI Builder users and may note they tend to have higher CSAT scores and revenue.",
        proTip: "This is the kind of question PMs can ask AI about real product data -- finding patterns without writing SQL.",
      },
    ],
  },
  {
    id: 4,
    title: "Add Features",
    theme: "Extend the dashboard with new functionality",
    exercises: [
      {
        id: "4-1",
        title: "Add a Page Views column",
        difficulty: "warm-up",
        goal: "The data has pageViews but it's not displayed -- add it to the table.",
        hint: "Add a 'Page Views' column to the table in index.html and main.ts. The data already exists in sites.json as pageViews.",
        outcome: "A new Page Views column appears in the table with formatted numbers.",
        proTip: null,
      },
      {
        id: "4-2",
        title: "Add a Region column",
        difficulty: "core",
        goal: "Same idea with the region field from sites.json.",
        hint: "Add a Region column to the sites table, pulling from the region field in the data.",
        outcome: "A Region column appears showing US-West, US-East, US-Central, EU.",
        proTip: null,
      },
      {
        id: "4-3",
        title: "Conditional row highlighting",
        difficulty: "core",
        goal: "Make rows with CSAT below 4.0 stand out visually.",
        hint: "Highlight table rows in light red where the CSAT score is below 4.0.",
        outcome: "Paws & Play (3.2) and Green Valley Farm (3.8) rows are highlighted.",
        proTip: null,
      },
      {
        id: "4-4",
        title: "New summary card",
        difficulty: "stretch",
        goal: "Add a \"Total Page Views\" card to the summary section at the top.",
        hint: "Add a new summary card showing Total Page Views, summing the pageViews field from all filtered sites.",
        outcome: "A fifth card appears in the summary row showing total page views.",
        proTip: "Notice how the card updates when you filter -- the same filtering logic applies automatically.",
      },
    ],
  },
  {
    id: 5,
    title: "Bug Hunt",
    theme: "Find and fix a real bug hidden in the code",
    exercises: [
      {
        id: "5-1",
        title: "Spot the discrepancy",
        difficulty: "warm-up",
        goal: "Manually add up the monthly revenue for all 15 sites. Does the dashboard total match?",
        hint: "Open sites.json and add up all the monthlyRevenue values. Compare to what the dashboard shows.",
        outcome: "The dashboard shows a lower number than your manual calculation -- something is wrong.",
        proTip: null,
      },
      {
        id: "5-2",
        title: "Ask AI to find the bug",
        difficulty: "core",
        goal: "Tell AI the revenue total seems wrong and see if it can locate the issue.",
        hint: "The Monthly Revenue total on the dashboard doesn't match what I calculated manually from sites.json. Can you find the bug?",
        outcome: "AI identifies the off-by-one error in the for loop in calculateStats (i < filteredSites.length - 1 should be i < filteredSites.length).",
        proTip: null,
      },
      {
        id: "5-3",
        title: "Fix it",
        difficulty: "core",
        goal: "Use AI to fix the bug and verify the total is now correct.",
        hint: "Fix the revenue calculation bug you found and verify the total is now correct.",
        outcome: "The Monthly Revenue card now shows the correct total including the last site's revenue.",
        proTip: null,
      },
      {
        id: "5-4",
        title: "Understand git blame",
        difficulty: "stretch",
        goal: "Ask AI to show you which commit introduced the bug.",
        hint: "Use git log or git blame to show me which commit introduced the bug in the revenue calculation.",
        outcome: "AI shows you the commit \"Add dashboard logic with filtering and summary stats\" introduced the off-by-one error.",
        proTip: "In real projects, git blame helps PMs understand when and why a change was made -- useful for incident timelines.",
      },
    ],
  },
  {
    id: 6,
    title: "Data Analysis",
    theme: "Turn raw data into actionable insights",
    exercises: [
      {
        id: "6-1",
        title: "Sort the table",
        difficulty: "core",
        goal: "Make table column headers clickable to sort ascending/descending.",
        hint: "Make the table headers clickable so clicking a column sorts the table by that column. Clicking again should reverse the sort order.",
        outcome: "Clicking \"CSAT\" sorts sites by CSAT score, clicking again reverses the order.",
        proTip: null,
      },
      {
        id: "6-2",
        title: "Revenue by product",
        difficulty: "core",
        goal: "Add a visible breakdown showing total revenue grouped by product type.",
        hint: "Add a section below the summary cards showing total monthly revenue broken down by product type.",
        outcome: "A new section appears showing revenue totals per product type.",
        proTip: null,
      },
      {
        id: "6-3",
        title: "CSAT distribution",
        difficulty: "core",
        goal: "Show how many sites fall into each CSAT bucket (good/ok/bad).",
        hint: "Add a visual showing how many sites have good CSAT (5.5+), ok CSAT (4.0-5.4), and bad CSAT (below 4.0).",
        outcome: "A breakdown showing the count per bucket (e.g., 6 good, 4 ok, 2 bad).",
        proTip: null,
      },
      {
        id: "6-4",
        title: "Top performers",
        difficulty: "stretch",
        goal: "Highlight or badge the top 3 sites by page views.",
        hint: "Add a visual indicator (like a star or badge) to the top 3 sites by page views in the table.",
        outcome: "The 3 highest-traffic sites have a visible badge or highlight.",
        proTip: null,
      },
    ],
  },
  {
    id: 7,
    title: "Visualization",
    theme: "Add charts and visual data stories",
    exercises: [
      {
        id: "7-1",
        title: "Bar chart",
        difficulty: "core",
        goal: "Add a bar chart showing CSAT scores by site using pure HTML/CSS.",
        hint: "Add a horizontal bar chart below the table showing CSAT scores for each site. Use colored div elements with widths based on the CSAT score -- no charting library needed.",
        outcome: "A bar chart appears with each site's CSAT score visualized as colored bars.",
        proTip: null,
      },
      {
        id: "7-2",
        title: "Pie chart",
        difficulty: "core",
        goal: "Add a pie chart showing the product type distribution using CSS.",
        hint: "Add a pie chart showing what percentage of sites use each product type (WordPress, Managed WordPress, Websites + Marketing). Use a CSS conic-gradient approach -- no library needed.",
        outcome: "A pie chart appears with 3 segments showing the product mix.",
        proTip: null,
      },
      {
        id: "7-3",
        title: "Make it interactive",
        difficulty: "stretch",
        goal: "Add hover tooltips or click interactions to a chart.",
        hint: "Make the bar chart interactive -- show the exact CSAT score and site name when you hover over a bar. Use CSS :hover and a tooltip element.",
        outcome: "Hovering over chart elements reveals details.",
        proTip: "For production dashboards you'd use Chart.js or D3 -- but pure CSS charts are great for quick prototypes and keep this project dependency-free.",
      },
    ],
  },
  {
    id: 8,
    title: "Build a New View",
    theme: "Create something that doesn't exist yet",
    exercises: [
      {
        id: "8-1",
        title: "Site detail panel",
        difficulty: "core",
        goal: "When you click a site name in the table, show a detail panel with all of that site's information.",
        hint: "When I click a site name in the table, show a slide-out panel on the right with all details for that site including plugins, page views, and region.",
        outcome: "Clicking a site name opens a detail view showing fields not in the table.",
        proTip: null,
      },
      {
        id: "8-2",
        title: "Comparison mode",
        difficulty: "stretch",
        goal: "Let users select two sites and see a side-by-side comparison.",
        hint: "Add checkboxes to each row and a 'Compare' button that shows a side-by-side comparison of the selected sites.",
        outcome: "Selecting two sites and clicking Compare shows their stats side-by-side.",
        proTip: null,
      },
      {
        id: "8-3",
        title: "Executive summary view",
        difficulty: "stretch",
        goal: "Add a toggleable executive summary view within the existing page.",
        hint: "Add a 'Summary View' toggle button in the header. When clicked, hide the table and show an executive overview section with total sites, total revenue, average CSAT, and top/bottom performers. Clicking 'Table View' switches back.",
        outcome: "A toggle switches between the detailed table and a high-level executive view, all within the same page.",
        proTip: null,
      },
      {
        id: "8-4",
        title: "Build from a screenshot",
        difficulty: "stretch",
        goal: "Take a screenshot of any UI you like (a competitor's dashboard, a Figma mock, a sketch on paper) and use it as an AI input to generate code.",
        hint: "Take a screenshot and paste it into the AI chat. Then say: \"Build me a component that looks like this screenshot. Use the same layout and visual style but populate it with data from sites.json.\"",
        outcome: "AI generates a new section or component that visually matches your reference image, wired to real data.",
        proTip: "This is one of the highest-leverage PM workflows -- go from a whiteboard sketch or Figma mock to a working prototype in minutes. Some PMs use this to estimate LOE by asking \"how complex would this be to build?\" after the AI generates the code.",
      },
    ],
  },
  {
    id: 9,
    title: "Prototype Your Own Idea",
    theme: "Apply vibe coding to your actual PM work",
    exercises: [
      {
        id: "9-1",
        title: "Identify a real problem",
        difficulty: "warm-up",
        goal: "Think about a task from your PM workflow that you currently do manually or ask engineering for help with.",
        hint: "No AI prompt needed -- just reflect. Examples: a prioritization scorecard, a competitive comparison table, a release checklist, a customer feedback tracker.",
        outcome: "You have a concrete idea for something you want to build. You can describe it in one sentence.",
        proTip: null,
      },
      {
        id: "9-2",
        title: "Write a mini-spec first",
        difficulty: "core",
        goal: "Before prompting AI, write a short spec for your idea -- 3-5 bullet points covering what it does, what data it needs, and what the output looks like.",
        hint: "Write something like: \"Tool: Priority Scorecard. Purpose: Rank feature requests by impact and effort. Data: a list of features with name, impact score (1-5), effort score (1-5), and requestor. Output: a table sorted by impact/effort ratio with color-coded priority bands.\"",
        outcome: "You have a structured spec you can hand to AI instead of a vague description.",
        proTip: "PMs who write a spec before prompting get dramatically better first-pass output. It also becomes the acceptance criteria -- you can tell AI \"this doesn't match the spec, the table should be sorted by ratio\" instead of vague feedback. This is the same pattern as writing a PRD before handing work to engineering.",
      },
      {
        id: "9-3",
        title: "Describe it to AI",
        difficulty: "core",
        goal: "Open a new file or project and give AI your mini-spec from the previous exercise.",
        hint: "Paste your spec into the chat and say: \"Build this for me as a single HTML page with inline CSS and JS. Here's the spec: [your spec].\"",
        outcome: "AI generates a first pass of your idea that you can see in the browser.",
        proTip: null,
      },
      {
        id: "9-4",
        title: "Iterate to a working prototype",
        difficulty: "stretch",
        goal: "Go back and forth with AI, refining until you have something you could show a colleague.",
        hint: "Keep giving feedback -- \"make the table wider\", \"add a column for priority\", \"the colors don't look right, use a blue theme\".",
        outcome: "You have a prototype that demonstrates your idea visually.",
        proTip: "Screenshot your prototype and share it in Slack -- it communicates ideas faster than a written spec.",
      },
    ],
  },
  {
    id: 10,
    title: "Ship It",
    theme: "Learn the basics of version control",
    exercises: [
      {
        id: "10-1",
        title: "Check your changes",
        difficulty: "warm-up",
        goal: "Ask AI to explain what git status and git diff show you.",
        hint: "Run git status and git diff and explain what each section means.",
        outcome: "You understand which files you've changed and what the changes look like.",
        proTip: null,
      },
      {
        id: "10-2",
        title: "Create a branch",
        difficulty: "core",
        goal: "Ask AI to create a new branch for your changes.",
        hint: "Create a new git branch called 'my-dashboard-changes' and explain why branches are useful.",
        outcome: "You're on a new branch with your changes, and you understand that branches let you experiment without affecting the original code.",
        proTip: null,
      },
      {
        id: "10-3",
        title: "Write a commit message",
        difficulty: "core",
        goal: "Ask AI to help you stage and commit your work with a clear message.",
        hint: "Help me commit my changes with a clear commit message that describes what I changed and why.",
        outcome: "Your changes are committed with a descriptive message.",
        proTip: null,
      },
      {
        id: "10-4",
        title: "Understand PRs",
        difficulty: "stretch",
        goal: "Ask AI to explain what a pull request is and when a PM might use one.",
        hint: "Explain what a pull request is, how it works, and give me an example of when a PM would create one vs. just prototyping locally.",
        outcome: "You understand PRs as a way to propose changes for review -- useful when your prototype is ready to become real code.",
        proTip: "Even if you never create a PR, understanding them helps you speak engineering's language in sprint planning.",
      },
      {
        id: "10-5",
        title: "Spot the security risk",
        difficulty: "stretch",
        goal: "Ask AI to review your code for security issues, focusing on hardcoded values and exposed data.",
        hint: "Review my project for security risks. Are there any API keys, passwords, or sensitive data hardcoded in the source files? What should I never commit to git?",
        outcome: "AI explains the concept of environment variables, .gitignore, and why you never put API keys or credentials in source code that gets committed.",
        proTip: "Nearly half of AI-generated code contains security flaws. The most common mistake is hardcoding credentials. When you build real prototypes that connect to APIs, always ask AI: \"Is anything sensitive exposed in this code?\"",
      },
      {
        id: "10-6",
        title: "Write a handoff brief",
        difficulty: "stretch",
        goal: "Ask AI to generate a handoff document that an engineer could use to understand your prototype.",
        hint: "Write a brief for an engineer explaining: what this prototype demonstrates, what decisions were made, what's a hack vs. what should be kept, and what needs real engineering to be production-ready.",
        outcome: "AI generates a structured handoff document that separates \"proof of concept\" from \"production-ready\" code.",
        proTip: "A working prototype with a clear handoff brief changes the PM-eng dynamic. Instead of writing a Jira ticket describing what you want, you're showing a working version and explaining what needs to be hardened. Engineers can evaluate the approach rather than interpret your requirements from scratch.",
      },
    ],
  },
];

export const TOTAL_EXERCISES = levels.reduce(
  (sum, level) => sum + level.exercises.length,
  0
);
```

**Step 2: Verify type correctness**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add exercise-data.ts
git commit -m "Add typed exercise data for all 10 levels (43 exercises)"
```

---

### Task 3: Create exercises.ts with rendering, state, and event logic

**Files:**
- Create: `exercises.ts`

**Step 1: Create exercises.ts**

This file imports from `exercise-data.ts` and handles all DOM rendering, localStorage persistence, accordion behavior, and event delegation.

```ts
import { levels, TOTAL_EXERCISES, type Level, type Exercise } from "./exercise-data";

// --- localStorage state ---

const STORAGE_KEY = "vibe-exercises-progress";
const PANEL_KEY = "vibe-exercises-panel-open";
const LEVEL_KEY = "vibe-exercises-expanded-level";

type ProgressMap = Record<string, boolean>;

function loadProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadPanelOpen(): boolean {
  return localStorage.getItem(PANEL_KEY) === "true";
}

function savePanelOpen(open: boolean): void {
  localStorage.setItem(PANEL_KEY, String(open));
}

function loadExpandedLevel(): number | null {
  const val = localStorage.getItem(LEVEL_KEY);
  if (val === null || val === "0") return null;
  return Number(val);
}

function saveExpandedLevel(id: number | null): void {
  localStorage.setItem(LEVEL_KEY, String(id ?? 0));
}

function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PANEL_KEY);
  localStorage.removeItem(LEVEL_KEY);
}

// --- Progress helpers ---

function getCompletedCount(progress: ProgressMap): number {
  return Object.values(progress).filter(Boolean).length;
}

function getLevelCompletedCount(level: Level, progress: ProgressMap): number {
  return level.exercises.filter((ex) => progress[ex.id]).length;
}

function findFirstIncompleteLevel(progress: ProgressMap): number | null {
  for (const level of levels) {
    if (getLevelCompletedCount(level, progress) < level.exercises.length) {
      return level.id;
    }
  }
  return null;
}

// --- Rendering ---

function renderProgressBar(progress: ProgressMap): void {
  const completed = getCompletedCount(progress);
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  if (fill) fill.style.width = `${(completed / TOTAL_EXERCISES) * 100}%`;
  if (text) text.textContent = `${completed} / ${TOTAL_EXERCISES} completed`;
}

const DIFFICULTY_LABELS: Record<Exercise["difficulty"], string> = {
  "warm-up": "Warm-up",
  core: "Core",
  stretch: "Stretch",
};

function createExerciseCard(exercise: Exercise, progress: ProgressMap): HTMLElement {
  const done = progress[exercise.id] || false;
  const card = document.createElement("div");
  card.className = `exercise-card${done ? " completed" : ""}`;

  const header = document.createElement("div");
  header.className = "exercise-header";

  const label = document.createElement("label");
  label.className = "exercise-check";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.id = exercise.id;
  checkbox.checked = done;

  const title = document.createElement("span");
  title.className = "exercise-title";
  title.textContent = exercise.title;

  label.appendChild(checkbox);
  label.appendChild(title);

  const tag = document.createElement("span");
  tag.className = `difficulty-tag difficulty-${exercise.difficulty}`;
  tag.textContent = DIFFICULTY_LABELS[exercise.difficulty];

  header.appendChild(label);
  header.appendChild(tag);

  const body = document.createElement("div");
  body.className = "exercise-body";

  const goalP = document.createElement("p");
  goalP.className = "exercise-goal";
  goalP.textContent = exercise.goal;
  body.appendChild(goalP);

  const details = document.createElement("details");
  details.className = "exercise-hint";
  const summary = document.createElement("summary");
  summary.textContent = "Try this prompt";
  const hintP = document.createElement("p");
  hintP.textContent = exercise.hint;
  details.appendChild(summary);
  details.appendChild(hintP);
  body.appendChild(details);

  const outcomeDiv = document.createElement("div");
  outcomeDiv.className = "exercise-outcome";
  const outcomeStrong = document.createElement("strong");
  outcomeStrong.textContent = "Expected outcome: ";
  outcomeDiv.appendChild(outcomeStrong);
  outcomeDiv.appendChild(document.createTextNode(exercise.outcome));
  body.appendChild(outcomeDiv);

  if (exercise.proTip) {
    const tipDiv = document.createElement("div");
    tipDiv.className = "exercise-pro-tip";
    const tipStrong = document.createElement("strong");
    tipStrong.textContent = "Pro tip: ";
    tipDiv.appendChild(tipStrong);
    tipDiv.appendChild(document.createTextNode(exercise.proTip));
    body.appendChild(tipDiv);
  }

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function createLevelSection(
  level: Level,
  progress: ProgressMap,
  expandedLevelId: number | null
): HTMLElement {
  const completedCount = getLevelCompletedCount(level, progress);
  const isExpanded = level.id === expandedLevelId;
  const allDone = completedCount === level.exercises.length;

  const section = document.createElement("div");
  section.className = "level-section";
  if (isExpanded) section.classList.add("expanded");
  if (allDone) section.classList.add("all-done");

  const headerBtn = document.createElement("button");
  headerBtn.className = "level-header";
  headerBtn.dataset.level = String(level.id);

  const info = document.createElement("div");
  info.className = "level-info";

  const num = document.createElement("span");
  num.className = "level-number";
  num.textContent = allDone ? "\u2713" : String(level.id);

  const textWrap = document.createElement("div");
  const titleSpan = document.createElement("span");
  titleSpan.className = "level-title";
  titleSpan.textContent = level.title;
  const themeSpan = document.createElement("span");
  themeSpan.className = "level-theme";
  themeSpan.textContent = level.theme;
  textWrap.appendChild(titleSpan);
  textWrap.appendChild(themeSpan);

  info.appendChild(num);
  info.appendChild(textWrap);

  const progressSpan = document.createElement("span");
  progressSpan.className = "level-progress";
  progressSpan.textContent = `${completedCount}/${level.exercises.length}`;

  headerBtn.appendChild(info);
  headerBtn.appendChild(progressSpan);

  const body = document.createElement("div");
  body.className = "level-body";
  for (const ex of level.exercises) {
    body.appendChild(createExerciseCard(ex, progress));
  }

  section.appendChild(headerBtn);
  section.appendChild(body);
  return section;
}

function renderExerciseList(expandedLevelId: number | null): void {
  const container = document.getElementById("exercise-list");
  if (!container) return;
  const progress = loadProgress();
  container.replaceChildren(
    ...levels.map((level) => createLevelSection(level, progress, expandedLevelId))
  );
  renderProgressBar(progress);
}

function renderResetLink(): void {
  const panel = document.getElementById("exercise-panel");
  if (!panel || panel.querySelector(".reset-progress")) return;

  const resetLink = document.createElement("button");
  resetLink.className = "reset-progress";
  resetLink.textContent = "Reset Progress";
  resetLink.addEventListener("click", () => {
    if (confirm("Reset all exercise progress? This cannot be undone.")) {
      resetAllProgress();
      expandedLevel = findFirstIncompleteLevel(loadProgress()) ?? 1;
      renderExerciseList(expandedLevel);
    }
  });
  panel.appendChild(resetLink);
}

// --- Initialization ---

let expandedLevel: number | null = null;

function init(): void {
  const toggleBtn = document.getElementById("toggle-exercises");
  const panel = document.getElementById("exercise-panel");
  if (!toggleBtn || !panel) return;

  const progress = loadProgress();

  // Auto-expand first incomplete level, or restore saved state
  const saved = loadExpandedLevel();
  expandedLevel = saved ?? findFirstIncompleteLevel(progress) ?? 1;

  // Restore panel state
  if (loadPanelOpen()) {
    panel.classList.add("open");
  }

  // Toggle panel
  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    savePanelOpen(isOpen);
  });

  // Render exercises and reset link
  renderExerciseList(expandedLevel);
  renderResetLink();

  // Delegate clicks for accordion and checkboxes
  const exerciseList = document.getElementById("exercise-list");
  if (!exerciseList) return;

  exerciseList.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Accordion toggle
    const levelHeader = target.closest(".level-header") as HTMLElement | null;
    if (levelHeader && !target.closest("input")) {
      const levelId = Number(levelHeader.dataset.level);
      expandedLevel = expandedLevel === levelId ? null : levelId;
      saveExpandedLevel(expandedLevel);
      renderExerciseList(expandedLevel);
      return;
    }

    // Checkbox toggle
    const checkbox = target.closest('input[type="checkbox"]') as HTMLInputElement | null;
    if (checkbox && checkbox.dataset.id) {
      const progress = loadProgress();
      progress[checkbox.dataset.id] = checkbox.checked;
      saveProgress(progress);
      renderExerciseList(expandedLevel);
    }
  });
}

init();
```

Key design decisions in this code:
- Uses `document.createElement` throughout (no innerHTML) for XSS safety and maintainability
- Uses `replaceChildren` instead of setting innerHTML for the exercise list
- Event delegation on the exercise list for accordion and checkboxes
- `findFirstIncompleteLevel` auto-expands the right level for returning users
- Reset progress link appended to the panel bottom

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add exercises.ts
git commit -m "Add exercise panel rendering with TypeScript DOM APIs"
```

---

### Task 4: Add exercise panel CSS to style.css

**Files:**
- Modify: `style.css`

**Step 1: Add exercise panel styles**

Insert the following CSS before the existing `@media (max-width: 768px)` block (before line 143 of the current file):

```css
/* --- Exercise Panel --- */

.exercise-toggle {
  position: absolute;
  top: 24px;
  right: 32px;
  background: #0073ec;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.exercise-toggle:hover {
  background: #005bb5;
}

header {
  position: relative;
}

.exercise-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 400px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow-y: auto;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.exercise-panel.open {
  right: 0;
}

.exercise-panel-header {
  background: #111;
  color: #fff;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.exercise-panel-header h2 {
  font-size: 18px;
  margin-bottom: 6px;
}

.exercise-panel-header p {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
}

#progress-bar {
  background: #333;
  border-radius: 8px;
  height: 28px;
  position: relative;
  overflow: hidden;
}

#progress-fill {
  background: #00a63f;
  height: 100%;
  width: 0;
  transition: width 0.4s ease;
  border-radius: 8px;
}

#progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

/* Level accordion */

.level-section {
  border-bottom: 1px solid #eee;
}

.level-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.level-header:hover {
  background: #f8f9fb;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  flex-shrink: 0;
}

.level-section.all-done .level-number {
  background: #e6f9ed;
  color: #00a63f;
}

.level-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.level-theme {
  display: block;
  font-size: 12px;
  color: #999;
}

.level-progress {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  flex-shrink: 0;
}

.level-body {
  display: none;
  padding: 0 16px 12px;
}

.level-section.expanded .level-body {
  display: block;
}

/* Exercise cards */

.exercise-card {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.exercise-card.completed {
  opacity: 0.6;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.exercise-check {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.exercise-check input[type="checkbox"] {
  margin-top: 3px;
  flex-shrink: 0;
}

.exercise-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.exercise-card.completed .exercise-title {
  text-decoration: line-through;
  color: #999;
}

.difficulty-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.difficulty-warm-up {
  background: #e6f9ed;
  color: #00a63f;
}

.difficulty-core {
  background: #e8f0fe;
  color: #0073ec;
}

.difficulty-stretch {
  background: #fff3e0;
  color: #e87400;
}

.exercise-body {
  margin-top: 8px;
}

.exercise-goal {
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.exercise-hint {
  margin-bottom: 8px;
}

.exercise-hint summary {
  font-size: 12px;
  font-weight: 600;
  color: #0073ec;
  cursor: pointer;
  padding: 4px 0;
}

.exercise-hint p {
  font-size: 12px;
  color: #555;
  background: #fff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  margin-top: 4px;
  font-family: "SF Mono", "Fira Code", monospace;
}

.exercise-outcome {
  font-size: 12px;
  color: #555;
  padding: 6px 0;
}

.exercise-outcome strong {
  color: #333;
}

.exercise-pro-tip {
  font-size: 12px;
  color: #e87400;
  padding: 6px 10px;
  background: #fff8f0;
  border-radius: 6px;
  margin-top: 4px;
}

.exercise-pro-tip strong {
  color: #c56200;
}

.reset-progress {
  display: block;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
}

.reset-progress:hover {
  color: #d63333;
  background: #fef2f2;
}
```

**Step 2: Update the existing mobile media query**

Replace the existing `@media (max-width: 768px)` block with:

```css
@media (max-width: 768px) {
  main { padding: 16px; }
  .summary-cards { grid-template-columns: 1fr 1fr; }
  #controls { flex-direction: column; }
  #controls input { min-width: auto; }

  .exercise-panel {
    width: 100%;
    right: -100%;
  }
}
```

**Step 3: Commit**

```bash
git add style.css
git commit -m "Add exercise panel, accordion, and card styles"
```

---

### Task 5: Update index.html

**Files:**
- Modify: `index.html`

**Step 1: Fix the progress count and update panel description**

Change line 22 from:
```html
<span id="progress-text">0 / 6 completed</span>
```
to:
```html
<span id="progress-text">0 / 43 completed</span>
```

Change line 19 from:
```html
<p>Use your AI coding tool (Claude Code, Cursor, or ChatGPT) to complete each challenge. Click an exercise to expand it.</p>
```
to:
```html
<p>Use your AI coding tool to complete each challenge. Click a level to expand it.</p>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "Update exercise panel text and progress count"
```

---

### Task 6: End-to-end verification

**Files:** None (verification only)

**Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Start dev server and verify**

```bash
npm start
```

Open http://localhost:5173.

**Step 3: Verify checklist**

1. Dashboard renders with all 15 sites, 4 summary cards, search/filters
2. "Exercises" button visible in header (blue button, top right)
3. Click "Exercises" -- sidebar slides in from right, overlays dashboard content (no layout shift)
4. Progress bar shows "0 / 43 completed"
5. First incomplete level is auto-expanded (Level 1 on first visit)
6. Level 1 shows 6 exercises with warm-up/core/stretch tags
7. "Try this prompt" collapsed by default, expands on click
8. Pro tips visible on exercises 1-5, 1-6
9. Check a checkbox -- card gets strikethrough, progress updates to "1 / 43"
10. Click Level 2 header -- Level 2 expands, Level 1 collapses
11. Refresh page -- checkbox still checked, panel state preserved, correct level expanded
12. Close panel, refresh -- panel stays closed
13. "Reset Progress" link at bottom of panel -- click it, confirm, all progress clears
14. Revenue total is still intentionally wrong (the bug remains for Level 5)
15. Mobile: resize to <768px -- panel goes full-width

**Step 4: Final commit log**

```bash
git log --oneline
```

Expected (newest first):
```
[hash] Update exercise panel text and progress count
[hash] Add exercise panel, accordion, and card styles
[hash] Add exercise panel rendering with TypeScript DOM APIs
[hash] Add typed exercise data for all 10 levels (43 exercises)
[hash] Convert project to TypeScript
[hash] Add exercise system design doc
[hash] Add README with setup instructions and exercises
[hash] Add dashboard logic with filtering and summary stats
[hash] Add mock site data for 15 customer sites
[hash] Add dashboard layout and styling
[hash] Initial project setup with Vite
```

---

### Summary

| Task | Files | What |
|------|-------|------|
| 1 | Create `tsconfig.json`, rename `main.js` -> `main.ts`, modify `index.html` | Convert to TypeScript |
| 2 | Create `exercise-data.ts` | 10 levels, 43 exercises of typed content data |
| 3 | Create `exercises.ts` | Rendering, accordion, localStorage, events (safe DOM APIs) |
| 4 | Modify `style.css` | Panel, accordion, card, progress bar, reset, mobile styles |
| 5 | Modify `index.html` | Fix progress count, update panel text |
| 6 | None | End-to-end verification |
