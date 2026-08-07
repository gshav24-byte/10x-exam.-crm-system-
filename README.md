# 🚀 CRM System Management Application

A modern, industry-standard CRM web application built for efficient client database management. This project is crafted using pure **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3**, without relying on any external frameworks or third-party libraries.

---

## 📐 Architecture & State Management

The application adheres to the **Single Source of Truth** pattern:
* **`allClients`**: Global in-memory array (RAM) storing the complete client dataset.
* **`crm_clients`**: The `localStorage` key ensuring data persistence across browser reloads or tab closures.
* **`crm_session`**: The `localStorage` key holding the currently authenticated user session.
* **`crm_users`**: The `localStorage` key storing registered user credentials.
---
## 🛠️ Feature Breakdown by Development Days

### 🔒 Day 1: Authentication, Route Guard & Security
* **Route Guard (`js/guard.js`):**
  * Loaded directly in the `<head>` to perform checks before DOM rendering, preventing **Flash of Unauthenticated Content (FOUC)**.
  * Evaluates `localStorage.getItem('crm_session')`. Redirects unauthenticated users to `index.html` and authenticated users to `dashboard.html` (`window.location.href`).
  * **Logout Logic:** Clears only `crm_session` upon logout, retaining `crm_users` and `crm_clients` for future sessions.
* **Form Validation (`js/auth.js`):**
  * **`e.preventDefault()`**: Suppresses native HTML form submission to execute custom JS validation.
  * **Data Sanitization:** Input strings are sanitized via `.trim()` (whitespace removal) and `.toLowerCase()` (case-insensitive email handling).
  * **Validation Rules:** Minimum name length ($\ge 3$), Regular Expressions (Regex) for email formatting and strong passwords (8+ chars, letters, numbers), and password confirmation matching.
  * **Duplicate Prevention:** Uses `users.some()` to ensure email uniqueness during registration.
  * **Account Enumeration Attack Protection:** Login errors (`users.find()`) return a generic *"Invalid email or password"* message to prevent unauthorized email harvesting.
---
### 🔄 Day 2: Dashboard Initialization & API / LocalStorage Sync
* **Data Fetching Logic (`initClients`):**
  1. On first load, asynchronously fetches mock data via `fetch()` using `async/await`.
  2. Transforms data (Data Mapping) and persists it into `localStorage` (`JSON.stringify()`).
  3. Subsequent visits bypass API calls and read directly from `localStorage` (`JSON.parse()`).
* **Secure Rendering:**
  * Uses an `escapeHTML()` sanitizer to convert HTML special characters into safe entities, mitigating **Cross-Site Scripting (XSS)** vulnerabilities.
* **Loader Management:**
  * Employs a `finally` block to guarantee that the UI loading spinner is dismissed regardless of request success or failure.
---
### ⚙️ Day 3: Full CRUD Operations & Live Filtering
* **Multi-Criteria Composite Filtering:**
  * Utilizes `.filter()` to evaluate multiple conditions simultaneously (`matchesSearch && matchesStatus`). Search queries match against name or email fields (`.includes()`, `.toLowerCase()`).
* **CRUD Implementations:**
  * **C (Create):** Generates new entries with unique `Date.now()` timestamps as primary keys, prepends them via `.unshift()`, and syncs with `localStorage`.
  * **R (Read):** Dynamic table DOM rendering (`renderClientsTable`).
  * **U (Update):** Employs a hidden form field `<input type="hidden" id="client-id">` to distinguish creation from editing. Retrieves record via `.find()`, updates via `.findIndex()`, and merges state using the Spread operator (`{ ...allClients[index], ... }`).
  * **D (Delete):** Prompts user confirmation (`confirm()`) and removes entries using `allClients = allClients.filter(c => c.id !== id)`.
---
### 📊 Day 4: Data Pipeline, Sorting, Pagination & Toast Notifications

#### 🔄 Data Pipeline
A centralized execution pipeline function (`applyPipelineAndRender()`) processes data sequentially across 4 distinct stages:
$$\text{allClients} \xrightarrow{\text{1. Filter}} \text{Filtered} \xrightarrow{\text{2. Sort}} \text{Sorted} \xrightarrow{\text{3. Paginate}} \text{Paginated} \xrightarrow{\text{4. Render}} \text{DOM}$$

#### 🔢 Pagination Math
* Total Page Calculation:
  $$\text{totalPages} = \left\lceil \frac{\text{totalItems}}{\text{itemsPerPage}} \right\rceil$$
* Slice Index Formula (`.slice()`):
  $$\text{startIndex} = (\text{currentPage} - 1) \times \text{itemsPerPage}$$
  $$\text{endIndex} = \text{startIndex} + \text{itemsPerPage}$$
* **Edge-case Protection:** Resets `currentPage = 1` on filter updates, and automatically clamps bounds if `currentPage > totalPages`.

#### 🔀 Column Sorting (`.sort`)
* Clicking table headers (`<th>`) toggles sorting direction between ascending ($A \rightarrow Z$) and descending ($Z \rightarrow A$).
* Features dynamic UI indicators (▲, ▼, ⇅).

#### 🔔 Toast Notifications
* Dynamically injects toast containers into the DOM via `document.createElement('div')`. Uses `setTimeout()` (3000ms delay) to append a `fade-out` class before removing the element (`toast.remove()`).
---
### 📈 Day 5: Dynamic Analytics & CSV Export
* **Real-time Dashboard Metrics (`updateDashboardStats`):**
  * Computes client totals grouped by status (Total, Active, Lead, Inactive) using `.filter().length` and updates UI cards instantly upon pipeline execution.
* **CSV Export (Microsoft Excel Compatibility):**
  * Serializes `allClients` array into Comma Separated Values (CSV).
  * Prepends the **UTF-8 Byte Order Mark (`\uFEFF`)** to ensure seamless character encoding and proper rendering of non-Latin characters (e.g., Georgian script) in Microsoft Excel.
  * Constructs a `new Blob()`, generates a temporary URL via `URL.createObjectURL(blob)`, and triggers an automated download via a programmatically clicked `<a>` element.
---
## 🎨 HTML & CSS Best Practices

* **`<form novalidate>`**: Disables browser default validation UI to favor custom JavaScript/CSS error handling.
* **Accessibility (a11y):** Explicit `for="..."` and `id="..."` label-to-input bindings enhance screen-reader support and touch target UX.
* **`box-sizing: border-box`**: Applied via universal selector (`*`) to keep element layout calculations predictable.
* **Flexbox Centering**: Layout wrapper `.auth-body` utilizes `min-height: 100vh` combined with Flexbox (`justify-content: center`, `align-items: center`).
* **CSS Variables (`:root`)**: Centralized design tokens for colors and themes.
* **Separation of Concerns**: JavaScript manages state and active CSS classes (e.g., `.classList.add('input-error')`), leaving visual styling strictly to CSS.
* **HTML5** (Semantic Markup)
* **CSS3** (Flexbox, Dynamic Variables, Responsive Design)
* **JavaScript (ES6+)** (Async/Await, Dynamic DOM Manipulation, Higher-Order Array Methods: `.filter()`, `.sort()`, `.slice()`, `.map()`, `.find()`, `.findIndex()`)
