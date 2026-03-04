# Interactive Exercise System Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

Add a 10-level interactive exercise system built into the Site Dashboard starter app. The exercises teach GoDaddy PMs how to vibe code by progressively guiding them from "ask AI about code" to "build and ship your own prototype."

## Decisions

- **UI:** Collapsible right sidebar panel (400px), accordion levels, exercise cards
- **Verification:** Self-check with expected outcome descriptions. PM clicks "Mark Complete" manually.
- **Prompts:** Goal-first with expandable "Try this prompt" hints for beginners
- **Progress:** localStorage persistence across browser sessions
- **Scope:** 10 levels, 3-6 exercises each, 43 exercises total

## UI Architecture

### Exercise Panel (sidebar)
- Fixed right sidebar, 400px wide
- Toggled via "Exercises" button in header
- When open, panel overlays content (does not push/shift the dashboard)
- On mobile (<768px), panel goes full-width overlay

### Level Accordion
- 10 collapsible sections
- Each shows: level number, title, completion count (e.g., "3/5 done")
- Short theme description visible when collapsed
- Expands to show exercise cards

### Exercise Card
- Exercise title + difficulty tag (Warm-up / Core / Stretch)
- Goal description (what to achieve)
- Expandable "Try this prompt" hint section (collapsed by default)
- Expected outcome description
- "Mark Complete" checkbox
- Optional "Pro tip" for going further

### Progress Bar
- Top of panel, shows total exercises completed across all levels
- Text: "X / 43 completed"
- State persisted in localStorage key `vibe-exercises-progress`
- On load, auto-expands the first level with incomplete exercises so returning users see where they left off

### Reset Progress
- "Reset Progress" link at the bottom of the panel
- Shows a confirmation prompt before clearing localStorage
- Resets all exercise completions, panel state, and expanded level

## Curriculum: 10 Levels

### Level 1: Explore and Orient
*Theme: Learn to ask your AI tool questions about code*

1. **What does this project do?** (Warm-up)
   - Goal: Ask AI to explain the project structure and what each file does
   - Hint: "Can you explain what this project does and walk me through each file?"
   - Outcome: You understand that index.html is the page, main.js has the logic, style.css has the styling, and sites.json has the data

2. **Explain a function** (Core)
   - Goal: Ask AI to explain the `calculateStats` function in main.js in plain English
   - Hint: "Explain what the calculateStats function in main.js does, step by step, in non-technical language"
   - Outcome: AI breaks down that it counts sites, sums revenue, and averages CSAT scores

3. **Where does the data come from?** (Core)
   - Goal: Ask AI to trace where the site data originates and how it flows to the table
   - Hint: "Trace the data flow -- where does the site data come from and how does it end up in the table?"
   - Outcome: You understand the path: sites.json -> imported in main.js -> filtered -> rendered as table rows

4. **What would happen if...?** (Stretch)
   - Goal: Ask AI what would happen if you deleted the `applyFilters()` call on line 115 of main.js
   - Hint: "What would happen if I removed the applyFilters() call on line 115 of main.js?"
   - Outcome: AI explains the page would load with an empty table and empty summary cards because nothing triggers the initial render

5. **What events fire?** (Stretch)
   - Goal: Ask AI what EID event is fired when a specific action is clicked (e.g., changing the product filter dropdown)
   - Hint: "What event fires when the product filter dropdown is changed? Trace from the HTML element to the event listener."
   - Outcome: You understand how DOM events connect UI actions to code (the `change` event on `#filter-product` triggers `applyFilters`)
   - Pro tip: In real GoDaddy repos, you can ask AI to find EID event instrumentation the same way -- "What EID fires when a user clicks [button]?"

6. **Vague vs. structured prompt** (Stretch)
   - Goal: See how prompt quality changes AI output by trying two versions of the same question
   - Hint: First ask: "Tell me about the data." Then ask: "Analyze sites.json and give me a summary table showing: count of sites per product type, average CSAT per product type, and total monthly revenue per product type. Format as a markdown table." Compare the two responses.
   - Outcome: The vague prompt gives a generic overview. The structured prompt gives you an actionable table you could paste into a Slack message or a slide.
   - Pro tip: The pattern is: specify the data source, the exact metrics you want, the grouping, and the output format. This works the same way when you ask AI to analyze a CSV, a database query result, or a QuickSight dataset.

### Level 2: First Changes
*Theme: Make your first visible modifications*

1. **Change the page title** (Warm-up)
   - Goal: Update the header text from "Site Dashboard" to something of your own
   - Hint: "Change the h1 heading in index.html from 'Site Dashboard' to 'My Product Dashboard'"
   - Outcome: The header in your browser shows your new title

2. **Change the header color** (Warm-up)
   - Goal: Swap the dark header background to a color you like
   - Hint: "Change the header background color in style.css from black to dark blue"
   - Outcome: The header bar in your browser is now the color you chose

3. **Edit a site name** (Core)
   - Goal: Change "Bella's Bakery" to a business name you make up in sites.json
   - Hint: "In data/sites.json, change the name of the first site from 'Bella's Bakery' to 'Nealey's Taco Shop'"
   - Outcome: The first row in the table shows your new business name

4. **Add yourself** (Stretch)
   - Goal: Add a 16th site to sites.json with your own made-up business
   - Hint: "Add a new site to data/sites.json with id 16, called [your business name], with WordPress as the product, active status, and a CSAT of 6.0"
   - Outcome: The table now shows 16 rows and the Total Sites card says 16

### Level 3: Read and Understand Data
*Theme: Use AI to answer PM-relevant questions from the data*

1. **Which product has the most sites?** (Warm-up)
   - Goal: Ask AI to analyze sites.json and tell you which product type has the most sites
   - Hint: "Look at data/sites.json and tell me which product type (WordPress, Managed WordPress, Websites + Marketing) has the most sites"
   - Outcome: AI tells you WordPress has 6 sites, Managed WordPress has 4, Websites + Marketing has 5

2. **Who has the worst CSAT?** (Core)
   - Goal: Ask AI which site has the lowest CSAT and why that might matter from a PM perspective
   - Hint: "Which site in sites.json has the lowest CSAT score? What might that tell a product manager?"
   - Outcome: AI identifies Paws & Play Pet Care (3.2) and may note it's also inactive -- low satisfaction may have led to churn

3. **Revenue breakdown** (Core)
   - Goal: Ask AI to calculate total monthly revenue grouped by product type
   - Hint: "Calculate the total monthly revenue for each product type in sites.json"
   - Outcome: AI gives you revenue totals per product (WordPress, Managed WordPress, Websites + Marketing)

4. **Find the Airo users** (Stretch)
   - Goal: Ask AI which sites use the Airo plugin and what patterns you see
   - Hint: "Which sites in sites.json have 'Airo' in their plugins list? What do they have in common?"
   - Outcome: AI identifies the Airo users and may note they tend to have higher CSAT scores and revenue
   - Pro tip: This is the kind of question PMs can ask AI about real product data -- finding patterns without writing SQL

### Level 4: Add Features
*Theme: Extend the dashboard with new functionality*

1. **Add a Page Views column** (Warm-up)
   - Goal: The data has `pageViews` but it's not displayed -- add it to the table
   - Hint: "Add a 'Page Views' column to the table in index.html and main.js. The data already exists in sites.json as pageViews"
   - Outcome: A new Page Views column appears in the table with formatted numbers

2. **Add a Region column** (Core)
   - Goal: Same idea with the `region` field from sites.json
   - Hint: "Add a Region column to the sites table, pulling from the region field in the data"
   - Outcome: A Region column appears showing US-West, US-East, US-Central, EU

3. **Conditional row highlighting** (Core)
   - Goal: Make rows with CSAT below 4.0 stand out visually
   - Hint: "Highlight table rows in light red where the CSAT score is below 4.0"
   - Outcome: Paws & Play (3.2) and Green Valley Farm (3.8) rows are highlighted

4. **New summary card** (Stretch)
   - Goal: Add a "Total Page Views" card to the summary section at the top
   - Hint: "Add a new summary card showing Total Page Views, summing the pageViews field from all filtered sites"
   - Outcome: A fifth card appears in the summary row showing total page views
   - Pro tip: Notice how the card updates when you filter -- the same filtering logic applies automatically

### Level 5: Bug Hunt
*Theme: Find and fix a real bug hidden in the code*

> **Implementation note:** The starter app ships with an intentional off-by-one error in `calculateStats` (`i < filteredSites.length - 1` instead of `i < filteredSites.length`). This bug is subtle enough that users won't notice it before reaching this level -- the revenue total is only slightly off because it skips the last site. Do not fix this bug during initial setup.

1. **Spot the discrepancy** (Warm-up)
   - Goal: Manually add up the monthly revenue for all 15 sites. Does the dashboard total match?
   - Hint: Open sites.json and add up all the monthlyRevenue values. Compare to what the dashboard shows.
   - Outcome: The dashboard shows a lower number than your manual calculation -- something is wrong

2. **Ask AI to find the bug** (Core)
   - Goal: Tell AI the revenue total seems wrong and see if it can locate the issue
   - Hint: "The Monthly Revenue total on the dashboard doesn't match what I calculated manually from sites.json. Can you find the bug?"
   - Outcome: AI identifies the off-by-one error in the for loop in calculateStats (line 9: `i < filteredSites.length - 1` should be `i < filteredSites.length`)

3. **Fix it** (Core)
   - Goal: Use AI to fix the bug and verify the total is now correct
   - Hint: "Fix the revenue calculation bug you found and verify the total is now correct"
   - Outcome: The Monthly Revenue card now shows the correct total including the last site's revenue

4. **Understand git blame** (Stretch)
   - Goal: Ask AI to show you which commit introduced the bug
   - Hint: "Use git log or git blame to show me which commit introduced the bug in the revenue calculation"
   - Outcome: AI shows you the commit "Add dashboard logic with filtering and summary stats" introduced the off-by-one error
   - Pro tip: In real projects, git blame helps PMs understand when and why a change was made -- useful for incident timelines

### Level 6: Data Analysis
*Theme: Turn raw data into actionable insights*

1. **Sort the table** (Core)
   - Goal: Make table column headers clickable to sort ascending/descending
   - Hint: "Make the table headers clickable so clicking a column sorts the table by that column. Clicking again should reverse the sort order."
   - Outcome: Clicking "CSAT" sorts sites by CSAT score, clicking again reverses the order

2. **Revenue by product** (Core)
   - Goal: Add a visible breakdown showing total revenue grouped by product type
   - Hint: "Add a section below the summary cards showing total monthly revenue broken down by product type"
   - Outcome: A new section appears showing revenue totals per product type

3. **CSAT distribution** (Core)
   - Goal: Show how many sites fall into each CSAT bucket (good/ok/bad)
   - Hint: "Add a visual showing how many sites have good CSAT (5.5+), ok CSAT (4.0-5.4), and bad CSAT (below 4.0)"
   - Outcome: A breakdown showing the count per bucket (e.g., 6 good, 4 ok, 2 bad)

4. **Top performers** (Stretch)
   - Goal: Highlight or badge the top 3 sites by page views
   - Hint: "Add a visual indicator (like a star or badge) to the top 3 sites by page views in the table"
   - Outcome: The 3 highest-traffic sites have a visible badge or highlight

### Level 7: Visualization
*Theme: Add charts and visual data stories*

1. **Bar chart** (Core)
   - Goal: Add a bar chart showing CSAT scores by site using pure HTML/CSS
   - Hint: "Add a horizontal bar chart below the table showing CSAT scores for each site. Use colored div elements with widths based on the CSAT score -- no charting library needed"
   - Outcome: A bar chart appears with each site's CSAT score visualized as colored bars

2. **Pie chart** (Core)
   - Goal: Add a pie chart showing the product type distribution using CSS
   - Hint: "Add a pie chart showing what percentage of sites use each product type (WordPress, Managed WordPress, Websites + Marketing). Use a CSS conic-gradient approach -- no library needed"
   - Outcome: A pie chart appears with 3 segments showing the product mix

3. **Make it interactive** (Stretch)
   - Goal: Add hover tooltips or click interactions to a chart
   - Hint: "Make the bar chart interactive -- show the exact CSAT score and site name when you hover over a bar. Use CSS :hover and a tooltip element"
   - Outcome: Hovering over chart elements reveals details
   - Pro tip: For production dashboards you'd use Chart.js or D3 -- but pure CSS charts are great for quick prototypes and keep this project dependency-free

### Level 8: Build a New View
*Theme: Create something that doesn't exist yet*

1. **Site detail panel** (Core)
   - Goal: When you click a site name in the table, show a detail panel with all of that site's information
   - Hint: "When I click a site name in the table, show a slide-out panel on the right with all details for that site including plugins, page views, and region"
   - Outcome: Clicking a site name opens a detail view showing fields not in the table

2. **Comparison mode** (Stretch)
   - Goal: Let users select two sites and see a side-by-side comparison
   - Hint: "Add checkboxes to each row and a 'Compare' button that shows a side-by-side comparison of the selected sites"
   - Outcome: Selecting two sites and clicking Compare shows their stats side-by-side

3. **Executive summary view** (Stretch)
   - Goal: Add a toggleable executive summary view within the existing page
   - Hint: "Add a 'Summary View' toggle button in the header. When clicked, hide the table and show an executive overview section with total sites, total revenue, average CSAT, and top/bottom performers. Clicking 'Table View' switches back."
   - Outcome: A toggle switches between the detailed table and a high-level executive view, all within the same page

4. **Build from a screenshot** (Stretch)
   - Goal: Take a screenshot of any UI you like (a competitor's dashboard, a Figma mock, a sketch on paper) and use it as an AI input to generate code
   - Hint: Take a screenshot and paste it into the AI chat. Then say: "Build me a component that looks like this screenshot. Use the same layout and visual style but populate it with data from sites.json."
   - Outcome: AI generates a new section or component that visually matches your reference image, wired to real data
   - Pro tip: This is one of the highest-leverage PM workflows -- go from a whiteboard sketch or Figma mock to a working prototype in minutes. Some PMs use this to estimate LOE by asking "how complex would this be to build?" after the AI generates the code.

### Level 9: Prototype Your Own Idea
*Theme: Apply vibe coding to your actual PM work*

1. **Identify a real problem** (Warm-up)
   - Goal: Think about a task from your PM workflow that you currently do manually or ask engineering for help with
   - Hint: No AI prompt needed -- just reflect. Examples: a prioritization scorecard, a competitive comparison table, a release checklist, a customer feedback tracker
   - Outcome: You have a concrete idea for something you want to build
   - Mark complete when: You can describe your idea in one sentence

2. **Write a mini-spec first** (Core)
   - Goal: Before prompting AI, write a short spec for your idea -- 3-5 bullet points covering what it does, what data it needs, and what the output looks like
   - Hint: Write something like: "Tool: Priority Scorecard. Purpose: Rank feature requests by impact and effort. Data: a list of features with name, impact score (1-5), effort score (1-5), and requestor. Output: a table sorted by impact/effort ratio with color-coded priority bands."
   - Outcome: You have a structured spec you can hand to AI instead of a vague description
   - Pro tip: PMs who write a spec before prompting get dramatically better first-pass output. It also becomes the acceptance criteria -- you can tell AI "this doesn't match the spec, the table should be sorted by ratio" instead of vague feedback. This is the same pattern as writing a PRD before handing work to engineering.

3. **Describe it to AI** (Core)
   - Goal: Open a new file or project and give AI your mini-spec from the previous exercise
   - Hint: Paste your spec into the chat and say: "Build this for me as a single HTML page with inline CSS and JS. Here's the spec: [your spec]."
   - Outcome: AI generates a first pass of your idea that you can see in the browser

3. **Iterate to a working prototype** (Stretch)
   - Goal: Go back and forth with AI, refining until you have something you could show a colleague
   - Hint: Keep giving feedback -- "make the table wider", "add a column for priority", "the colors don't look right, use a blue theme"
   - Outcome: You have a prototype that demonstrates your idea visually
   - Pro tip: Screenshot your prototype and share it in Slack -- it communicates ideas faster than a written spec

### Level 10: Ship It
*Theme: Learn the basics of version control*

> **Prerequisite:** These exercises assume you're working in a git repository. If `git status` returns an error, ask AI: "Help me initialize a git repository in this project and make an initial commit."

1. **Check your changes** (Warm-up)
   - Goal: Ask AI to explain what `git status` and `git diff` show you
   - Hint: "Run git status and git diff and explain what each section means"
   - Outcome: You understand which files you've changed and what the changes look like

2. **Create a branch** (Core)
   - Goal: Ask AI to create a new branch for your changes
   - Hint: "Create a new git branch called 'my-dashboard-changes' and explain why branches are useful"
   - Outcome: You're on a new branch with your changes, and you understand that branches let you experiment without affecting the original code

3. **Write a commit message** (Core)
   - Goal: Ask AI to help you stage and commit your work with a clear message
   - Hint: "Help me commit my changes with a clear commit message that describes what I changed and why"
   - Outcome: Your changes are committed with a descriptive message

4. **Understand PRs** (Stretch)
   - Goal: Ask AI to explain what a pull request is and when a PM might use one
   - Hint: "Explain what a pull request is, how it works, and give me an example of when a PM would create one vs. just prototyping locally"
   - Outcome: You understand PRs as a way to propose changes for review -- useful when your prototype is ready to become real code
   - Pro tip: Even if you never create a PR, understanding them helps you speak engineering's language in sprint planning

5. **Spot the security risk** (Stretch)
   - Goal: Ask AI to review your code for security issues, focusing on hardcoded values and exposed data
   - Hint: "Review my project for security risks. Are there any API keys, passwords, or sensitive data hardcoded in the source files? What should I never commit to git?"
   - Outcome: AI explains the concept of environment variables, .gitignore, and why you never put API keys or credentials in source code that gets committed
   - Pro tip: Nearly half of AI-generated code contains security flaws. The most common mistake is hardcoding credentials. When you build real prototypes that connect to APIs, always ask AI: "Is anything sensitive exposed in this code?"

6. **Write a handoff brief** (Stretch)
   - Goal: Ask AI to generate a handoff document that an engineer could use to understand your prototype
   - Hint: "Write a brief for an engineer explaining: what this prototype demonstrates, what decisions were made, what's a hack vs. what should be kept, and what needs real engineering to be production-ready."
   - Outcome: AI generates a structured handoff document that separates "proof of concept" from "production-ready" code
   - Pro tip: A working prototype with a clear handoff brief changes the PM-eng dynamic. Instead of writing a Jira ticket describing what you want, you're showing a working version and explaining what needs to be hardened. Engineers can evaluate the approach rather than interpret your requirements from scratch.

## Technical Implementation

### Files to create/modify
- `exercises.js` -- New file. Exercise data, panel rendering, localStorage logic, accordion behavior
- `style.css` -- Add styles for the exercise panel, cards, accordion, progress bar
- `index.html` -- Already has the panel markup and exercises.js script tag (from earlier work)

### Data structure (in exercises.js)
```js
const levels = [
  {
    id: 1,
    title: "Explore and Orient",
    theme: "Learn to ask your AI tool questions about code",
    exercises: [
      {
        id: "1-1",
        title: "What does this project do?",
        difficulty: "warm-up",
        goal: "Ask AI to explain the project structure...",
        hint: "Can you explain what this project does...",
        outcome: "You understand that index.html is the page...",
        proTip: null
      },
      // ...more exercises
    ]
  },
  // ...more levels
];
```

### localStorage schema
```js
{
  "vibe-exercises-progress": {
    "1-1": true,  // completed
    "1-2": false,
    // ...
  },
  "vibe-exercises-panel-open": true,
  "vibe-exercises-expanded-level": 1
}
```

### No external dependencies
Everything uses vanilla JS/CSS. No frameworks, no build-time exercise processing. Keeps it simple and avoids adding complexity PMs would need to install.
