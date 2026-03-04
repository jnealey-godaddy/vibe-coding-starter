# Level 0: Get Set Up -- Design

**Date:** 2026-03-03
**Status:** Approved

## Summary

Add a Level 0 ("Get Set Up") to the exercise panel with 8 exercises covering tool installation, GitHub access, and editor orientation. These are prerequisites that must be completed before Level 1 ("Explore and Orient") makes sense.

## Decisions

- **Numbering:** Level 0 with ids `0-1` through `0-8`. Existing levels 1-10 stay untouched.
- **Scope:** Single level with 3 logical groups (Install Tools, Set Up Access, Open and Run).
- **Editor focus:** Cursor-focused. VS Code + Claude Code mentioned only where relevant.
- **Platform:** Mac-primary. Windows alternatives in pro tips.
- **GoDaddy-specific:** None. Kept generic for reuse outside the company.
- **Difficulty:** All warm-up or core. No stretch -- setup is pass/fail.
- **Format:** Same exercise card format (goal, hint, outcome, proTip) as all other levels.

## Exercises

### Group 1: Install Your Tools

**0-1: Install Homebrew** (warm-up)
- Goal: Install the Mac package manager that makes everything else easier
- Hint: Open Terminal (Cmd+Space, type "Terminal") and paste: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- Outcome: Running `brew --version` in Terminal prints a version number
- Pro tip: Windows? Skip Homebrew -- you don't need it. You'll install Git and Node directly in the next steps. Use PowerShell or Windows Terminal instead of Terminal.

**0-2: Install Git** (warm-up)
- Goal: Get Git, the version control tool developers use to track changes
- Hint: Run `git --version` in Terminal. If it says "not found," run `xcode-select --install` and follow the prompts, then try again
- Outcome: `git --version` prints something like "git version 2.x.x"
- Pro tip: Windows? Download Git from git-scm.com. During install, accept the defaults. Then open PowerShell and run `git --version` to verify.

**0-3: Install Node.js** (warm-up)
- Goal: Install Node.js, which this project needs to run its dev server
- Hint: Run `brew install node` in Terminal, then verify with `node --version`
- Outcome: `node --version` prints something like "v20.x.x" or higher
- Pro tip: Windows? Download Node.js from nodejs.org (pick the LTS version). Run the installer, then open PowerShell and run `node --version` to verify.

### Group 2: Set Up Access

**0-4: Create a GitHub account** (warm-up)
- Goal: Sign up for GitHub, where code projects are stored and shared
- Hint: Go to github.com and sign up (or sign in if you already have an account). Verify your email address
- Outcome: You can visit github.com and see your profile page
- Pro tip: null

**0-5: Clone this project** (core)
- Goal: Download this starter project to your computer using Git
- Hint: In Terminal, run: `git clone [repo-url] vibe-coding-starter` then `cd vibe-coding-starter`. Replace [repo-url] with the URL your facilitator shared
- Outcome: Running `ls` in the vibe-coding-starter folder shows files like index.html, main.ts, and style.css
- Pro tip: "clone" means "download a copy." The folder on your computer is now a full copy of the project that you can change without affecting anyone else. Windows? Use PowerShell instead of Terminal. The commands are the same. Use `dir` instead of `ls` if `ls` doesn't work.

### Group 3: Open and Run

**0-6: Install Cursor** (warm-up)
- Goal: Download and install Cursor, your AI-powered code editor
- Hint: Go to cursor.com, download for your operating system, install it, and open it. When prompted, you can sign in or skip for now
- Outcome: Cursor opens and you see a welcome screen or an empty editor
- Pro tip: Cursor is built on VS Code, so if you've used VS Code before, everything will feel familiar

**0-7: Open the project in Cursor** (core)
- Goal: Open the starter project folder in Cursor so the AI has full context
- Hint: In Cursor, go to File > Open Folder and select the vibe-coding-starter folder you cloned. You should see the file tree on the left
- Outcome: The left sidebar shows index.html, main.ts, style.css, data/, and other project files
- Pro tip: Opening a folder (not a single file) is key -- it gives the AI context about the entire project, not just one file

**0-8: Start the dev server and see the dashboard** (core)
- Goal: Run the project and see it in your browser
- Hint: Open Cursor's built-in terminal (Ctrl+` or View > Terminal), then run `npm install` followed by `npm start`. Click the URL that appears (usually http://localhost:5173)
- Outcome: Your browser opens a "Site Dashboard" page showing summary cards and a table of mock customer sites
- Pro tip: The dev server watches for changes -- when you edit a file and save, the browser updates automatically. This is the magic of vibe coding: change, save, see

## Implementation

Only file that needs to change: `exercise-data.ts`. Add the Level 0 object at the beginning of the `levels` array. The `TOTAL_EXERCISES` count updates automatically. The exercise panel rendering already handles any number of levels with any id.
