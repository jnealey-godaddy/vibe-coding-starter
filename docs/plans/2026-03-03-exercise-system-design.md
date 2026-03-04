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
- **Scope:** 10 levels, 3-5 exercises each, ~40 exercises total

## UI Architecture

### Exercise Panel (sidebar)
- Fixed right sidebar, 400px wide
- Toggled via "Exercises" button in header
- When open, main dashboard content shifts left
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
- Text: "X / 40 completed"
- State persisted in localStorage key `vibe-exercises-progress`

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
   - Goal: Add a bar chart showing CSAT scores by site
   - Hint: "Add a horizontal bar chart below the table showing CSAT scores for each site. You can use plain HTML/CSS or a library like Chart.js"
   - Outcome: A bar chart appears with each site's CSAT score visualized

2. **Pie chart** (Core)
   - Goal: Add a pie chart showing the product type distribution
   - Hint: "Add a pie chart showing what percentage of sites use each product type (WordPress, Managed WordPress, Websites + Marketing)"
   - Outcome: A pie chart appears with 3 segments showing the product mix

3. **Make it interactive** (Stretch)
   - Goal: Add hover tooltips or click interactions to a chart
   - Hint: "Make the bar chart interactive -- show the exact CSAT score and site name when you hover over a bar"
   - Outcome: Hovering over chart elements reveals details
   - Pro tip: Interactive visualizations are great for stakeholder presentations -- you can prototype them in minutes with AI

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

3. **Executive summary page** (Stretch)
   - Goal: Create a separate page with high-level metrics and navigation back to the table
   - Hint: "Create a new page called summary.html with a high-level executive overview: total sites, total revenue, average CSAT, top/bottom performers, and a link back to the main dashboard"
   - Outcome: A new page exists with an executive-friendly view of the portfolio

### Level 9: Prototype Your Own Idea
*Theme: Apply vibe coding to your actual PM work*

1. **Identify a real problem** (Warm-up)
   - Goal: Think about a task from your PM workflow that you currently do manually or ask engineering for help with
   - Hint: No AI prompt needed -- just reflect. Examples: a prioritization scorecard, a competitive comparison table, a release checklist, a customer feedback tracker
   - Outcome: You have a concrete idea for something you want to build

2. **Describe it to AI** (Core)
   - Goal: Open a new file or project and describe what you want to build in plain English
   - Hint: "I want to build a [description]. It should have [features]. The data looks like [description]. Can you help me build this?"
   - Outcome: AI generates a first pass of your idea that you can see in the browser

3. **Iterate to a working prototype** (Stretch)
   - Goal: Go back and forth with AI, refining until you have something you could show a colleague
   - Hint: Keep giving feedback -- "make the table wider", "add a column for priority", "the colors don't look right, use a blue theme"
   - Outcome: You have a prototype that demonstrates your idea visually
   - Pro tip: Screenshot your prototype and share it in Slack -- it communicates ideas faster than a written spec

### Level 10: Ship It
*Theme: Learn the basics of version control*

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
