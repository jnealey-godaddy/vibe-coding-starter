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

import sitesData from "./data/sites.json";
const sites: Site[] = sitesData as Site[];

// Render summary cards
function calculateStats(filteredSites: Site[]) {
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

function renderSummary(stats: ReturnType<typeof calculateStats>) {
  const container = document.getElementById("summary");
  if (!container) return;
  container.innerHTML = `
    <div class="card">
      <div class="label">Total Sites</div>
      <div class="value blue">${stats.totalSites}</div>
    </div>
    <div class="card">
      <div class="label">Active Sites</div>
      <div class="value green">${stats.activeSites}</div>
    </div>
    <div class="card">
      <div class="label">Monthly Revenue</div>
      <div class="value green">$${stats.totalRevenue.toFixed(2)}</div>
    </div>
    <div class="card">
      <div class="label">Avg CSAT (out of 7)</div>
      <div class="value ${stats.avgCsat >= 5 ? "green" : "orange"}">${stats.avgCsat.toFixed(1)}</div>
    </div>
  `;
}

// Render table rows
function renderTable(filteredSites: Site[]) {
  const tbody = document.getElementById("sites-body");
  if (!tbody) return;
  tbody.innerHTML = filteredSites
    .map(
      (site) => `
    <tr>
      <td><strong>${site.name}</strong><br><small>${site.domain}</small></td>
      <td>${site.owner}</td>
      <td>${site.product}</td>
      <td><span class="status-badge status-${site.status}">${site.status}</span></td>
      <td><span class="csat-score ${getCsatClass(site.csat)}">${site.csat !== null ? site.csat.toFixed(1) : "-"}</span></td>
      <td>${site.monthlyRevenue > 0 ? "$" + site.monthlyRevenue.toFixed(2) : "-"}</td>
      <td>${site.created}</td>
    </tr>
  `
    )
    .join("");
}

function getCsatClass(csat: number | null): string {
  if (csat === null) return "";
  if (csat >= 5.5) return "csat-good";
  if (csat >= 4.0) return "csat-ok";
  return "csat-bad";
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

// Initialize
populateProductFilter();
applyFilters();

// Event listeners
document.getElementById("search")?.addEventListener("input", applyFilters);
document.getElementById("filter-product")?.addEventListener("change", applyFilters);
document.getElementById("filter-status")?.addEventListener("change", applyFilters);
