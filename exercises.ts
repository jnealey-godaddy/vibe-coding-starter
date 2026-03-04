import { levels, TOTAL_EXERCISES, type Level, type Exercise, type SetupStep } from "./exercise-data";

// --- localStorage state ---

const STORAGE_KEYS = {
  PROGRESS: "vibe-exercises-progress",
  PANEL_OPEN: "vibe-exercises-panel-open",
  EXPANDED_LEVEL: "vibe-exercises-expanded-level",
} as const;

type ProgressMap = Record<string, boolean>;

function loadProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap): void {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

function loadPanelOpen(): boolean {
  return localStorage.getItem(STORAGE_KEYS.PANEL_OPEN) === "true";
}

function savePanelOpen(open: boolean): void {
  localStorage.setItem(STORAGE_KEYS.PANEL_OPEN, String(open));
}

function loadExpandedLevel(): number | null | undefined {
  const val = localStorage.getItem(STORAGE_KEYS.EXPANDED_LEVEL);
  if (val === null) return undefined; // never set
  if (val === "-1") return null; // user collapsed all
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function saveExpandedLevel(id: number | null): void {
  localStorage.setItem(STORAGE_KEYS.EXPANDED_LEVEL, String(id ?? -1));
}

function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.PANEL_OPEN);
  localStorage.removeItem(STORAGE_KEYS.EXPANDED_LEVEL);
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

// --- Module state ---

const state = {
  expandedLevel: null as number | null,
  progress: {} as ProgressMap,
};

// --- Rendering ---

function renderProgressBar(progress: ProgressMap): void {
  const completed = getCompletedCount(progress);
  const bar = document.getElementById("progress-bar");
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  if (fill) fill.style.width = `${(completed / TOTAL_EXERCISES) * 100}%`;
  if (text) text.textContent = `${completed} / ${TOTAL_EXERCISES} completed`;
  if (bar) bar.setAttribute("aria-valuenow", String(completed));
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

  // --- Header (always visible, clickable to expand) ---
  const header = document.createElement("div");
  header.className = "exercise-header";

  const checkWrap = document.createElement("div");
  checkWrap.className = "exercise-check";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.id = exercise.id;
  checkbox.checked = done;

  const title = document.createElement("span");
  title.className = "exercise-title";
  title.textContent = exercise.title;

  checkWrap.appendChild(checkbox);
  checkWrap.appendChild(title);

  const headerRight = document.createElement("div");
  headerRight.className = "exercise-header-right";

  const tag = document.createElement("span");
  tag.className = `difficulty-tag difficulty-${exercise.difficulty}`;
  tag.textContent = DIFFICULTY_LABELS[exercise.difficulty];

  const chevron = document.createElement("span");
  chevron.className = "exercise-chevron";
  chevron.textContent = "\u203A";

  headerRight.appendChild(tag);
  headerRight.appendChild(chevron);

  header.appendChild(checkWrap);
  header.appendChild(headerRight);

  // --- Body (hidden by default, shown on expand) ---
  const body = document.createElement("div");
  body.className = "exercise-body";

  const goalP = document.createElement("p");
  goalP.className = "exercise-goal";
  goalP.textContent = exercise.goal;
  body.appendChild(goalP);

  // Prompt block (hidden by default, toggled via details/summary)
  const promptSection = document.createElement("details");
  promptSection.className = "exercise-prompt";

  const promptLabel = document.createElement("summary");
  promptLabel.className = "exercise-prompt-label";
  promptLabel.textContent = "Try this prompt";

  const promptBlock = document.createElement("div");
  promptBlock.className = "exercise-prompt-block";

  const promptText = document.createElement("p");
  promptText.textContent = exercise.hint;

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-hint";
  copyBtn.type = "button";
  copyBtn.setAttribute("aria-label", "Copy prompt");
  copyBtn.textContent = "\u{1F4CB}";
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(exercise.hint).then(() => {
      copyBtn.textContent = "\u2713";
      copyBtn.classList.add("copied");
      copyBtn.setAttribute("aria-label", "Prompt copied");
      setTimeout(() => {
        copyBtn.textContent = "\u{1F4CB}";
        copyBtn.classList.remove("copied");
        copyBtn.setAttribute("aria-label", "Copy prompt");
      }, 1500);
    }).catch(() => {
      copyBtn.setAttribute("aria-label", "Copy failed");
    });
  });

  promptBlock.appendChild(promptText);
  promptBlock.appendChild(copyBtn);
  promptSection.appendChild(promptLabel);
  promptSection.appendChild(promptBlock);
  body.appendChild(promptSection);

  const outcomeDiv = document.createElement("div");
  outcomeDiv.className = "exercise-outcome";
  const outcomeLabel = document.createElement("span");
  outcomeLabel.className = "exercise-outcome-label";
  outcomeLabel.textContent = "\u2713 Expected outcome";
  const outcomeText = document.createElement("p");
  outcomeText.textContent = exercise.outcome;
  outcomeDiv.appendChild(outcomeLabel);
  outcomeDiv.appendChild(outcomeText);
  body.appendChild(outcomeDiv);

  if (exercise.proTip) {
    const tipDiv = document.createElement("div");
    tipDiv.className = "exercise-pro-tip";
    const tipLabel = document.createElement("span");
    tipLabel.className = "exercise-tip-label";
    tipLabel.textContent = "\u{1F4A1} Pro tip";
    const tipText = document.createElement("p");
    tipText.textContent = exercise.proTip;
    tipDiv.appendChild(tipLabel);
    tipDiv.appendChild(tipText);
    body.appendChild(tipDiv);
  }

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function createSetupCard(step: SetupStep, progress: ProgressMap): HTMLElement {
  const done = progress[step.id] || false;
  const card = document.createElement("div");
  card.className = `setup-card${done ? " completed" : ""}`;

  // --- Header ---
  const header = document.createElement("div");
  header.className = "setup-header";

  const checkWrap = document.createElement("div");
  checkWrap.className = "exercise-check";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.id = step.id;
  checkbox.checked = done;

  const title = document.createElement("span");
  title.className = "setup-title";
  title.textContent = step.title;

  checkWrap.appendChild(checkbox);
  checkWrap.appendChild(title);

  const chevron = document.createElement("span");
  chevron.className = "exercise-chevron";
  chevron.textContent = "\u203A";

  header.appendChild(checkWrap);
  header.appendChild(chevron);

  // --- Body ---
  const body = document.createElement("div");
  body.className = "setup-body";

  const instrDiv = document.createElement("div");
  instrDiv.className = "setup-instructions";
  const instrLabel = document.createElement("span");
  instrLabel.className = "setup-section-label";
  instrLabel.textContent = "What to do";
  const instrText = document.createElement("p");
  instrText.textContent = step.instructions;
  instrDiv.appendChild(instrLabel);
  instrDiv.appendChild(instrText);
  body.appendChild(instrDiv);

  const verifyDiv = document.createElement("div");
  verifyDiv.className = "setup-verify";
  const verifyLabel = document.createElement("span");
  verifyLabel.className = "setup-section-label verify-label";
  verifyLabel.textContent = "Verify it worked";
  const verifyText = document.createElement("p");
  verifyText.textContent = step.verify;
  verifyDiv.appendChild(verifyLabel);
  verifyDiv.appendChild(verifyText);
  body.appendChild(verifyDiv);

  if (step.proTip) {
    const tipDiv = document.createElement("div");
    tipDiv.className = "exercise-pro-tip";
    const tipLabel = document.createElement("span");
    tipLabel.className = "exercise-tip-label";
    tipLabel.textContent = "Pro tip";
    const tipText = document.createElement("p");
    tipText.textContent = step.proTip;
    tipDiv.appendChild(tipLabel);
    tipDiv.appendChild(tipText);
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

  const isSetup = level.type === "setup";

  const section = document.createElement("div");
  section.className = "level-section";
  if (isSetup) section.classList.add("setup");
  if (isExpanded) section.classList.add("expanded");
  if (allDone) section.classList.add("all-done");

  const headerBtn = document.createElement("button");
  headerBtn.className = "level-header";
  headerBtn.dataset.level = String(level.id);
  headerBtn.setAttribute("aria-expanded", String(isExpanded));

  const bodyId = `level-body-${level.id}`;
  headerBtn.setAttribute("aria-controls", bodyId);

  const info = document.createElement("div");
  info.className = "level-info";

  const num = document.createElement("span");
  num.className = `level-number${isSetup ? " setup-badge" : ""}`;
  num.textContent = allDone ? "\u2713" : isSetup ? "\u2699" : String(level.id);

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
  body.id = bodyId;
  if (level.type === "setup") {
    for (const step of level.exercises) {
      body.appendChild(createSetupCard(step, progress));
    }
  } else {
    for (const ex of level.exercises) {
      body.appendChild(createExerciseCard(ex, progress));
    }
  }

  section.appendChild(headerBtn);
  section.appendChild(body);
  return section;
}

function renderExerciseList(expandedLevelId: number | null, progress: ProgressMap): void {
  const container = document.getElementById("exercise-list");
  if (!container) return;
  container.replaceChildren(
    ...levels.map((level) => createLevelSection(level, progress, expandedLevelId))
  );
  renderProgressBar(progress);
}

function wrapPanelContent(panel: HTMLElement, toggleFn: () => void): void {
  if (panel.querySelector(".exercise-panel-inner")) return;

  // Remove the old header entirely
  const oldHeader = panel.querySelector(".exercise-panel-header");
  if (oldHeader) oldHeader.remove();

  const inner = document.createElement("div");
  inner.className = "exercise-panel-inner";

  // Compact topbar with title, progress, and close button
  const topbar = document.createElement("div");
  topbar.className = "exercise-panel-topbar";

  const topbarLeft = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.textContent = "Exercises";
  h2.tabIndex = -1;

  const progressBar = document.createElement("div");
  progressBar.id = "progress-bar";
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", String(TOTAL_EXERCISES));
  progressBar.setAttribute("aria-valuenow", "0");
  progressBar.setAttribute("aria-label", "Exercise completion");

  const progressFill = document.createElement("div");
  progressFill.id = "progress-fill";
  progressBar.appendChild(progressFill);

  const progressText = document.createElement("span");
  progressText.id = "progress-text";

  topbarLeft.appendChild(h2);
  topbarLeft.appendChild(progressBar);
  topbarLeft.appendChild(progressText);

  const topbarRight = document.createElement("div");
  topbarRight.className = "panel-topbar-actions";

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.className = "panel-fullscreen";
  fullscreenBtn.type = "button";
  fullscreenBtn.setAttribute("aria-label", "Toggle fullscreen");
  fullscreenBtn.textContent = "\u26F6";
  fullscreenBtn.addEventListener("click", () => {
    panel.classList.toggle("fullscreen");
    const isFs = panel.classList.contains("fullscreen");
    fullscreenBtn.textContent = isFs ? "\u2756" : "\u26F6";
    fullscreenBtn.setAttribute("aria-label", isFs ? "Exit fullscreen" : "Toggle fullscreen");
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "panel-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close exercises");
  closeBtn.textContent = "\u00D7";
  closeBtn.addEventListener("click", () => {
    if (panel.classList.contains("fullscreen")) {
      panel.classList.remove("fullscreen");
      fullscreenBtn.textContent = "\u26F6";
      fullscreenBtn.setAttribute("aria-label", "Toggle fullscreen");
    } else {
      toggleFn();
    }
  });

  topbarRight.appendChild(fullscreenBtn);
  topbarRight.appendChild(closeBtn);

  topbar.appendChild(topbarLeft);
  topbar.appendChild(topbarRight);

  const scrollArea = document.createElement("div");
  scrollArea.className = "exercise-panel-scroll";

  const exerciseList = panel.querySelector("#exercise-list");
  if (exerciseList) scrollArea.appendChild(exerciseList);

  inner.appendChild(topbar);
  inner.appendChild(scrollArea);
  panel.appendChild(inner);
}

function renderResetLink(scrollArea: HTMLElement): void {
  if (scrollArea.querySelector(".reset-progress")) return;

  const resetLink = document.createElement("button");
  resetLink.className = "reset-progress";
  resetLink.textContent = "Reset Progress";
  resetLink.addEventListener("click", () => {
    if (confirm("Reset all exercise progress? This cannot be undone.")) {
      resetAllProgress();
      state.progress = {};
      state.expandedLevel = findFirstIncompleteLevel(state.progress) ?? 1;
      renderExerciseList(state.expandedLevel, state.progress);
    }
  });
  scrollArea.appendChild(resetLink);
}

// --- Surgical checkbox update (avoids full re-render) ---

function updateCheckboxUI(checkbox: HTMLInputElement, progress: ProgressMap): void {
  const exerciseId = checkbox.dataset.id;
  if (!exerciseId) return;

  // Toggle card completed state
  const card = checkbox.closest(".exercise-card, .setup-card");
  if (card) card.classList.toggle("completed", checkbox.checked);

  // Update level progress count and all-done state
  const section = checkbox.closest(".level-section");
  if (section) {
    const headerBtn = section.querySelector(".level-header") as HTMLElement | null;
    const levelId = Number(headerBtn?.dataset.level);
    const level = levels.find((l) => l.id === levelId);
    if (level) {
      const count = getLevelCompletedCount(level, progress);
      const progressSpan = section.querySelector(".level-progress");
      if (progressSpan) progressSpan.textContent = `${count}/${level.exercises.length}`;
      const allDone = count === level.exercises.length;
      section.classList.toggle("all-done", allDone);
      const num = section.querySelector(".level-number");
      if (num) num.textContent = allDone ? "\u2713" : String(level.id);
    }
  }

  renderProgressBar(progress);
}

// --- Initialization ---

function init(): void {
  const toggleBtn = document.getElementById("toggle-exercises");
  const panel = document.getElementById("exercise-panel");
  if (!toggleBtn || !panel) return;

  // Toggle function shared by button and close icon
  const togglePanel = (): void => {
    const isOpen = panel.classList.toggle("open");
    savePanelOpen(isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      const heading = panel.querySelector("h2") as HTMLElement | null;
      heading?.focus();
    } else {
      toggleBtn.focus();
    }
  };

  // Wrap panel content with compact topbar and close button
  wrapPanelContent(panel, togglePanel);

  state.progress = loadProgress();

  // Auto-expand first incomplete level, or restore saved state
  const saved = loadExpandedLevel();
  if (saved === undefined) {
    // Never set -- auto-expand first incomplete level
    state.expandedLevel = findFirstIncompleteLevel(state.progress) ?? 1;
  } else {
    // Restored saved state (null = user collapsed all, number = specific level)
    state.expandedLevel = saved;
  }

  // Restore panel state
  const isPanelOpen = loadPanelOpen();
  toggleBtn.setAttribute("aria-expanded", String(isPanelOpen));
  toggleBtn.setAttribute("aria-controls", "exercise-panel");
  if (isPanelOpen) {
    panel.classList.add("open");
  }

  // Toggle panel from header button
  toggleBtn.addEventListener("click", togglePanel);

  // Escape key: exit fullscreen first, then close panel
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (panel.classList.contains("fullscreen")) {
        panel.classList.remove("fullscreen");
        const fsBtn = panel.querySelector(".panel-fullscreen");
        if (fsBtn) {
          fsBtn.textContent = "\u26F6";
          fsBtn.setAttribute("aria-label", "Toggle fullscreen");
        }
      } else if (panel.classList.contains("open")) {
        togglePanel();
      }
    }
  });

  // Render exercises and reset link
  renderExerciseList(state.expandedLevel, state.progress);
  const scrollArea = panel.querySelector(".exercise-panel-scroll") as HTMLElement;
  if (scrollArea) renderResetLink(scrollArea);

  // Delegate clicks for accordion and checkboxes
  const exerciseList = document.getElementById("exercise-list");
  if (!exerciseList) return;

  exerciseList.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // Accordion toggle
    const levelHeader = target.closest(".level-header") as HTMLElement | null;
    if (levelHeader && !target.closest("input")) {
      const levelId = Number(levelHeader.dataset.level);
      state.expandedLevel = state.expandedLevel === levelId ? null : levelId;
      saveExpandedLevel(state.expandedLevel);
      renderExerciseList(state.expandedLevel, state.progress);
      return;
    }

    // Card expand/collapse toggle
    const exerciseHeader = target.closest(".exercise-header, .setup-header") as HTMLElement | null;
    if (exerciseHeader && !target.closest("input")) {
      const card = exerciseHeader.closest(".exercise-card, .setup-card");
      if (card) card.classList.toggle("expanded");
      return;
    }

    // Checkbox toggle -- surgical update instead of full re-render
    const checkbox = target.closest('input[type="checkbox"]') as HTMLInputElement | null;
    if (checkbox && checkbox.dataset.id) {
      state.progress[checkbox.dataset.id] = checkbox.checked;
      saveProgress(state.progress);
      updateCheckboxUI(checkbox, state.progress);
    }
  });
}

init();
