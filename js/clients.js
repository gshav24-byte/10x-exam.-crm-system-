// js/clients.js

let allClients = [];
let currentFilterStatus = "All";
let currentSearch = "";
let currentSort = "newest";
let selectedClientForDetails = null;

document.addEventListener("DOMContentLoaded", () => {
  initClientsPage();
  setupClientsEventListeners();
});

async function initClientsPage() {
  const listContainer = document.getElementById("clients-list-container");
  listContainer.innerHTML = `<div class="loading-state">Loading clients...</div>`;

  try {
    let stored = JSON.parse(localStorage.getItem("crm_clients"));
    if (!stored || stored.length === 0) {
      stored = await fetchClientsFromDummyJSON();
    }
    allClients = stored;
    renderVisibleClients();
  } catch (error) {
    listContainer.innerHTML = `
            <div class="error-state text-center">
                <p>Could not load clients. Check your connection and try again.</p>
                <button onclick="initClientsPage()" class="btn btn-secondary margin-top-10">Retry</button>
            </div>`;
  }
}

async function fetchClientsFromDummyJSON() {
  const res = await fetch("https://dummyjson.com/users?limit=30");
  if (!res.ok) throw new Error("API Error");
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
  saveState();
  return mapped;
}

function getVisibleClients() {
  let result = [...allClients];

  if (currentFilterStatus !== "All") {
    result = result.filter((c) => c.status === currentFilterStatus);
  }

  if (currentSearch) {
    const query = currentSearch.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query),
    );
  }

  if (currentSort === "newest") {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === "name_asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "deal_desc") {
    result.sort((a, b) => Number(b.dealValue) - Number(a.dealValue));
  }

  return result;
}

function renderVisibleClients() {
  const visible = getVisibleClients();
  const container = document.getElementById("clients-list-container");
  container.innerHTML = "";

  if (visible.length === 0) {
    container.innerHTML = `<div class="text-center text-muted" style="grid-column: 1/-1; padding: 40px;">No clients found.</div>`;
    return;
  }

  visible.forEach((client) => {
    const card = document.createElement("div");
    card.className = "client-card";
    card.setAttribute("data-id", client.id);

    card.innerHTML = `
            <div class="client-card-header">
                <img src="${client.image || "https://dummyjson.com/icon/emilys/128"}" class="avatar-img" alt="Avatar">
                <div>
                    <strong>${escapeHTML(client.name)}</strong>
                    <p class="text-small text-muted">${escapeHTML(client.company)} • ${escapeHTML(client.email)}</p>
                    <p class="text-small"><strong>$${Number(client.dealValue).toLocaleString()}</strong></p>
                </div>
            </div>
            <div class="client-card-footer">
                <select class="status-select-inline" data-id="${client.id}">
                    <option value="Lead" ${client.status === "Lead" ? "selected" : ""}>Lead</option>
                    <option value="Contacted" ${client.status === "Contacted" ? "selected" : ""}>Contacted</option>
                    <option value="Won" ${client.status === "Won" ? "selected" : ""}>Won</option>
                    <option value="Lost" ${client.status === "Lost" ? "selected" : ""}>Lost</option>
                </select>
                <button class="btn btn-danger btn-small delete-btn" data-id="${client.id}">Delete</button>
            </div>
        `;

    card.addEventListener("click", (e) => {
      if (
        e.target.tagName === "SELECT" ||
        e.target.classList.contains("delete-btn")
      )
        return;
      openDetailsModal(client.id);
    });

    container.appendChild(card);
  });

  // Event Listeners for Inline Status Select & Delete
  document.querySelectorAll(".status-select-inline").forEach((select) => {
    select.addEventListener("change", (e) => {
      const id = Number(e.target.getAttribute("data-id"));
      const newStatus = e.target.value;
      const client = allClients.find((c) => c.id === id);
      if (client) {
        client.status = newStatus;
        saveState();
        renderVisibleClients();
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(e.target.getAttribute("data-id"));
      deleteClient(id);
    });
  });
}

async function deleteClient(id) {
  if (!confirm("Delete this client? This cannot be undone.")) return;

  try {
    await fetch(`https://dummyjson.com/users/${id}`, { method: "DELETE" });
  } catch (e) {
    // Handle 404 gracefully
  }

  allClients = allClients.filter((c) => c.id !== id);
  saveState();
  renderVisibleClients();
  showToast("Client deleted", "success");
}

function setupClientsEventListeners() {
  // Search
  document.getElementById("search-input").addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    renderVisibleClients();
  });

  // Chips
  document.getElementById("filter-chips").addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
      document
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("active"));
      e.target.classList.add("active");
      currentFilterStatus = e.target.getAttribute("data-status");
      renderVisibleClients();
    }
  });

  // Sort
  document.getElementById("sort-select").addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderVisibleClients();
  });

  // Add Client Modal
  const addModal = document.getElementById("add-client-modal");
  document
    .getElementById("open-add-modal-btn")
    .addEventListener("click", () => addModal.classList.add("active"));
  document
    .getElementById("close-add-modal-btn")
    .addEventListener("click", () => addModal.classList.remove("active"));
  document
    .getElementById("cancel-add-modal-btn")
    .addEventListener("click", () => addModal.classList.remove("active"));

  // Add Form Submit
  document
    .getElementById("add-client-form")
    .addEventListener("submit", handleAddClientSubmit);

  // Details Modal Close
  const detailsModal = document.getElementById("client-details-modal");
  document
    .getElementById("close-details-modal-btn")
    .addEventListener("click", () => detailsModal.classList.remove("active"));

  // Note Add
  document
    .getElementById("add-note-btn")
    .addEventListener("click", handleAddNote);

  // Reminder
  document.getElementById("remind-btn").addEventListener("click", () => {
    if (!selectedClientForDetails) return;
    showToast("Reminder set ✓", "success");
    const clientName = selectedClientForDetails.name;
    setTimeout(() => {
      showToast(`⏰ Follow up: ${clientName}`, "success");
    }, 60000);
  });
}

async function handleAddClientSubmit(e) {
  e.preventDefault();
  clearErrors();

  const nameIn = document.getElementById("client-name");
  const emailIn = document.getElementById("client-email");
  const phoneIn = document.getElementById("client-phone");
  const companyIn = document.getElementById("client-company");
  const dealIn = document.getElementById("client-deal-value");
  const statusIn = document.getElementById("client-status");

  const name = nameIn.value.trim();
  const email = emailIn.value.trim().toLowerCase();
  const phone = phoneIn.value.trim();
  const company = companyIn.value.trim() || "N/A";
  const dealValue = Number(dealIn.value);
  const status = statusIn.value;

  let isValid = true;

  if (name.length < 3) {
    showFieldError(nameIn, "Name must be at least 3 characters");
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError(emailIn, "Please enter a valid email address");
    isValid = false;
  } else if (allClients.some((c) => c.email === email)) {
    showFieldError(emailIn, "A client with this email already exists");
    isValid = false;
  }

  if (phone && phone.length < 6) {
    showFieldError(phoneIn, "Phone number looks too short");
    isValid = false;
  }

  if (isNaN(dealValue) || dealValue <= 0) {
    showFieldError(dealIn, "Deal value must be a positive number");
    isValid = false;
  }

  if (isValid) {
    const newClientObj = {
      name,
      email,
      phone: phone || "+1 555-0199",
      company,
      status,
      dealValue,
      notes: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("https://dummyjson.com/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientObj),
      });
    } catch (err) {}

    const finalClient = {
      ...newClientObj,
      id: Date.now(),
      image: "https://dummyjson.com/icon/emilys/128",
    };
    allClients.unshift(finalClient);
    saveState();
    renderVisibleClients();

    document.getElementById("add-client-form").reset();
    document.getElementById("add-client-modal").classList.remove("active");
    showToast("Client added ✓", "success");
  }
}

function openDetailsModal(id) {
  const client = allClients.find((c) => c.id === id);
  if (!client) return;
  selectedClientForDetails = client;

  document.getElementById("detail-avatar").src =
    client.image || "https://dummyjson.com/icon/emilys/128";
  document.getElementById("detail-client-name").innerText = client.name;
  document.getElementById("detail-name-company").innerText =
    `${client.name} (${client.company})`;
  document.getElementById("detail-email-phone").innerText =
    `${client.email} • ${client.phone}`;
  document.getElementById("detail-deal-value").innerText =
    `$${Number(client.dealValue).toLocaleString()}`;
  document.getElementById("detail-since").innerText =
    `Client since ${new Date(client.createdAt).toLocaleDateString()}`;

  renderNotesList(client.notes);
  document.getElementById("client-details-modal").classList.add("active");
}

function renderNotesList(notes) {
  const container = document.getElementById("notes-list");
  container.innerHTML = "";

  if (!notes || notes.length === 0) {
    container.innerHTML = `<p class="text-muted text-small">No notes yet.</p>`;
    return;
  }

  notes.forEach((n) => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `<strong>${escapeHTML(n.text)}</strong> <br><span class="text-muted text-small">${n.date}</span>`;
    container.appendChild(div);
  });
}

function handleAddNote() {
  if (!selectedClientForDetails) return;
  const input = document.getElementById("new-note-input");
  const text = input.value.trim();
  if (!text) return;

  const newNote = { text, date: new Date().toLocaleString() };
  selectedClientForDetails.notes.push(newNote);
  saveState();

  renderNotesList(selectedClientForDetails.notes);
  input.value = "";
}

function saveState() {
  localStorage.setItem("crm_clients", JSON.stringify(allClients));
}

function showFieldError(input, message) {
  input.classList.add("input-error");
  const err = document.createElement("div");
  err.className = "field-error-text";
  err.textContent = message;
  input.parentNode.appendChild(err);
}

function clearErrors() {
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
  document.querySelectorAll(".field-error-text").forEach((el) => el.remove());
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container") || document.body;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}
