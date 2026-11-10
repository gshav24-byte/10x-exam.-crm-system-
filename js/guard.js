// js/guard.js

// 1. Auth Guard (P0.1)
(function checkAuth() {
  const session = localStorage.getItem("crm_session");
  const path = window.location.pathname;

  const isPublicPage =
    path.includes("index.html") ||
    path.includes("signup.html") ||
    path === "/" ||
    path.endsWith("/");

  if (!session && !isPublicPage) {
    window.location.href = "index.html";
  } else if (session && isPublicPage) {
    window.location.href = "dashboard.html";
  }
})();

// 2. Theme Manager (P0.3)
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("crm_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("crm_theme", isLight ? "light" : "dark");
    });
  }
});

// 3. Logout (P0.2)
function logout() {
  localStorage.removeItem("crm_session");
  window.location.href = "index.html";
}

// Helper: Get Current Logged User
function getCurrentUser() {
  const session = JSON.parse(localStorage.getItem("crm_session"));
  if (!session) return null;
  const users = JSON.parse(localStorage.getItem("crm_users")) || [];
  return users.find((u) => u.email === session.email) || null;
}
