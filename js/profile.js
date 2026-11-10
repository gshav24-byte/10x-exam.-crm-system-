// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

/**
 * P5.1 - ინფორმაციის ბლოკის ინიციალიზაცია
 */
function initProfilePage() {
    const user = getCurrentUser();
    if (!user) return;

    // სახელის, იმეილისა და მეტა ინფოს გამოჩენა
    document.getElementById('profile-display-name').innerText = user.fullName;
    document.getElementById('profile-display-email').innerText = user.email;
    
    const companyText = user.company ? `${user.company} • ` : '';
    const createdDate = new Date(user.createdAt).toLocaleDateString();
    document.getElementById('profile-display-meta').innerText = `${companyText}Member since ${createdDate}`;

    // ინიციალებიანი ავატარი (fullName-ის პირველი ასოები String მეთოდებით)
    const initials = user.fullName
        .trim()
        .split(' ')
        .filter(part => part.length > 0)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    document.getElementById('user-initials-avatar').innerText = initials || 'U';

    // P5.2-ის ველების წინასწარი შევსება
    document.getElementById('profile-fullName').value = user.fullName;
    document.getElementById('profile-company').value = user.company || '';

    // ივენთების მიბმა
    document.getElementById('edit-profile-form').addEventListener('submit', handleEditProfile);
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
    document.getElementById('reset-crm-data-btn').addEventListener('click', handleResetCRMData);
}

/**
 * P5.2 - პროფილის რედაქტირება (A. Save Changes)
 */
function handleEditProfile(e) {
    e.preventDefault();
    clearErrors();

    const fullNameIn = document.getElementById('profile-fullName');
    const companyIn = document.getElementById('profile-company');

    const fullName = fullNameIn.value.trim();
    const company = companyIn.value.trim();

    // ვალიდაციის წესი: Full Name სავალდებულოა (trim() >= 3)
    if (fullName.length < 3) {
        showFieldError(fullNameIn, "Full name must be at least 3 characters");
        return;
    }

    const session = JSON.parse(localStorage.getItem('crm_session'));
    let users = JSON.parse(localStorage.getItem('crm_users')) || [];
    const userIndex = users.findIndex(u => u.email === session.email);

    if (userIndex !== -1) {
        // crm_users-ში მონაცემების განახლება
        users[userIndex].fullName = fullName;
        users[userIndex].company = company;
        localStorage.setItem('crm_users', JSON.stringify(users));

        showToast("Profile updated ✓", "success");
        initProfilePage(); // გვერდზეც მომენტალურად ახლდება სახელი და ინიციალები
    }
}

/**
 * P5.3 - პაროლის შეცვლა (B. Change Password)
 */
function handleChangePassword(e) {
    e.preventDefault();
    clearErrors();

    const currIn = document.getElementById('current-password');
    const newIn = document.getElementById('new-password');
    const confIn = document.getElementById('confirm-new-password');

    const currentPassword = currIn.value;
    const newPassword = newIn.value;
    const confirmNewPassword = confIn.value;

    const user = getCurrentUser();
    let isValid = true;

    // 1. Current Password Validation (ემთხვევა შენახულს?)
    if (currentPassword !== user.password) {
        showFieldError(currIn, "Current password is incorrect");
        isValid = false;
    }

    // 2. New Password Validation (≥8 სიმბოლო, 1 ასო, 1 ციფრი; ≠ Current)
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
        showFieldError(newIn, "Password must be at least 8 characters and contain a letter and a number");
        isValid = false;
    } else if (newPassword === currentPassword) {
        showFieldError(newIn, "New password must be different from the current one");
        isValid = false;
    }

    // 3. Confirm New Password Validation (ემთხვევა New Password-ს?)
    if (newPassword !== confirmNewPassword) {
        showFieldError(confIn, "Passwords do not match");
        isValid = false;
    }

    if (isValid) {
        let users = JSON.parse(localStorage.getItem('crm_users')) || [];
        const userIndex = users.findIndex(u => u.email === user.email);

        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('crm_users', JSON.stringify(users));

            document.getElementById('change-password-form').reset();
            showToast("Password changed ✓", "success");
        }
    }
}

/**
 * P5.4 - მონაცემების მართვა (C. Reset CRM Data)
 */
async function handleResetCRMData() {
    if (!confirm("Are you sure you want to reset all CRM clients data? This action cannot be undone.")) return;

    try {
        // crm_clients-ის წაშლა და API-დან ხელახლა წამოღება
        const res = await fetch('https://dummyjson.com/users?limit=30');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const mapped = data.users.map((u, i) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email.toLowerCase(),
            phone: u.phone,
            company: u.company ? u.company.name : 'N/A',
            image: u.image,
            status: i % 4 === 0 ? 'Won' : (i % 3 === 0 ? 'Contacted' : (i % 5 === 0 ? 'Lost' : 'Lead')),
            dealValue: (i + 1) * 1500,
            notes: [],
            createdAt: new Date(Date.now() - i * 3600000 * 12).toISOString()
        }));

        localStorage.setItem('crm_clients', JSON.stringify(mapped));
        showToast("CRM data reset ✓", "success");
    } catch (err) {
        showToast("Failed to reset CRM data from API", "error");
    }
}

// დამხმარე ფუნქციები (P0.4 - შეცდომების სტანდარტი)
function showFieldError(input, message) {
    input.classList.add('input-error');
    const err = document.createElement('div');
    err.className = 'field-error-text';
    err.textContent = message;
    input.parentNode.appendChild(err);
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}