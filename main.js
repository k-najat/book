// main.js - Main functionality for BookExchange

// Initialize tooltips and popovers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Create a hero image SVG placeholder
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-section img');
    if (heroImage && heroImage.src.includes('hero-image.svg')) {
        // Create SVG for hero image
        const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#f8f9fa"/>
            <g transform="translate(100,100)">
                <rect x="0" y="0" width="200" height="300" fill="#4e73df" rx="10" ry="10"/>
                <rect x="220" y="50" width="200" height="300" fill="#1cc88a" rx="10" ry="10"/>
                <rect x="440" y="100" width="200" height="300" fill="#f6c23e" rx="10" ry="10"/>
                <text x="100" y="150" font-family="Arial" font-size="24" text-anchor="middle" fill="white">PRÊT</text>
                <text x="320" y="200" font-family="Arial" font-size="24" text-anchor="middle" fill="white">ÉCHANGE</text>
                <text x="540" y="250" font-family="Arial" font-size="24" text-anchor="middle" fill="white">VENTE</text>
                <g transform="translate(100, 200)">
                    <path d="M-50,-50 L50,-50 L50,50 L-50,50 Z" fill="white" opacity="0.3"/>
                </g>
                <g transform="translate(320, 250)">
                    <path d="M-50,-50 L50,-50 L50,50 L-50,50 Z" fill="white" opacity="0.3"/>
                </g>
                <g transform="translate(540, 300)">
                    <path d="M-50,-50 L50,-50 L50,50 L-50,50 Z" fill="white" opacity="0.3"/>
                </g>
            </g>
        </svg>
        `;
        
        // Create a Blob from the SVG content
        const blob = new Blob([svgContent], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        
        // Set the src attribute to the object URL
        heroImage.src = url;
    }
});

// Initialize message system
document.addEventListener('DOMContentLoaded', function() {
    initMessages();
    
    // Check for unread messages
    updateUnreadMessageCount();
    
    // Load conversations if on messages page
    const conversationsList = document.getElementById('conversationsList');
    if (conversationsList) {
        loadConversations();
        
        // Add event listener for conversation selection
        conversationsList.addEventListener('click', function(e) {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem) {
                const userId = conversationItem.dataset.userId;
                loadConversation(userId);
                
                // Mark as active
                document.querySelectorAll('.conversation-item').forEach(item => {
                    item.classList.remove('active');
                });
                conversationItem.classList.add('active');
            }
        });
    }
    
    // Message form submission
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const recipientId = document.getElementById('recipientId').value;
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value;
            
            if (!message.trim()) {
                return;
            }
            
            // Send message
            const result = sendMessage(recipientId, message);
            
            if (result.success) {
                // Clear input
                messageInput.value = '';
                
                // Reload conversation
                loadConversation(recipientId);
            }
        });
    }
});

// Initialize exchange history
document.addEventListener('DOMContentLoaded', function() {
    const exchangeHistoryTable = document.getElementById('exchangeHistoryTable');
    if (exchangeHistoryTable) {
        loadExchangeHistory();
        
        // Add event listeners for filters
        const typeFilter = document.getElementById('typeFilter');
        const statusFilter = document.getElementById('statusFilter');
        const roleFilter = document.getElementById('roleFilter');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', function() {
                loadExchangeHistory();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                loadExchangeHistory();
            });
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', function() {
                loadExchangeHistory();
            });
        }
    }
});

// Add book form
document.addEventListener('DOMContentLoaded', function() {
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        // Show/hide price field based on book type
        const bookType = document.getElementById('bookType');
        const priceGroup = document.getElementById('priceGroup');
        
        if (bookType && priceGroup) {
            bookType.addEventListener('change', function() {
                if (this.value === 'sale') {
                    priceGroup.style.display = 'block';
                } else {
                    priceGroup.style.display = 'none';
                }
            });
        }
        
        // Form submission
        addBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const description = document.getElementById('bookDescription').value;
            const type = document.getElementById('bookType').value;
            const condition = document.getElementById('bookCondition').value;
            const price = document.getElementById('bookPrice').value;
            const isbn = document.getElementById('bookIsbn').value;
            const publisher = document.getElementById('bookPublisher').value;
            const publicationYear = document.getElementById('bookYear').value;
            const language = document.getElementById('bookLanguage').value;
            const pages = document.getElementById('bookPages').value;
            
            // Get categories
            const categoriesInput = document.getElementById('bookCategories').value;
            const categories = categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat);
            
            // Validate form
            if (!title || !author || !condition || !type) {
                showAlert('addBookAlert', 'danger', 'Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            if (type === 'sale' && (!price || isNaN(price) || price <= 0)) {
                showAlert('addBookAlert', 'danger', 'Veuillez entrer un prix valide.');
                return;
            }
            
            // Create book data
            const bookData = {
                title,
                author,
                description,
                type,
                condition,
                isbn,
                publisher,
                publicationYear,
                language,
                categories,
                pages: pages ? parseInt(pages) : 0
            };
            
            // Add price if type is sale
            if (type === 'sale') {
                bookData.price = parseFloat(price);
            }
            
            // Add book
            const result = addBook(bookData);
            
            if (result.success) {
                showFlashMessage('success', 'Le livre a été ajouté avec succès.');
                window.location.href = 'book-details.html?id=' + result.book.id;
            } else {
                showAlert('addBookAlert', 'danger', result.message);
            }
        });
    }
});

// Profile page
document.addEventListener('DOMContentLoaded', function() {
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer) {
        loadProfile();
        
        // Edit profile form
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form data
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const university = document.getElementById('university').value;
                const studyField = document.getElementById('studyField').value;
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                // Validate form
                if (!username || !email || !university || !studyField) {
                    showAlert('editProfileAlert', 'danger', 'Veuillez remplir tous les champs obligatoires.');
                    return;
                }
                
                // Create user data
                const userData = {
                    username,
                    email,
                    university,
                    studyField
                };
                
                // Check if changing password
                if (newPassword) {
                    if (!currentPassword) {
                        showAlert('editProfileAlert', 'danger', 'Veuillez entrer votre mot de passe actuel.');
                        return;
                    }
                    
                    if (newPassword.length < 8) {
                        showAlert('editProfileAlert', 'danger', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
                        return;
                    }
                    
                    if (newPassword !== confirmPassword) {
                        showAlert('editProfileAlert', 'danger', 'Les mots de passe ne correspondent pas.');
                        return;
                    }
                    
                    // Verify current password
                    const currentUser = getCurrentUser();
                    const users = JSON.parse(localStorage.getItem(USERS_KEY));
                    const user = users.find(u => u.id === currentUser.id);
                    
                    if (!user || user.password !== currentPassword) {
                        showAlert('editProfileAlert', 'danger', 'Mot de passe actuel incorrect.');
                        return;
                    }
                    
                    // Add new password
                    userData.password = newPassword;
                }
                
                // Update profile
                const result = updateUserProfile(userData);
                
                if (result.success) {
                    showFlashMessage('success', 'Votre profil a été mis à jour avec succès.');
                    window.location.reload();
                } else {
                    showAlert('editProfileAlert', 'danger', result.message);
                }
            });
        }
    }
});

// Helper function to show alerts
function showAlert(elementId, type, message) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.className = `alert alert-${type}`;
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        // Scroll to alert
        alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}