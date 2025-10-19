// exchanges.js - Exchange system for BookExchange

// Constants
const EXCHANGES_KEY = 'bookexchange_exchanges';

// Initialize exchanges system
function initExchanges() {
    // Check if exchanges exist in local storage
    if (!localStorage.getItem(EXCHANGES_KEY)) {
        localStorage.setItem(EXCHANGES_KEY, JSON.stringify([]));
    }
}

// Get all exchanges
function getAllExchanges() {
    return JSON.parse(localStorage.getItem(EXCHANGES_KEY) || '[]');
}

// Get exchanges for current user
function getUserExchanges() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return [];
    }
    
    const exchanges = getAllExchanges();
    
    // Filter exchanges for current user (as owner or borrower)
    return exchanges.filter(exchange => 
        exchange.ownerId === currentUser.id || exchange.borrowerId === currentUser.id
    );
}

// Create new exchange
function createExchange(bookId, type, notes = '') {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return { success: false, message: 'Vous devez être connecté pour effectuer un échange.' };
    }
    
    // Get book
    const book = getBookById(bookId);
    
    if (!book) {
        return { success: false, message: 'Livre non trouvé.' };
    }
    
    // Check if book is available
    if (book.status !== 'available') {
        return { success: false, message: 'Ce livre n\'est pas disponible actuellement.' };
    }
    
    // Check if user is not the owner
    if (book.ownerId === currentUser.id) {
        return { success: false, message: 'Vous ne pouvez pas emprunter votre propre livre.' };
    }
    
    // Check if exchange type matches book type
    if (type !== book.type && !(type === 'exchange' && book.type === 'loan')) {
        return { success: false, message: `Ce livre n'est pas disponible pour ${type === 'loan' ? 'un prêt' : type === 'exchange' ? 'un échange' : 'une vente'}.` };
    }
    
    // Create exchange
    const exchange = {
        id: generateId(),
        bookId,
        type,
        ownerId: book.ownerId,
        borrowerId: currentUser.id,
        status: 'pending',
        startDate: new Date().toISOString(),
        endDate: null,
        notes,
        price: type === 'sale' ? book.price : 0,
        returnCondition: null,
        returnNotes: null
    };
    
    // Add exchange to storage
    const exchanges = getAllExchanges();
    exchanges.push(exchange);
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(exchanges));
    
    // Update book status
    updateBookStatus(bookId, 'pending');
    
    return { success: true, exchange };
}

// Update exchange status
function updateExchangeStatus(exchangeId, status, additionalData = {}) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return { success: false, message: 'Vous devez être connecté pour mettre à jour un échange.' };
    }
    
    // Get exchanges
    const exchanges = getAllExchanges();
    const exchangeIndex = exchanges.findIndex(exchange => exchange.id === exchangeId);
    
    if (exchangeIndex === -1) {
        return { success: false, message: 'Échange non trouvé.' };
    }
    
    const exchange = exchanges[exchangeIndex];
    
    // Check if user is owner or borrower
    if (exchange.ownerId !== currentUser.id && exchange.borrowerId !== currentUser.id) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à mettre à jour cet échange.' };
    }
    
    // Check valid status transitions
    const validTransitions = {
        'pending': ['active', 'cancelled'],
        'active': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
    };
    
    if (!validTransitions[exchange.status].includes(status)) {
        return { success: false, message: `Impossible de passer du statut ${exchange.status} à ${status}.` };
    }
    
    // Update exchange
    exchanges[exchangeIndex].status = status;
    
    // Add additional data
    for (const key in additionalData) {
        exchanges[exchangeIndex][key] = additionalData[key];
    }
    
    // If completing or cancelling, set end date
    if (status === 'completed' || status === 'cancelled') {
        exchanges[exchangeIndex].endDate = new Date().toISOString();
    }
    
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(exchanges));
    
    // Update book status
    const bookStatus = status === 'active' ? 'borrowed' : 
                      status === 'completed' || status === 'cancelled' ? 'available' : 
                      'pending';
    
    updateBookStatus(exchange.bookId, bookStatus);
    
    return { success: true, exchange: exchanges[exchangeIndex] };
}

// Accept exchange request
function acceptExchange(exchangeId) {
    return updateExchangeStatus(exchangeId, 'active');
}

// Complete exchange
function completeExchange(exchangeId, returnCondition, returnNotes) {
    return updateExchangeStatus(exchangeId, 'completed', { returnCondition, returnNotes });
}

// Cancel exchange
function cancelExchange(exchangeId, cancelReason) {
    return updateExchangeStatus(exchangeId, 'cancelled', { cancelReason });
}

// Load exchange history
function loadExchangeHistory() {
    const currentUser = getCurrentUser();
    const exchangeHistoryTable = document.getElementById('exchangeHistoryTable');
    
    if (!currentUser || !exchangeHistoryTable) {
        return;
    }
    
    // Get filters
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const roleFilter = document.getElementById('roleFilter');
    
    const typeValue = typeFilter ? typeFilter.value : 'all';
    const statusValue = statusFilter ? statusFilter.value : 'all';
    const roleValue = roleFilter ? roleFilter.value : 'all';
    
    // Get user exchanges
    let exchanges = getUserExchanges();
    
    // Apply filters
    if (typeValue !== 'all') {
        exchanges = exchanges.filter(exchange => exchange.type === typeValue);
    }
    
    if (statusValue !== 'all') {
        exchanges = exchanges.filter(exchange => exchange.status === statusValue);
    }
    
    if (roleValue !== 'all') {
        if (roleValue === 'owner') {
            exchanges = exchanges.filter(exchange => exchange.ownerId === currentUser.id);
        } else if (roleValue === 'borrower') {
            exchanges = exchanges.filter(exchange => exchange.borrowerId === currentUser.id);
        }
    }
    
    // Sort by date (newest first)
    exchanges.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    // Clear table
    exchangeHistoryTable.innerHTML = '';
    
    if (exchanges.length === 0) {
        exchangeHistoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <p class="mb-0">Aucun échange trouvé</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Add exchanges to table
    exchanges.forEach(exchange => {
        // Get book and users
        const book = getBookById(exchange.bookId);
        const owner = getUserById(exchange.ownerId);
        const borrower = getUserById(exchange.borrowerId);
        
        if (!book || !owner || !borrower) {
            return;
        }
        
        // Determine other user
        const otherUser = exchange.ownerId === currentUser.id ? borrower : owner;
        const userRole = exchange.ownerId === currentUser.id ? 'owner' : 'borrower';
        
        // Create row
        const row = document.createElement('tr');
        
        // Type badge
        const typeBadge = getTypeBadge(exchange.type);
        
        // Status badge
        const statusBadge = getStatusBadge(exchange.status);
        
        // Actions
        let actions = `
            <button class="btn btn-sm btn-outline-primary view-exchange-btn" data-exchange-id="${exchange.id}">
                <i class="fas fa-eye"></i> Détails
            </button>
        `;
        
        // Add action buttons based on status and role
        if (exchange.status === 'pending') {
            if (userRole === 'owner') {
                actions += `
                    <button class="btn btn-sm btn-success ms-1 accept-exchange-btn" data-exchange-id="${exchange.id}">
                        <i class="fas fa-check"></i> Accepter
                    </button>
                    <button class="btn btn-sm btn-danger ms-1 cancel-exchange-btn" data-exchange-id="${exchange.id}">
                        <i class="fas fa-times"></i> Refuser
                    </button>
                `;
            } else {
                actions += `
                    <button class="btn btn-sm btn-danger ms-1 cancel-exchange-btn" data-exchange-id="${exchange.id}">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                `;
            }
        } else if (exchange.status === 'active') {
            if (userRole === 'owner') {
                actions += `
                    <button class="btn btn-sm btn-success ms-1 return-exchange-btn" data-exchange-id="${exchange.id}">
                        <i class="fas fa-undo"></i> Confirmer retour
                    </button>
                `;
            }
        }
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="book-cover-small me-2">
                        <img src="${book.coverUrl || 'assets/images/book-placeholder.svg'}" alt="${book.title}" class="img-fluid">
                    </div>
                    <div>
                        <div class="fw-bold">${book.title}</div>
                        <div class="text-muted small">${book.author}</div>
                    </div>
                </div>
            </td>
            <td>${typeBadge}</td>
            <td>
                <a href="profile.html?id=${otherUser.id}" class="text-decoration-none">
                    ${otherUser.username}
                </a>
            </td>
            <td>${formatDate(exchange.startDate)}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        `;
        
        exchangeHistoryTable.appendChild(row);
    });
    
    // Add event listeners
    addExchangeEventListeners();
}

// Add event listeners for exchange actions
function addExchangeEventListeners() {
    // View exchange details
    document.querySelectorAll('.view-exchange-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exchangeId = this.dataset.exchangeId;
            showExchangeDetails(exchangeId);
        });
    });
    
    // Accept exchange
    document.querySelectorAll('.accept-exchange-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exchangeId = this.dataset.exchangeId;
            const result = acceptExchange(exchangeId);
            
            if (result.success) {
                showFlashMessage('success', 'Échange accepté avec succès.');
                loadExchangeHistory();
            } else {
                showFlashMessage('danger', result.message);
            }
        });
    });
    
    // Cancel exchange
    document.querySelectorAll('.cancel-exchange-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exchangeId = this.dataset.exchangeId;
            const result = cancelExchange(exchangeId, 'Annulé par l\'utilisateur');
            
            if (result.success) {
                showFlashMessage('success', 'Échange annulé avec succès.');
                loadExchangeHistory();
            } else {
                showFlashMessage('danger', result.message);
            }
        });
    });
    
    // Return exchange
    document.querySelectorAll('.return-exchange-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exchangeId = this.dataset.exchangeId;
            showReturnModal(exchangeId);
        });
    });
}

// Show exchange details
function showExchangeDetails(exchangeId) {
    const exchange = getAllExchanges().find(ex => ex.id === exchangeId);
    
    if (!exchange) {
        return;
    }
    
    // Get book and users
    const book = getBookById(exchange.bookId);
    const owner = getUserById(exchange.ownerId);
    const borrower = getUserById(exchange.borrowerId);
    
    if (!book || !owner || !borrower) {
        return;
    }
    
    // Update modal content
    document.querySelector('.exchange-book-title').textContent = book.title;
    document.querySelector('.exchange-book-author').textContent = book.author;
    document.querySelector('.exchange-type').textContent = getTypeText(exchange.type);
    document.querySelector('.exchange-status').textContent = getStatusText(exchange.status);
    document.querySelector('.exchange-start-date').textContent = formatDate(exchange.startDate);
    document.querySelector('.exchange-end-date').textContent = exchange.endDate ? formatDate(exchange.endDate) : '-';
    document.querySelector('.exchange-owner').textContent = owner.username;
    document.querySelector('.exchange-borrower').textContent = borrower.username;
    
    // Show/hide price
    const priceRow = document.querySelector('.exchange-price-row');
    if (exchange.type === 'sale') {
        priceRow.classList.remove('d-none');
        document.querySelector('.exchange-price').textContent = `${exchange.price} €`;
    } else {
        priceRow.classList.add('d-none');
    }
    
    // Notes
    document.querySelector('.exchange-notes').textContent = exchange.notes || '-';
    
    // Book cover
    const bookCover = document.querySelector('.book-cover');
    if (bookCover) {
        bookCover.src = book.coverUrl || 'assets/images/book-placeholder.svg';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('exchangeDetailsModal'));
    modal.show();
}

// Show return modal
function showReturnModal(exchangeId) {
    const exchange = getAllExchanges().find(ex => ex.id === exchangeId);
    
    if (!exchange) {
        return;
    }
    
    // Get book
    const book = getBookById(exchange.bookId);
    
    if (!book) {
        return;
    }
    
    // Update modal content
    document.querySelector('.return-book-title').textContent = book.title;
    
    // Set exchange ID
    document.querySelector('.confirm-return-btn').dataset.exchangeId = exchangeId;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('confirmReturnModal'));
    modal.show();
    
    // Add event listener for confirm button
    document.querySelector('.confirm-return-btn').addEventListener('click', function() {
        const exchangeId = this.dataset.exchangeId;
        const returnCondition = document.getElementById('returnCondition').value;
        const returnNotes = document.getElementById('returnNotes').value;
        
        const result = completeExchange(exchangeId, returnCondition, returnNotes);
        
        if (result.success) {
            // Hide modal
            modal.hide();
            
            showFlashMessage('success', 'Retour confirmé avec succès.');
            loadExchangeHistory();
        } else {
            showFlashMessage('danger', result.message);
        }
    });
}

// Helper functions
function getTypeBadge(type) {
    const classes = {
        'loan': 'bg-primary',
        'exchange': 'bg-success',
        'sale': 'bg-warning text-dark'
    };
    
    const texts = {
        'loan': 'Prêt',
        'exchange': 'Échange',
        'sale': 'Vente'
    };
    
    return `<span class="badge ${classes[type]}">${texts[type]}</span>`;
}

function getStatusBadge(status) {
    const classes = {
        'pending': 'bg-warning text-dark',
        'active': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger'
    };
    
    const texts = {
        'pending': 'En attente',
        'active': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    
    return `<span class="badge ${classes[status]}">${texts[status]}</span>`;
}

function getTypeText(type) {
    const texts = {
        'loan': 'Prêt',
        'exchange': 'Échange',
        'sale': 'Vente'
    };
    
    return texts[type] || type;
}

function getStatusText(status) {
    const texts = {
        'pending': 'En attente',
        'active': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    
    return texts[status] || status;
}

// Initialize exchanges on page load
document.addEventListener('DOMContentLoaded', function() {
    initExchanges();
});