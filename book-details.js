// book-details.js - Book details functionality for BookExchange

// Get book ID from URL
function getBookIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load book details
function loadBookDetails() {
    const bookId = getBookIdFromUrl();
    
    if (!bookId) {
        showFlashMessage('danger', 'Livre non trouvé.');
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
        return;
    }
    
    const book = getBookById(bookId);
    
    if (!book) {
        showFlashMessage('danger', 'Livre non trouvé.');
        setTimeout(() => {
            window.location.href = 'catalog.html';
        }, 2000);
        return;
    }
    
    // Set book details
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookDescription').textContent = book.description || 'Aucune description disponible.';
    
    // Set book cover
    const bookCover = document.getElementById('bookCover');
    if (bookCover) {
        // Utiliser les images du dossier assets/images en fonction du titre du livre
        if (book.title === 'Le Seigneur des Anneaux') {
            bookCover.src = 'le-seigneur-des-anneaux.jpg';
        } else if (book.title === '1984') {
            bookCover.src = '/1984.jpeg';
        } else if (book.title === 'L\'Étranger') {
            bookCover.src = 'etr.jpeg';
        } else if (book.title === 'Harry Potter à l\'école des sorciers') {
            bookCover.src = 'OIP.webp';
        } else {
            // Mettre à jour la propriété coverUrl dans l'objet book pour les autres livres
            book.coverUrl = 'assets/images/acc.svg';
            bookCover.src = book.coverUrl;
        }
        bookCover.alt = book.title;
    }
    
    // Set book status badge
    const bookStatusBadge = document.getElementById('bookStatusBadge');
    if (bookStatusBadge) {
        let statusClass = '';
        let statusText = '';
        
        switch (book.status) {
            case 'available':
                statusClass = 'badge-available';
                statusText = 'Disponible';
                break;
            case 'pending':
                statusClass = 'badge-pending';
                statusText = 'En attente';
                break;
            case 'borrowed':
                statusClass = 'badge-borrowed';
                statusText = 'Emprunté';
                break;
            default:
                statusClass = 'badge-unavailable';
                statusText = 'Non disponible';
        }
        
        bookStatusBadge.className = `book-status-badge ${statusClass}`;
        bookStatusBadge.textContent = statusText;
    }
    
    // Set book type badge
    const bookTypeBadge = document.getElementById('bookTypeBadge');
    if (bookTypeBadge) {
        let typeClass = '';
        let typeText = '';
        
        switch (book.type) {
            case 'loan':
                typeClass = 'badge bg-primary';
                typeText = 'Prêt';
                break;
            case 'exchange':
                typeClass = 'badge bg-success';
                typeText = 'Échange';
                break;
            case 'sale':
                typeClass = 'badge bg-warning text-dark';
                typeText = 'Vente';
                break;
            default:
                typeClass = 'badge bg-secondary';
                typeText = 'Non spécifié';
        }
        
        bookTypeBadge.className = typeClass;
        bookTypeBadge.textContent = typeText;
    }
    
    // Set additional book details
    document.getElementById('bookIsbn').textContent = book.isbn || '-';
    document.getElementById('bookPublisher').textContent = book.publisher || '-';
    document.getElementById('bookYear').textContent = book.year || '-';
    document.getElementById('bookLanguage').textContent = book.language || '-';
    document.getElementById('bookPages').textContent = book.pages || '-';
    document.getElementById('bookCondition').textContent = book.condition || '-';
    document.getElementById('bookCategories').textContent = book.categories ? book.categories.join(', ') : '-';
    
    // Show price if book is for sale
    const bookPriceSection = document.querySelector('.book-price-section');
    if (book.type === 'sale' && book.price) {
        bookPriceSection.classList.remove('d-none');
        document.getElementById('bookPrice').textContent = book.price;
    } else {
        bookPriceSection.classList.add('d-none');
    }
    
    // Set owner information
    const owner = getUserById(book.ownerId);
    if (owner) {
        document.getElementById('ownerUsername').textContent = owner.username;
        document.getElementById('ownerUsername').href = `profile.html?id=${owner.id}`;
        document.getElementById('ownerUniversity').textContent = owner.university || '-';
    }
    
    // Show appropriate action buttons
    const currentUser = getCurrentUser();
    const userActions = document.getElementById('userActions');
    const ownerActions = document.getElementById('ownerActions');
    const guestActions = document.getElementById('guestActions');
    
    if (currentUser) {
        // Hide guest actions
        guestActions.classList.add('d-none');
        
        if (currentUser.id === book.ownerId) {
            // Show owner actions
            ownerActions.classList.remove('d-none');
            userActions.classList.add('d-none');
        } else {
            // Show user actions
            userActions.classList.remove('d-none');
            ownerActions.classList.add('d-none');
            
            // Show/hide buttons based on book type and status
            const requestLoanBtn = document.getElementById('requestLoanBtn');
            const requestExchangeBtn = document.getElementById('requestExchangeBtn');
            const buyBtn = document.getElementById('buyBtn');
            
            // Disable buttons if book is not available
            if (book.status !== 'available') {
                requestLoanBtn.disabled = true;
                requestExchangeBtn.disabled = true;
                buyBtn.disabled = true;
            }
            
            // Show/hide buttons based on book type
            if (book.type === 'loan' || book.type === 'exchange') {
                requestLoanBtn.classList.remove('d-none');
            } else {
                requestLoanBtn.classList.add('d-none');
            }
            
            if (book.type === 'exchange') {
                requestExchangeBtn.classList.remove('d-none');
            } else {
                requestExchangeBtn.classList.add('d-none');
            }
            
            if (book.type === 'sale') {
                buyBtn.classList.remove('d-none');
            } else {
                buyBtn.classList.add('d-none');
            }
        }
    } else {
        // Show guest actions
        guestActions.classList.remove('d-none');
        userActions.classList.add('d-none');
        ownerActions.classList.add('d-none');
    }
}

// Handle exchange request
function handleExchangeRequest(type) {
    const bookId = getBookIdFromUrl();
    const book = getBookById(bookId);
    
    if (!book) {
        showFlashMessage('danger', 'Livre non trouvé.');
        return;
    }
    
    // Set modal title based on exchange type
    const modalTitle = document.getElementById('exchangeModalTitle');
    if (type === 'loan') {
        modalTitle.textContent = 'Demande de prêt';
    } else if (type === 'exchange') {
        modalTitle.textContent = 'Proposition d\'échange';
    } else if (type === 'sale') {
        modalTitle.textContent = 'Achat du livre';
    }
    
    // Set exchange type
    document.getElementById('exchangeType').value = type;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('exchangeModal'));
    modal.show();
}

// Submit exchange request
function submitExchangeRequest() {
    const bookId = getBookIdFromUrl();
    const type = document.getElementById('exchangeType').value;
    const notes = document.getElementById('exchangeNotes').value;
    
    // Create exchange
    const result = createExchange(bookId, type, notes);
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('exchangeModal'));
    modal.hide();
    
    if (result.success) {
        showFlashMessage('success', `Votre demande a été envoyée avec succès.`);
        
        // Create message to owner
        const book = getBookById(bookId);
        if (book) {
            const currentUser = getCurrentUser();
            const messageText = `J'ai fait une demande de ${type === 'loan' ? 'prêt' : type === 'exchange' ? 'échange' : 'achat'} pour votre livre "${book.title}". ${notes}`;
            
            sendMessage(book.ownerId, messageText);
        }
        
        // Reload page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        showFlashMessage('danger', result.message);
    }
}

// Handle contact owner
function handleContactOwner() {
    const bookId = getBookIdFromUrl();
    const book = getBookById(bookId);
    
    if (!book) {
        showFlashMessage('danger', 'Livre non trouvé.');
        return;
    }
    
    // Redirect to messages page with conversation with owner
    window.location.href = `messages.html?userId=${book.ownerId}`;
}

// Handle edit book
function handleEditBook() {
    const bookId = getBookIdFromUrl();
    
    // Redirect to add-book page with book ID
    window.location.href = `add-book.html?id=${bookId}`;
}

// Handle delete book
function handleDeleteBook() {
    const bookId = getBookIdFromUrl();
    
    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
    
    // Set up confirm button
    document.getElementById('confirmDeleteBtn').onclick = function() {
        // Delete book
        const result = deleteBook(bookId);
        
        // Hide modal
        modal.hide();
        
        if (result.success) {
            showFlashMessage('success', 'Livre supprimé avec succès.');
            
            // Redirect to catalog after a short delay
            setTimeout(() => {
                window.location.href = 'catalog.html';
            }, 2000);
        } else {
            showFlashMessage('danger', result.message);
        }
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load book details
    loadBookDetails();
    
    // Set up event listeners
    document.getElementById('requestLoanBtn')?.addEventListener('click', () => handleExchangeRequest('loan'));
    document.getElementById('requestExchangeBtn')?.addEventListener('click', () => handleExchangeRequest('exchange'));
    document.getElementById('buyBtn')?.addEventListener('click', () => handleExchangeRequest('sale'));
    document.getElementById('contactOwnerBtn')?.addEventListener('click', handleContactOwner);
    document.getElementById('editBookBtn')?.addEventListener('click', handleEditBook);
    document.getElementById('deleteBookBtn')?.addEventListener('click', handleDeleteBook);
    document.getElementById('submitExchangeBtn')?.addEventListener('click', submitExchangeRequest);
});
