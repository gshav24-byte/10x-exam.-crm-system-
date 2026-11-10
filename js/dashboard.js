// js/dashboard.js

let allDashboardClients = [];
let pagination = { currentPage: 1, itemsPerPage: 5 };

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  setupDashboardEvents();
});

async function initDashboard() {
  setupWelcomeAndClock();

  let clients = JSON.parse(localStorage.getItem("crm_clients"));
  if (!clients || clients.length === 0) {
    clients = await fetchClientsInitial();
  }

  allDashboardClients = clients;

  renderDashboardStats(allDashboardClients);
  renderPipelineOverview(allDashboardClients);
  renderPaginatedClients();
}

function setupWelcomeAndClock() {
  const user = getCurrentUser();
  if (user) {
    const firstName = user.fullName.split(" ")[0];
    document.getElementById("welcome-message").innerText =
      `Welcome back, ${firstName}!`;
  }

  const clockEl = document.getElementById("live-clock");
  const updateClock = () => {
    const now = new Date();
    clockEl.innerText = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function renderDashboardStats(clients) {
  const total = clients.length;
  const activeDeals = clients.filter(
    (c) => c.status !== "Won" && c.status !== "Lost",
  ).length;

  const wonRevenueSum = clients
    .filter((c) => c.status === "Won")
    .reduce((sum, c) => sum + Number(c.dealValue || 0), 0);

  const now = Date.now();
  const newThisWeek = clients.filter(
    (c) => (now - new Date(c.createdAt).getTime()) / 86400000 <= 7,
  ).length;

  document.getElementById("stat-total").innerText = total;
  document.getElementById("stat-active-deals").innerText = activeDeals;
  document.getElementById("stat-won-revenue").innerText =
    `$${wonRevenueSum.toLocaleString()}`;
  document.getElementById("stat-new-this-week").innerText = newThisWeek;
}

function renderPipelineOverview(clients) {
  document.getElementById("pipe-lead").innerText = clients.filter(
    (c) => c.status === "Lead",
  ).length;
  document.getElementById("pipe-contacted").innerText = clients.filter(
    (c) => c.status === "Contacted",
  ).length;
  document.getElementById("pipe-won").innerText = clients.filter(
    (c) => c.status === "Won",
  ).length;
  document.getElementById("pipe-lost").innerText = clients.filter(
    (c) => c.status === "Lost",
  ).length;
}

/**
 * კლიენტების სიის რენდერი პაგინაციით (გვერდები 1, 2...)
 */
function renderPaginatedClients() {
  const tbody = document.getElementById("recent-clients-tbody");
  tbody.innerHTML = "";

  const sortedClients = [...allDashboardClients].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const totalItems = sortedClients.length;
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;

  if (pagination.currentPage > totalPages) {
    pagination.currentPage = totalPages;
  }

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginated = sortedClients.slice(startIndex, endIndex);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No clients found</td></tr>`;
    renderPaginationControls(0, 0);
    return;
  }

  paginated.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${escapeHTML(c.name)}</strong><br><span class="text-small text-muted">${escapeHTML(c.email)}</span></td>
            <td>${escapeHTML(c.company)}</td>
            <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        `;
    tbody.appendChild(tr);
  });

  renderPaginationControls(totalItems, totalPages);
}

/**
 * პაგინაციის ღილაკების მართვა
 */
function renderPaginationControls(totalItems, totalPages) {
  const infoText = document.getElementById("pagination-info");
  const prevBtn = document.getElementById("prev-page-btn");
  const nextBtn = document.getElementById("next-page-btn");
  const pageNumbersContainer = document.getElementById("page-numbers");

  const start =
    totalItems === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const end = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    totalItems,
  );

  infoText.innerText = `გამოჩენილია ${start}-${end} / ${totalItems}-დან`;

  prevBtn.disabled = pagination.currentPage === 1 || totalPages === 0;
  nextBtn.disabled = pagination.currentPage === totalPages || totalPages === 0;

  pageNumbersContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `btn-page ${i === pagination.currentPage ? "active" : ""}`;
    pageBtn.innerText = i;
    pageBtn.addEventListener("click", () => {
      pagination.currentPage = i;
      renderPaginatedClients();
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
}

/**
 * CSV ექსპორტი (UTF-8 BOM ქართული ტექსტისა და Excel-ისთვის)
 */
function exportToCSV() {
  if (allDashboardClients.length === 0) {
    showToast("ექსპორტისთვის მონაცემები არ არის", "error");
    return;
  }

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Status",
    "DealValue",
    "CreatedAt",
  ];
  const rows = allDashboardClients.map((c) => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.email}"`,
    `"${c.phone || ""}"`,
    `"${c.company.replace(/"/g, '""')}"`,
    `"${c.status}"`,
    `"${c.dealValue || 0}"`,
    `"${c.createdAt}"`,
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `crm_clients_export_${Date.now()}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV ფაილი წარმატებით ჩამოიქვირთა", "success");
}

/**
 * ბაზის აღდგენა (Reset Data)
 */
async function resetData() {
  if (
    !confirm(
      "ნამდვილად გსურთ ბაზის საწყის მდგომარეობაში დაბრუნება? ყველა ცვლილება წაიშლება.",
    )
  )
    return;

  localStorage.removeItem("crm_clients");
  const freshClients = await fetchClientsInitial();
  allDashboardClients = freshClients;

  renderDashboardStats(allDashboardClients);
  renderPipelineOverview(allDashboardClients);
  pagination.currentPage = 1;
  renderPaginatedClients();

  showToast("ბაზა წარმატებით განახლდა საწყის მონაცემებზე", "success");
}

function setupDashboardEvents() {
  document
    .getElementById("export-csv-btn")
    .addEventListener("click", exportToCSV);
  document
    .getElementById("reset-data-btn")
    .addEventListener("click", resetData);

  document.getElementById("prev-page-btn").addEventListener("click", () => {
    if (pagination.currentPage > 1) {
      pagination.currentPage--;
      renderPaginatedClients();
    }
  });

  document.getElementById("next-page-btn").addEventListener("click", () => {
    pagination.currentPage++;
    renderPaginatedClients();
  });
}

async function fetchClientsInitial() {
  try {
    const res = await fetch("https://dummyjson.com/users?limit=30");
    const data = await res.json();
    const mapped = data.users.map((u, i) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email.toLowerCase(),
      phone: u.phone,
      company: u.company ? u.company.name : "N/A",
      image: u.image,
      status:
        i % 4 === 0
          ? "Won"
          : i % 3 === 0
            ? "Contacted"
            : i % 5 === 0
              ? "Lost"
              : "Lead",
      dealValue: (i + 1) * 1500,
      notes: [],
      createdAt: new Date(Date.now() - i * 3600000 * 12).toISOString(),
    }));
    localStorage.setItem("crm_clients", JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    return [];
  }
}

function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container") || document.body;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
