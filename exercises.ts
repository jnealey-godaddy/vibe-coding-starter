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

  const hintWrap = document.createElement("div");
  hintWrap.className = "hint-content";

  const hintP = document.createElement("p");
  hintP.textContent = exercise.hint;

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-hint";
  copyBtn.type = "button";
  copyBtn.title = "Copy prompt";
  copyBtn.textContent = "\u{1F4CB}";
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(exercise.hint).then(() => {
      copyBtn.textContent = "\u2713";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "\u{1F4CB}";
        copyBtn.classList.remove("copied");
      }, 1500);
    });
  });

  hintWrap.appendChild(hintP);
  hintWrap.appendChild(copyBtn);
  details.appendChild(summary);
  details.appendChild(hintWrap);
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
