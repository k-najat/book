// auth.js - Authentication functionality for BookExchange

// Local storage keys
const USERS_KEY = 'bookexchange_users';
const CURRENT_USER_KEY = 'bookexchange_current_user';

// Initialize users if not exists
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem(CURRENT_USER_KEY) !== null;
}

// Get current user
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// Register new user
function registerUser(userData) {
    initUsers();
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
        return {
            success: false,
            message: 'Cette adresse e-mail est déjà utilisée.'
        };
    }
    
    // Check if username already exists
    if (users.some(user => user.username === userData.username)) {
        return {
            success: false,
            message: 'Ce nom d\'utilisateur est déjà utilisé.'
        };
    }
    
    // Create new user with ID and default values
    const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        password: userData.password, // In a real app, this should be hashed
        university: userData.university,
        studyField: userData.studyField,
        joinDate: new Date().toISOString(),
        profileImage: 'https://via.placeholder.com/150',
        booksAdded: 0,
        booksLent: 0,
        booksBorrowed: 0,
        rating: 0,
        reviews: []
    };
    
    // Add user to array
    users.push(newUser);
    
    // Save updated users array
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Log in the user
    const userForSession = {...newUser};
    delete userForSession.password; // Don't store password in session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userForSession));
    
    return {
        success: true,
        user: userForSession
    };
}

// Login user
function loginUser(email, password) {
    initUsers();
    
    // Get users
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
        return {
            success: false,
            message: 'Adresse e-mail ou mot de passe incorrect.'
        };
    }
    
    // Create session
    const userForSession = {...user};
    delete userForSession.password; // Don't store password in session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userForSession));
    
    return {
        success: true,
        user: userForSession
    };
}

// Logout user
function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
}

// Update user profile
function updateUserProfile(userData) {
    initUsers();
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return {
            success: false,
            message: 'Utilisateur non connecté.'
        };
    }
    
    // Get all users
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
        return {
            success: false,
            message: 'Utilisateur non trouvé.'
        };
    }
    
    // Update user data
    const updatedUser = {
        ...users[userIndex],
        ...userData
    };
    
    // Don't update password if not provided
    if (!userData.password) {
        delete updatedUser.password;
    }
    
    // Update users array
    users[userIndex] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update session
    const userForSession = {...updatedUser};
    delete userForSession.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userForSession));
    
    return {
        success: true,
        user: userForSession
    };
}

// Get user by ID
function getUserById(userId) {
    initUsers();
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return null;
    }
    
    // Return user without password
    const userWithoutPassword = {...user};
    delete userWithoutPassword.password;
    return userWithoutPassword;
}

// Update UI based on authentication state
function updateAuthUI() {
    const isUserLoggedIn = isLoggedIn();
    const currentUser = getCurrentUser();
    
    // Elements to update
    const userDropdown = document.getElementById('userDropdown');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const usernameSpan = document.getElementById('username');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    
    if (isUserLoggedIn && currentUser) {
        // User is logged in
        if (userDropdown) userDropdown.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (usernameSpan) usernameSpan.textContent = currentUser.username;
        
        // Update hero section button if on home page
        if (heroRegisterBtn) {
            heroRegisterBtn.textContent = 'Ajouter un livre';
            heroRegisterBtn.href = 'add-book.html';
        }
    } else {
        // User is not logged in
        if (userDropdown) userDropdown.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        
        // Update hero section button if on home page
        if (heroRegisterBtn) {
            heroRegisterBtn.textContent = "S'inscrire";
            heroRegisterBtn.href = 'register.html';
        }
    }
}

// Event listeners for forms
document.addEventListener('DOMContentLoaded', function() {
    // Initialize users
    initUsers();
    
    // Update UI based on auth state
    updateAuthUI();
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const university = document.getElementById('university').value;
            const studyField = document.getElementById('studyField').value;
            const termsCheck = document.getElementById('termsCheck').checked;
            const registerAlert = document.getElementById('registerAlert');
            
            // Validate form
            if (username.length < 3) {
                registerAlert.textContent = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
                registerAlert.style.display = 'block';
                return;
            }
            
            if (password.length < 8) {
                registerAlert.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
                registerAlert.style.display = 'block';
                return;
            }
            
            if (password !== confirmPassword) {
                registerAlert.textContent = "Les mots de passe ne correspondent pas.";
                registerAlert.style.display = 'block';
                return;
            }
            
            if (!termsCheck) {
                registerAlert.textContent = "Vous devez accepter les conditions d'utilisation.";
                registerAlert.style.display = 'block';
                return;
            }
            
            // Register user
            const result = registerUser({
                username,
                email,
                password,
                university,
                studyField
            });
            
            if (result.success) {
                // Show success message and redirect
                showFlashMessage('success', 'Inscription réussie ! Vous êtes maintenant connecté.');
                window.location.href = 'index.html';
            } else {
                // Show error message
                registerAlert.textContent = result.message;
                registerAlert.style.display = 'block';
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const loginAlert = document.getElementById('loginAlert');
            
            // Login user
            const result = loginUser(email, password);
            
            if (result.success) {
                // Show success message and redirect
                showFlashMessage('success', 'Connexion réussie !');
                window.location.href = 'index.html';
            } else {
                // Show error message
                loginAlert.textContent = result.message;
                loginAlert.style.display = 'block';
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Logout user
            logoutUser();
            
            // Show success message and redirect
            showFlashMessage('success', 'Vous avez été déconnecté.');
            window.location.href = 'index.html';
        });
    }
});

// Flash message function
function showFlashMessage(type, message) {
    // Store flash message in session storage
    sessionStorage.setItem('flash_message', JSON.stringify({
        type,
        message
    }));
}

// Check for flash messages on page load
document.addEventListener('DOMContentLoaded', function() {
    const flashMessage = sessionStorage.getItem('flash_message');
    
    if (flashMessage) {
        const { type, message } = JSON.parse(flashMessage);
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show flash-message`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to body
        document.body.appendChild(alertDiv);
        
        // Remove from session storage
        sessionStorage.removeItem('flash_message');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
});