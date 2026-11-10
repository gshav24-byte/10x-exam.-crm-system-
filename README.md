# 🚀 10X CRM System Management Application

A modern, industry-standard CRM web application built for efficient client database management and sales tracking. This project is crafted using pure **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3**, following a modular architecture without relying on any external frameworks or third-party libraries.

---

## 📐 Architecture & Site Map (5 Distinct Pages)

The application adheres to the **Single Source of Truth** pattern with `localStorage` persistence, structured across 5 distinct HTML pages:

- **P1 — Sign Up (`signup.html`):** Public registration form with strict PRD validation rules.
- **P2 — Log In (`index.html`):** Public entry point featuring sessional Route Guards and Account Enumeration protection.
- **P3 — Dashboard (`dashboard.html`):** Protected summary page with a dynamic welcome bar, live clock, 4 real-time business stats, pipeline overview, table pagination, and CSV export.
- **P4 — Clients Base (`clients.html`):** Protected workspace with DummyJSON API integration, complete CRUD operations, composite search/chip/sort pipeline, client details modal, notes, and follow-up timers.
- **P5 — Profile (`profile.html`):** Protected account settings with initials avatars, profile editing, password change verification, and database reset tools.

---

## 💾 LocalStorage Registry & State Management

All application data persists locally using standardized keys:

- **`crm_users`**: Array of registered user objects (`id`, `fullName`, `email`, `password`, `company`, `createdAt`).
- **`crm_session`**: Active session object storing current user context (`userId`, `email`, `loginAt`).
- **`crm_clients`**: Main application state array containing client objects (`id`, `name`, `email`, `phone`, `company`, `status`, `dealValue`, `notes`, `createdAt`).
- **`crm_theme`**: Active UI color theme preference (`"dark"` or `"light"`).

---

## 🛠️ Feature Breakdown by Modules

### 🔒 P0 & Security: Auth Guard & Global Rules (`js/guard.js`)

- **Route Guard:** Executed inside the `<head>` of protected pages to evaluate `localStorage.getItem('crm_session')` before DOM rendering, preventing **Flash of Unauthenticated Content (FOUC)**.
- **Session Management:** Unauthenticated access attempts redirect to `index.html`. Logging out clears `crm_session` while retaining user accounts and client records.
- **Theme Manager:** Toggles Dark/Light mode by updating `body` classes and persisting choices in `crm_theme`.

---

### 🔑 P1 & P2: Authentication & Validation (`js/auth.js`)

- **Form Submission (`e.preventDefault()`):** Suppresses native HTML submissions to run custom JavaScript validation pipelines.
- **Input Sanitization:** Input strings are sanitized via `.trim()` and `.toLowerCase()` for case-insensitive email processing.
- **Registration Rules (P1):**
  - Full Name length ($\ge 3$ characters).
  - Email Regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) and duplicate detection via `users.some()`.
  - Complex password constraints (8+ characters, at least 1 letter and 1 number).
  - Password matching confirmation.
- **Account Enumeration Attack Protection (P2):** Invalid login attempts return a unified _"Invalid email or password"_ message to prevent unauthorized email harvesting.

---

### 📊 P3: Dashboard & Analytics (`js/dashboard.js`)

- **Welcome Bar & Live Clock:** Dynamically extracts the user's first name (`fullName.split(' ')[0]`) and updates a live clock every second via `setInterval()`.
- **4 Stat Cards:**
  - **Total Clients:** `clients.length`
  - **Active Deals:** Count of clients excluding `"Won"` and `"Lost"` statuses.
  - **Won Revenue:** Cumulative sum of `"Won"` deal values (`filter().reduce()`), formatted as `$12,500`.
  - **New This Week:** Clients created within the last 7 days (`(Date.now() - createdAt) / 86400000 <= 7`).
- **Pipeline Overview:** Calculates client distribution across stages (`Lead`, `Contacted`, `Won`, `Lost`).
- **Clients List & Pagination:** Displays client rows with pagination controls (`1`, `2`, `▶`) slicing 5 records per page.
- **CSV Export:** Converts `crm_clients` to CSV format, prepending the **UTF-8 Byte Order Mark (`\uFEFF`)** to ensure accurate character rendering (e.g., Georgian script) in Microsoft Excel.

---

### ⚙️ P4: Clients Base & API Operations (`js/clients.js`)

- **DummyJSON API Sync:** Asynchronously fetches initial records from `https://dummyjson.com/users?limit=30` using `async/await`, caching results in `localStorage`.
- **Composite Filtering Pipeline:** Combines status filter chips, live multi-field text search, and column sorting without mutating the original source array:
  $$\text{allClients} \xrightarrow{\text{Status Filter}} \text{Filtered} \xrightarrow{\text{Text Search}} \text{Searched} \xrightarrow{\text{Sort Config}} \text{Sorted Copy} \xrightarrow{\text{Render DOM}}$$
- **CRUD Implementations:**
  - **C (Create):** Open Add Client modal, sends `POST https://dummyjson.com/users/add`, prepends response via `.unshift()`, and updates DOM.
  - **R (Read & Security):** Escapes text nodes with an `escapeHTML()` sanitizer to prevent **Cross-Site Scripting (XSS)** vulnerabilities.
  - **U (Update):** Inline status dropdown updates record state, storage, and statistics immediately.
  - **D (Delete):** Displays `confirm()` dialog, sends `DELETE https://dummyjson.com/users/{id}`, and removes item via `.filter()`.
- **Details Modal & Follow-up Timer:** Displays full client metadata, note-taking history (`{ text, date }`), and a 1-minute follow-up reminder triggered via `setTimeout()` toast notifications.

---

### 👤 P5: Profile & Settings (`js/profile.js`)

- **Initials Avatar:** Dynamically extracts initials from the user's full name using string methods.
- **Profile Edit:** Updates user name and company details in `crm_users`.
- **Password Change:** Validates current stored password, enforces new password complexity, and prevents reusing the current password.
- **Reset CRM Data:** Re-initializes client records from the API while keeping user accounts and sessional states intact.

---

## 🎨 HTML & CSS Best Practices

- **`<form novalidate>`**: Disables browser default validation popups to favor custom JS error messages underneath input fields.
- **Accessibility (a11y):** Explicit `for="..."` and `id="..."` input bindings enhance screen-reader support.
- **CSS Grid & Flexbox:** Mobile-friendly layouts utilizing `min-height: 100vh` wrappers and responsive grid templates.
- **CSS Variables (`:root`):** Dynamic tokens managing light/dark theme color palettes.
- **Separation of Concerns:** JavaScript manages data state and active utility classes (e.g., `.input-error`), leaving styling strictly to CSS.
