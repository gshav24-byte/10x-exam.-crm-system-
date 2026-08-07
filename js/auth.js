// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SIGN UP (signup.html) - რეგისტრაცია
    // ==========================================
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault(); // ვაჩერებთ ფორმის სტანდარტულ გაგზავნას (გვერდის დარეფრეშებას)

            // ინფუტების მნიშვნელობების აღება
            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            const companyInput = document.getElementById('company');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase(); // ელფოსტას ვინახავთ lowercase-ად!
            const company = companyInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // შეცდომების გასუფთავება
            clearErrors();
            let isValid = true;

            // --- ვალიდაციის წესები PRD P1.2-ის მიხედვით ---

            // Full Name (მინ. 3 სიმბოლო)
            if (fullName.length < 3) {
                showFieldError(fullNameInput, "Full name must be at least 3 characters");
                isValid = false;
            }

            // Email-ის ფორმატი (@ და წერტილი @-ის შემდეგ)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFieldError(emailInput, "Please enter a valid email address");
                isValid = false;
            } else {
                // Email-ის დუბლიკატის შემოწმება
                const users = JSON.parse(localStorage.getItem('crm_users')) || [];
                const isDuplicate = users.some(u => u.email === email);
                if (isDuplicate) {
                    showFieldError(emailInput, "An account with this email already exists");
                    isValid = false;
                }
            }

            // Password (მინ. 8 სიმბოლო, 1 ასო, 1 ციფრი)
            const hasLetter = /[a-zA-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            if (password.length < 8 || !hasLetter || !hasNumber) {
                showFieldError(passwordInput, "Password must be at least 8 characters and contain a letter and a number");
                isValid = false;
            }

            // Confirm Password (უნდა ემთხვეოდეს პაროლს)
            if (password !== confirmPassword) {
                showFieldError(confirmPasswordInput, "Passwords do not match");
                isValid = false;
            }

            // თუ ყველა ვალიდაცია გაიარა:
            if (isValid) {
                const newUser = {
                    id: Date.now(), // უნიკალური ID დროის შტამპით
                    fullName: fullName,
                    email: email,
                    password: password,
                    company: company || "",
                    createdAt: new Date().toISOString()
                };

                const users = JSON.parse(localStorage.getItem('crm_users')) || [];
                users.push(newUser);
                localStorage.setItem('crm_users', JSON.stringify(users));

                // შეტყობინება და გადამისამართება
                showToast("Account created successfully! Please log in.", "success");
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    // ==========================================
    // 2. LOG IN (index.html) - ავტორიზაცია
    // ==========================================
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            clearErrors();
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
                const users = JSON.parse(localStorage.getItem('crm_users')) || [];
                // ვეძებთ მომხმარებელს email-ით და password-ით
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // სესიის შექმნა PRD სტრუქტურის მიხედვით
                    const sessionData = {
                        userId: user.id,
                        email: user.email,
                        loginAt: new Date().toISOString()
                    };
                    localStorage.setItem('crm_session', JSON.stringify(sessionData));
                    
                    window.location.href = 'dashboard.html';
                } else {
                    // განზოგადებული შეცდომა უსაფრთხოებისთვის (PRD P2.2)
                    showFieldError(passwordInput, "Invalid email or password");
                }
            }
        });
    }
});

// დამხმარე ფუნქციები DOM-ში შეცდომებისა და Toast-ის საჩვენებლად
function showFieldError(inputElement, message) {
    inputElement.classList.add('input-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-text';
    errorDiv.style.color = 'red';
    errorDiv.textContent = message;
    inputElement.parentNode.appendChild(errorDiv);
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
}

function showToast(message, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}