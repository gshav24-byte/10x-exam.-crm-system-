// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. SIGN UP (signup.html) ---
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const fullNameInput = document.getElementById("fullName");
      const emailInput = document.getElementById("email");
      const companyInput = document.getElementById("company");
      const passwordInput = document.getElementById("password");
      const confirmPasswordInput = document.getElementById("confirmPassword");

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const company = companyInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      let isValid = true;

      // Name >= 3
      if (fullName.length < 3) {
        showFieldError(
          fullNameInput,
          "Full name must be at least 3 characters",
        );
        isValid = false;
      }

      // Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFieldError(emailInput, "Please enter a valid email address");
        isValid = false;
      } else {
        const users = JSON.parse(localStorage.getItem("crm_users")) || [];
        if (users.some((u) => u.email === email)) {
          showFieldError(
            emailInput,
            "An account with this email already exists",
          );
          isValid = false;
        }
      }

      // Password rules (8+ chars, 1 letter, 1 number)
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (password.length < 8 || !hasLetter || !hasNumber) {
        showFieldError(
          passwordInput,
          "Password must be at least 8 characters and contain a letter and a number",
        );
        isValid = false;
      }

      // Confirm Password
      if (password !== confirmPassword) {
        showFieldError(confirmPasswordInput, "Passwords do not match");
        isValid = false;
      }

      if (isValid) {
        const newUser = {
          id: Date.now(),
          fullName,
          email,
          password,
          company: company || "",
          createdAt: new Date().toISOString(),
        };

        const users = JSON.parse(localStorage.getItem("crm_users")) || [];
        users.push(newUser);
        localStorage.setItem("crm_users", JSON.stringify(users));

        showToast("Account created successfully! Please log in.", "success");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      }
    });
  }

  // --- 2. LOG IN (index.html) ---
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      let isValid = true;

      if (!email) {
        showFieldError(emailInput, "Email is required");
        isValid = false;
      }
      if (!password) {
        showFieldError(passwordInput, "Password is required");
        isValid = false;
      }

      if (isValid) {
        const users = JSON.parse(localStorage.getItem("crm_users")) || [];
        const user = users.find(
          (u) => u.email === email && u.password === password,
        );

        if (user) {
          const sessionData = {
            userId: user.id,
            email: user.email,
            loginAt: new Date().toISOString(),
          };
          localStorage.setItem("crm_session", JSON.stringify(sessionData));
          window.location.href = "dashboard.html";
        } else {
          showFieldError(passwordInput, "Invalid email or password");
        }
      }
    });
  }
});

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
