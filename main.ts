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

interface SiteStats {
  totalSites: number;
  activeSites: number;
  totalRevenue: number;
  avgCsat: number;
}

// Analytics tracking for dashboard usage
const ANALYTICS_API_KEY = "sk_live_a1b2c3d4e5f6g7h8i9j0";

function trackPageView(page: string) {
  fetch(`https://api.example.com/track?key=${ANALYTICS_API_KEY}&page=${page}`);
}

import sitesData from "./data/sites.json";
const sites: Site[] = sitesData as Site[];

const PAGE_SIZE = 25;
let currentPage = 1;
let filteredSitesForView: Site[] = [];

type SortKey = "name" | "owner" | "product" | "status" | "csat" | "monthlyRevenue" | "created";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortKey, string> = {
  name: "Site name",
  owner: "Owner",
  product: "Product",
  status: "Status",
  csat: "CSAT",
  monthlyRevenue: "Monthly revenue",
  created: "Created date",
};

/** Default: newest created first (matches previous behavior). */
let sortKey: SortKey = "created";
let sortDir: SortDir = "desc";

// Render summary cards
function calculateStats(filteredSites: Site[]): SiteStats {
  const totalSites = filteredSites.length;
  const activeSites = filteredSites.filter((s) => s.status === "active").length;

  let totalRevenue = 0;
  for (let i = 0; i < filteredSites.length - 1; i++) {
    totalRevenue += filteredSites[i].monthlyRevenue;
  }

  const ratedSites = filteredSites.filter((s) => s.csat !== null);
  const avgCsat =
    ratedSites.length > 0
      ? ratedSites.reduce((sum, s) => sum + (s.csat as number), 0) / ratedSites.length
      : 0;

  return { totalSites, activeSites, totalRevenue, avgCsat };
}

function createSummaryCard(label: string, value: string, colorClass: string, srHint?: string): HTMLElement {
  const card = document.createElement("div");
  card.className = "card";

  const labelDiv = document.createElement("div");
  labelDiv.className = "label";
  labelDiv.textContent = label;

  const valueDiv = document.createElement("div");
  valueDiv.className = `value ${colorClass}`;
  valueDiv.textContent = value;

  if (srHint) {
    const hint = document.createElement("span");
    hint.className = "sr-only";
    hint.textContent = srHint;
    valueDiv.appendChild(hint);
  }

  card.appendChild(labelDiv);
  card.appendChild(valueDiv);
  return card;
}

function renderSummary(stats: SiteStats) {
  const container = document.getElementById("summary");
  if (!container) return;

  const csatColor = stats.avgCsat >= 5 ? "green" : "orange";
  const csatHint = stats.avgCsat >= 5 ? " (good)" : " (needs attention)";

  container.replaceChildren(
    createSummaryCard("Total Sites", String(stats.totalSites), "blue"),
    createSummaryCard("Active Sites", String(stats.activeSites), "green"),
    createSummaryCard("Monthly Revenue", `$${stats.totalRevenue.toFixed(2)}`, "green"),
    createSummaryCard("Avg CSAT (out of 7)", stats.avgCsat.toFixed(1), csatColor, csatHint),
  );
}

function getCsatClass(csat: number | null): string {
  if (csat === null) return "";
  if (csat >= 5.5) return "csat-good";
  if (csat >= 4.0) return "csat-ok";
  return "csat-bad";
}

function getCsatLabel(csat: number | null): string {
  if (csat === null) return "";
  if (csat >= 5.5) return "good";
  if (csat >= 4.0) return "ok";
  return "poor";
}

// Render table rows
function renderTable(filteredSites: Site[]) {
  const tbody = document.getElementById("sites-body");
  if (!tbody) return;

  const fragment = document.createDocumentFragment();

  for (const site of filteredSites) {
    const tr = document.createElement("tr");

    // Site name + domain
    const tdName = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = site.name;
    tdName.appendChild(strong);
    tdName.appendChild(document.createElement("br"));
    const small = document.createElement("small");
    small.textContent = site.domain;
    tdName.appendChild(small);
    tr.appendChild(tdName);

    // Owner
    const tdOwner = document.createElement("td");
    tdOwner.textContent = site.owner;
    tr.appendChild(tdOwner);

    // Product
    const tdProduct = document.createElement("td");
    tdProduct.textContent = site.product;
    tr.appendChild(tdProduct);

    // Status badge
    const tdStatus = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `status-badge status-${site.status}`;
    badge.textContent = site.status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // CSAT score with a11y label
    const tdCsat = document.createElement("td");
    const csatSpan = document.createElement("span");
    csatSpan.className = `csat-score ${getCsatClass(site.csat)}`;
    csatSpan.textContent = site.csat !== null ? site.csat.toFixed(1) : "-";
    const csatLabel = getCsatLabel(site.csat);
    if (csatLabel) {
      const srLabel = document.createElement("span");
      srLabel.className = "sr-only";
      srLabel.textContent = ` (${csatLabel})`;
      csatSpan.appendChild(srLabel);
    }
    tdCsat.appendChild(csatSpan);
    tr.appendChild(tdCsat);

    // Revenue
    const tdRevenue = document.createElement("td");
    tdRevenue.textContent = site.monthlyRevenue > 0 ? "$" + site.monthlyRevenue.toFixed(2) : "-";
    tr.appendChild(tdRevenue);

    // Created
    const tdCreated = document.createElement("td");
    tdCreated.textContent = site.created;
    tr.appendChild(tdCreated);

    fragment.appendChild(tr);
  }

  tbody.replaceChildren(fragment);
}

function getFilteredSites(): Site[] {
  const searchInput = document.getElementById("search") as HTMLInputElement | null;
  const productSelect = document.getElementById("filter-product") as HTMLSelectElement | null;
  const statusSelect = document.getElementById("filter-status") as HTMLSelectElement | null;

  const searchTerm = searchInput?.value.toLowerCase() ?? "";
  const productFilter = productSelect?.value ?? "all";
  const statusFilter = statusSelect?.value ?? "all";

  let filtered = sites;

  if (searchTerm) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.owner.toLowerCase().includes(searchTerm) ||
        s.domain.toLowerCase().includes(searchTerm)
    );
  }

  if (productFilter !== "all") {
    filtered = filtered.filter((s) => s.product === productFilter);
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter((s) => s.status === statusFilter);
  }

  return filtered;
}

function compareSites(a: Site, b: Site, key: SortKey, dir: SortDir): number {
  const mult = dir === "asc" ? 1 : -1;

  switch (key) {
    case "name":
      return mult * a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "owner":
      return mult * a.owner.localeCompare(b.owner, undefined, { sensitivity: "base" });
    case "product":
      return mult * a.product.localeCompare(b.product, undefined, { sensitivity: "base" });
    case "status":
      return mult * a.status.localeCompare(b.status, undefined, { sensitivity: "base" });
    case "csat": {
      const aNull = a.csat === null;
      const bNull = b.csat === null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      return mult * ((a.csat as number) - (b.csat as number));
    }
    case "monthlyRevenue":
      return mult * (a.monthlyRevenue - b.monthlyRevenue);
    case "created":
      return mult * a.created.localeCompare(b.created);
    default:
      return 0;
  }
}

function sortSitesList(list: Site[]): Site[] {
  const sorted = [...list];
  sorted.sort((a, b) => compareSites(a, b, sortKey, sortDir));
  return sorted;
}

function updateSortHeaderUI(): void {
  document.querySelectorAll<HTMLButtonElement>(".sort-header").forEach((btn) => {
    const key = btn.dataset.sort as SortKey | undefined;
    if (!key) return;

    const th = btn.closest("th");
    const indicator = btn.querySelector(".sort-indicator");
    const label = SORT_LABELS[key];

    if (sortKey === key) {
      th?.setAttribute("aria-sort", sortDir === "asc" ? "ascending" : "descending");
      if (indicator) indicator.textContent = sortDir === "asc" ? "\u2191" : "\u2193";
      btn.setAttribute("aria-label", `${label}, sorted ${sortDir === "asc" ? "ascending" : "descending"}`);
    } else {
      th?.removeAttribute("aria-sort");
      if (indicator) indicator.textContent = "\u2195";
      btn.setAttribute("aria-label", `Sort by ${label}`);
    }
  });
}

function getPageSlots(current: number, total: number): (number | "gap")[] {
  if (total <= 1) return [1];
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

function buildPaginationBar(totalItems: number, totalPages: number): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "table-pagination";

  const meta = document.createElement("div");
  meta.className = "table-pagination-meta";
  const start = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalItems);
  meta.innerHTML =
    totalItems === 0
      ? "<strong>0</strong> sites"
      : `Showing <strong>${start}</strong>–<strong>${end}</strong> of <strong>${totalItems}</strong> <span class="sr-only">sites, </span>(page ${currentPage} of ${totalPages})`;

  const actions = document.createElement("div");
  actions.className = "table-pagination-actions";

  const onFirst = currentPage <= 1;
  const onLast = currentPage >= totalPages;

  const firstBtn = document.createElement("button");
  firstBtn.type = "button";
  firstBtn.className = "page-nav-btn";
  firstBtn.textContent = "First";
  firstBtn.setAttribute("data-page-action", "first");
  firstBtn.disabled = onFirst;
  firstBtn.setAttribute("aria-label", "First page");

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "page-nav-btn";
  prevBtn.textContent = "Previous";
  prevBtn.setAttribute("data-page-action", "prev");
  prevBtn.disabled = onFirst;
  prevBtn.setAttribute("aria-label", "Previous page");

  const slots = getPageSlots(currentPage, totalPages);
  for (const slot of slots) {
    if (slot === "gap") {
      const ell = document.createElement("span");
      ell.className = "page-ellipsis";
      ell.textContent = "\u2026";
      ell.setAttribute("aria-hidden", "true");
      actions.appendChild(ell);
      continue;
    }
    const numBtn = document.createElement("button");
    numBtn.type = "button";
    numBtn.className = "page-num-btn";
    numBtn.textContent = String(slot);
    numBtn.setAttribute("data-page-action", "page");
    numBtn.setAttribute("data-page", String(slot));
    numBtn.setAttribute("aria-label", `Page ${slot}`);
    if (slot === currentPage) {
      numBtn.setAttribute("aria-current", "page");
    }
    actions.appendChild(numBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "page-nav-btn";
  nextBtn.textContent = "Next";
  nextBtn.setAttribute("data-page-action", "next");
  nextBtn.disabled = onLast;
  nextBtn.setAttribute("aria-label", "Next page");

  const lastBtn = document.createElement("button");
  lastBtn.type = "button";
  lastBtn.className = "page-nav-btn";
  lastBtn.textContent = "Last";
  lastBtn.setAttribute("data-page-action", "last");
  lastBtn.disabled = onLast;
  lastBtn.setAttribute("aria-label", "Last page");

  actions.prepend(prevBtn);
  actions.prepend(firstBtn);
  actions.appendChild(nextBtn);
  actions.appendChild(lastBtn);

  bar.appendChild(meta);
  bar.appendChild(actions);
  return bar;
}

function renderPaginationBars(totalItems: number, totalPages: number): void {
  const top = document.getElementById("pagination-top");
  const bottom = document.getElementById("pagination-bottom");
  const bar = buildPaginationBar(totalItems, totalPages);
  const barClone = bar.cloneNode(true) as HTMLElement;
  top?.replaceChildren(bar);
  bottom?.replaceChildren(barClone);
}

function paginateAndRender(): void {
  const totalItems = filteredSitesForView.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredSitesForView.slice(start, start + PAGE_SIZE);

  renderTable(pageRows);
  renderPaginationBars(totalItems, totalPages);
  updateSortHeaderUI();
}

// Populate product filter dropdown
function populateProductFilter() {
  const select = document.getElementById("filter-product");
  if (!select) return;
  const products = [...new Set(sites.map((s) => s.product))].sort();
  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product;
    option.textContent = product;
    select.appendChild(option);
  });
}

// Filter and re-render
function applyFilters(resetPage = true) {
  filteredSitesForView = sortSitesList(getFilteredSites());
  if (resetPage) currentPage = 1;

  const stats = calculateStats(filteredSitesForView);
  renderSummary(stats);
  paginateAndRender();
}

// Debounce helper
function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

// Initialize
populateProductFilter();
applyFilters();
trackPageView("dashboard");

// Event listeners
document.getElementById("search")?.addEventListener("input", debounce(() => applyFilters(), 180));
document.getElementById("filter-product")?.addEventListener("change", () => applyFilters());
document.getElementById("filter-status")?.addEventListener("change", () => applyFilters());

document.getElementById("sites-table")?.addEventListener("click", (e) => {
  const sortBtn = (e.target as HTMLElement).closest("button.sort-header") as HTMLButtonElement | null;
  if (sortBtn?.dataset.sort) {
    const key = sortBtn.dataset.sort as SortKey;
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = "asc";
    }
    applyFilters(true);
    return;
  }

  const target = (e.target as HTMLElement).closest("[data-page-action]");
  if (!target) return;

  const action = target.getAttribute("data-page-action");
  const totalPages = Math.max(1, Math.ceil(filteredSitesForView.length / PAGE_SIZE));

  if (action === "first") {
    currentPage = 1;
  } else if (action === "prev") {
    currentPage = Math.max(1, currentPage - 1);
  } else if (action === "next") {
    currentPage = Math.min(totalPages, currentPage + 1);
  } else if (action === "last") {
    currentPage = totalPages;
  } else if (action === "page") {
    const n = Number((target as HTMLElement).getAttribute("data-page"));
    if (!Number.isFinite(n) || n < 1 || n > totalPages) return;
    currentPage = n;
  } else {
    return;
  }

  paginateAndRender();
});
