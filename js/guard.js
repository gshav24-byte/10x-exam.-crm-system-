// js/guard.js

function checkAuth() {
    // 1. ვკითხულობთ სესიას localStorage-დან
    const session = localStorage.getItem('crm_session');
    
    // 2. ვიგებთ მიმდინარე გვერდის დასახელებას
    const path = window.location.pathname;
    
    // 3. ვამოწმებთ, საჯარო გვერდზე ვართ თუ დაცულზე
    const isAuthPage = path.includes('index.html') || path.includes('signup.html') || path.endsWith('/');

    // თუ სესია არ არსებობს და მომხმარებელი დაცულ გვერდზე შედის -> გადამისამართება ლოგინზე
    if (!session && !isAuthPage) {
        window.location.href = 'index.html';
    }

    // თუ სესია არსებობს და მომხმარებელი ლოგინ/რეგისტრაციის გვერდზეა -> გადამისამართება დეშბორდზე
    if (session && !isAuthPage === false) { 
        // შენიშვნა: თუ სესია არის და ავტორიზაციის გვერდზე ვართ
        if (isAuthPage) {
            window.location.href = 'dashboard.html';
        }
    }
}

// ლოგაუთის ფუნქცია (გამოიყენება ნავიგაციაში)
function logout() {
    localStorage.removeItem('crm_session'); // შლის მხოლოდ სესიას და არა კლიენტებს/იუზერებს!
    window.location.href = 'index.html';
}

// ფუნქციის დაუყოვნებლივი გამოძახება
checkAuth();