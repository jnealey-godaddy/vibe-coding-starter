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
    createSummaryCard("sites", String(stats.totalSites), "blue"),
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
function applyFilters() {
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

  const stats = calculateStats(filtered);
  renderSummary(stats);
  renderTable(filtered);
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
document.getElementById("search")?.addEventListener("input", debounce(applyFilters, 180));
document.getElementById("filter-product")?.addEventListener("change", applyFilters);
document.getElementById("filter-status")?.addEventListener("change", applyFilters);
