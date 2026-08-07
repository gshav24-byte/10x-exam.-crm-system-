// js/clients.js

const MOCK_API_URL = 'https://jsonplaceholder.typicode.com/users';

// --- STATE ---
let allClients = []; 
let currentFilters = { search: '', status: 'all' };
let pagination = { currentPage: 1, itemsPerPage: 5 };
let sortConfig = { key: 'name', direction: 'asc' };

document.addEventListener('DOMContentLoaded', () => {
    initClients();
    setupEventListeners();
});

/**
 * 1. ინიციალიზაცია
 */
async function initClients() {
    showLoader(true);
    try {
        let stored = JSON.parse(localStorage.getItem('crm_clients'));
        
        if (!stored || stored.length === 0) {
            stored = await fetchClientsFromAPI();
            localStorage.setItem('crm_clients', JSON.stringify(stored));
        }

        allClients = stored;
        applyPipelineAndRender();

    } catch (error) {
        console.error("შეცდომა:", error);
        showToast("მონაცემების ჩატვირთვა ვერ მოხერხდა", "error");
    } finally {
        showLoader(false);
    }
}

/**
 * 2. API-დან წამოღება
 */
async function fetchClientsFromAPI() {
    const response = await fetch(MOCK_API_URL);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();

    return data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        phone: u.phone.split(' ')[0],
        company: u.company ? u.company.name : 'N/A',
        status: u.id % 3 === 0 ? 'Inactive' : (u.id % 2 === 0 ? 'Active' : 'Lead'),
        createdAt: new Date().toISOString()
    }));
}

/**
 * 3. მთავარი დამუშავების ჯაჭვი
 */
function applyPipelineAndRender() {
    // 1. სტატისტიკის განახლება
    updateDashboardStats();

    // 2. ფილტრაცია
    let result = allClients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                              client.email.toLowerCase().includes(currentFilters.search.toLowerCase());
        const matchesStatus = currentFilters.status === 'all' || client.status === currentFilters.status;
        return matchesSearch && matchesStatus;
    });

    // 3. დახარისხება
    result.sort((a, b) => {
        let valA = a[sortConfig.key].toString().toLowerCase();
        let valB = b[sortConfig.key].toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // 4. პაგინაცია
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;

    if (pagination.currentPage > totalPages) {
        pagination.currentPage = totalPages;
    }

    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginatedClients = result.slice(startIndex, endIndex);

    // 5. რენდერი
    renderClientsTable(paginatedClients);
    renderPaginationControls(totalItems, totalPages);
    updateSortIcons();
}

/**
 * 4. სტატისტიკის ვიჯეტების ანგარიში (Analytics)
 */
function updateDashboardStats() {
    const total = allClients.length;
    const active = allClients.filter(c => c.status === 'Active').length;
    const lead = allClients.filter(c => c.status === 'Lead').length;
    const inactive = allClients.filter(c => c.status === 'Inactive').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-active').innerText = active;
    document.getElementById('stat-lead').innerText = lead;
    document.getElementById('stat-inactive').innerText = inactive;
}

/**
 * 5. CSV ექსპორტის ფუნქცია
 */
function exportToCSV() {
    if (allClients.length === 0) {
        showToast("ექსპორტისთვის მონაცემები არ არის", "error");
        return;
    }

    // CSV-ს სათაურები
    const headers = ["ID", "Name", "Email", "Phone", "Company", "Status", "CreatedAt"];
    
    // თითოეული სტრიქონის მომზადება
    const rows = allClients.map(c => [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.company.replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${c.createdAt}"`
    ]);

    // UTF-8 BOM (\uFEFF) ქართული ენისა და უნიკოდის მხარდაჭერისთვის Excel-ში
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `crm_clients_${Date.now()}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("CSV ფაილი წარმატებით ჩამოიქვირთა", "success");
}

/**
 * 6. ბაზის საწყის მდგომარეობაში დაბრუნება (Reset)
 */
async function resetData() {
    if (!confirm("ნამდვილად გსურთ ბაზის საწყის მდგომარეობაში დაბრუნება? ყველა ცვლილება წაიშლება.")) return;

    localStorage.removeItem('crm_clients');
    allClients = [];
    await initClients();
    showToast("ბაზა წარმატებით განახლდა საწყის მონაცემებზე", "success");
}

/**
 * 7. DOM რენდერინგი
 */
function renderClientsTable(clients) {
    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = '';

    if (clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">კლიენტები ვერ მოიძებნა</td></tr>`;
        return;
    }

    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHTML(client.name)}</strong></td>
            <td>${escapeHTML(client.email)}</td>
            <td>${escapeHTML(client.phone)}</td>
            <td>${escapeHTML(client.company)}</td>
            <td><span class="badge badge-${client.status.toLowerCase()}">${client.status}</span></td>
            <td>
                <button class="btn-icon" onclick="openEditModal(${client.id})" title="რედაქტირება">✏️</button>
                <button class="btn-icon" onclick="deleteClient(${client.id})" title="წაშლა">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPaginationControls(totalItems, totalPages) {
    const infoText = document.getElementById('pagination-info');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const pageNumbersContainer = document.getElementById('page-numbers');

    const start = totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems);

    infoText.innerText = `გამოჩენილია ${start}-${end} / ${totalItems}-დან`;

    prevBtn.disabled = pagination.currentPage === 1;
    nextBtn.disabled = pagination.currentPage === totalPages || totalPages === 0;

    pageNumbersContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-page ${i === pagination.currentPage ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.addEventListener('click', () => {
            pagination.currentPage = i;
            applyPipelineAndRender();
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
}

/**
 * 8. Event Listener-ები
 */
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentFilters.search = e.target.value.trim();
        pagination.currentPage = 1;
        applyPipelineAndRender();
    });

    document.getElementById('status-filter').addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        pagination.currentPage = 1;
        applyPipelineAndRender();
    });

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (pagination.currentPage > 1) {
            pagination.currentPage--;
            applyPipelineAndRender();
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', () => {
        pagination.currentPage++;
        applyPipelineAndRender();
    });

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort');
            if (sortConfig.key === key) {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.key = key;
                sortConfig.direction = 'asc';
            }
            applyPipelineAndRender();
        });
    });

    // ახალი ღილაკების ივენთები (CSV & Reset)
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('reset-data-btn').addEventListener('click', resetData);

    // მოდალი
    document.getElementById('open-add-modal-btn').addEventListener('click', openAddModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    document.getElementById('client-form').addEventListener('submit', handleFormSubmit);
}

function updateSortIcons() {
    document.querySelectorAll('th.sortable').forEach(th => {
        const key = th.getAttribute('data-sort');
        const iconSpan = th.querySelector('.sort-icon');
        
        if (key === sortConfig.key) {
            iconSpan.innerText = sortConfig.direction === 'asc' ? '▲' : '▼';
            th.classList.add('sorted');
        } else {
            iconSpan.innerText = '⇅';
            th.classList.remove('sorted');
        }
    });
}

function deleteClient(id) {
    if (!confirm("ნამდვილად გსურთ კლიენტის წაშლა?")) return;

    allClients = allClients.filter(c => c.id !== id);
    saveToLocalStorage();
    applyPipelineAndRender();
    showToast("კლიენტი წარმატებით წაიშალა", "success");
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('client-id').value;
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const company = document.getElementById('client-company').value.trim() || 'N/A';
    const status = document.getElementById('client-status').value;

    if (!name || !email || !phone) {
        showToast("გთხოვთ შეავსოთ სავალდებულო ველები!", "error");
        return;
    }

    if (id) {
        const index = allClients.findIndex(c => c.id == id);
        if (index !== -1) {
            allClients[index] = { ...allClients[index], name, email, phone, company, status };
            showToast("კლიენტის მონაცემები განახლდა", "success");
        }
    } else {
        const newClient = {
            id: Date.now(),
            name,
            email: email.toLowerCase(),
            phone,
            company,
            status,
            createdAt: new Date().toISOString()
        };
        allClients.unshift(newClient);
        showToast("ახალი კლიენტი წარმატებით დაემატა", "success");
    }

    saveToLocalStorage();
    applyPipelineAndRender();
    closeModal();
}

function openAddModal() {
    document.getElementById('modal-title').innerText = 'ახალი კლიენტის დამატება';
    document.getElementById('client-form').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('client-modal').classList.add('active');
}

function openEditModal(id) {
    const client = allClients.find(c => c.id === id);
    if (!client) return;

    document.getElementById('modal-title').innerText = 'კლიენტის რედაქტირება';
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email;
    document.getElementById('client-phone').value = client.phone;
    document.getElementById('client-company').value = client.company;
    document.getElementById('client-status').value = client.status;

    document.getElementById('client-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('client-modal').classList.remove('active');
}

function saveToLocalStorage() {
    localStorage.setItem('crm_clients', JSON.stringify(allClients));
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}