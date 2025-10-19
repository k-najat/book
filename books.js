// books.js - Book management functionality for BookExchange

// Local storage keys
const BOOKS_KEY = 'bookexchange_books';

// Initialize books if not exists
function initBooks() {
    if (!localStorage.getItem(BOOKS_KEY)) {
        // Create sample books
        const sampleBooks = [
            {
                id: '1',
                title: 'Le Seigneur des Anneaux',
                author: 'J.R.R. Tolkien',
                description: 'L\'histoire de Frodon Sacquet, chargé de détruire l\'Anneau unique pour sauver la Terre du Milieu.',
                type: 'loan', // prêt
                condition: 'Très bon état',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '1',
                ownerName: 'Marie Dupont',
                addedDate: '2023-05-15T10:30:00Z',
                isbn: '9782070612888',
                publisher: 'Pocket',
                publicationYear: '2002',
                language: 'Français',
                categories: ['Fantasy', 'Aventure'],
                pages: 528
            },
            {
                id: '2',
                title: 'Harry Potter à l\'école des sorciers',
                author: 'J.K. Rowling',
                description: 'Le premier tome des aventures du jeune sorcier Harry Potter à Poudlard.',
                type: 'sale', // vente
                price: 10,
                condition: 'Bon état',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '2',
                ownerName: 'Thomas Martin',
                addedDate: '2023-06-20T14:15:00Z',
                isbn: '9782070643028',
                publisher: 'Gallimard',
                publicationYear: '2003',
                language: 'Français',
                categories: ['Fantasy', 'Jeunesse'],
                pages: 320
            },
            {
                id: '3',
                title: '1984',
                author: 'George Orwell',
                description: 'Un roman dystopique qui décrit un futur où la société est soumise à une dictature totalitaire.',
                type: 'exchange', // échange
                condition: 'Bon état',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '3',
                ownerName: 'Sophie Bernard',
                addedDate: '2023-07-05T09:45:00Z',
                isbn: '9782070368228',
                publisher: 'Gallimard',
                publicationYear: '1972',
                language: 'Français',
                categories: ['Science-fiction', 'Dystopie'],
                pages: 438
            },
            {
                id: '4',
                title: 'L\'Étranger',
                author: 'Albert Camus',
                description: 'Roman emblématique de l\'absurde qui raconte l\'histoire de Meursault.',
                type: 'loan', // prêt
                condition: 'État moyen',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '1',
                ownerName: 'Marie Dupont',
                addedDate: '2023-07-10T16:20:00Z',
                isbn: '9782070360024',
                publisher: 'Gallimard',
                publicationYear: '1957',
                language: 'Français',
                categories: ['Roman', 'Philosophie'],
                pages: 184
            },
            {
                id: '5',
                title: 'Les Misérables',
                author: 'Victor Hugo',
                description: 'Un roman historique qui suit la vie de Jean Valjean dans la France du 19e siècle.',
                type: 'exchange', // échange
                condition: 'Usé',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '2',
                ownerName: 'Thomas Martin',
                addedDate: '2023-08-01T11:10:00Z',
                isbn: '9782253096344',
                publisher: 'Le Livre de Poche',
                publicationYear: '1985',
                language: 'Français',
                categories: ['Roman historique', 'Classique'],
                pages: 1792
            },
            {
                id: '6',
                title: 'Dune',
                author: 'Frank Herbert',
                description: 'Un chef-d\'œuvre de science-fiction qui se déroule sur la planète désertique Arrakis.',
                type: 'sale', // vente
                price: 15,
                condition: 'Comme neuf',
                status: 'available',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '3',
                ownerName: 'Sophie Bernard',
                addedDate: '2023-08-15T13:25:00Z',
                isbn: '9782266233200',
                publisher: 'Pocket',
                publicationYear: '2012',
                language: 'Français',
                categories: ['Science-fiction', 'Space Opera'],
                pages: 752
            },
            {
                id: '7',
                title: 'Le Petit Prince',
                author: 'Antoine de Saint-Exupéry',
                description: 'Un conte poétique et philosophique sous l\'apparence d\'un conte pour enfants.',
                type: 'loan', // prêt
                condition: 'Bon état',
                status: 'borrowed',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '1',
                ownerName: 'Marie Dupont',
                addedDate: '2023-09-01T10:00:00Z',
                isbn: '9782070612758',
                publisher: 'Gallimard',
                publicationYear: '1999',
                language: 'Français',
                categories: ['Conte', 'Philosophie'],
                pages: 96
            },
            {
                id: '8',
                title: 'Fondation',
                author: 'Isaac Asimov',
                description: 'Premier tome de la saga Fondation, une œuvre majeure de la science-fiction.',
                type: 'exchange', // échange
                condition: 'Très bon état',
                status: 'unavailable',
                coverImage: 'https://via.placeholder.com/300x400',
                ownerId: '2',
                ownerName: 'Thomas Martin',
                addedDate: '2023-09-10T15:30:00Z',
                isbn: '9782070415700',
                publisher: 'Gallimard',
                publicationYear: '2000',
                language: 'Français',
                categories: ['Science-fiction'],
                pages: 256
            }
        ];
        
        localStorage.setItem(BOOKS_KEY, JSON.stringify(sampleBooks));
    }
}

// Get all books
function getAllBooks() {
    initBooks();
    return JSON.parse(localStorage.getItem(BOOKS_KEY));
}

// Get book by ID
function getBookById(id) {
    const books = getAllBooks();
    return books.find(book => book.id === id);
}

// Get books by owner ID
function getBooksByOwnerId(ownerId) {
    const books = getAllBooks();
    return books.filter(book => book.ownerId === ownerId);
}

// Get recent books (limited number)
function getRecentBooks(limit = 4) {
    const books = getAllBooks();
    // Sort by added date (newest first)
    return books
        .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
        .slice(0, limit);
}

// Add new book
function addBook(bookData) {
    const books = getAllBooks();
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return {
            success: false,
            message: 'Vous devez être connecté pour ajouter un livre.'
        };
    }
    
    // Create new book with ID
    const newBook = {
        id: Date.now().toString(),
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        type: bookData.type,
        condition: bookData.condition,
        status: 'available',
        coverImage: bookData.coverImage || 'https://via.placeholder.com/300x400',
        ownerId: currentUser.id,
        ownerName: currentUser.username,
        addedDate: new Date().toISOString(),
        isbn: bookData.isbn || '',
        publisher: bookData.publisher || '',
        publicationYear: bookData.publicationYear || '',
        language: bookData.language || 'Français',
        categories: bookData.categories || [],
        pages: bookData.pages || 0
    };
    
    // Add price if type is sale
    if (bookData.type === 'sale' && bookData.price) {
        newBook.price = parseFloat(bookData.price);
    }
    
    // Add book to array
    books.push(newBook);
    
    // Save updated books array
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    
    // Update user's book count
    updateUserBookCount(currentUser.id);
    
    return {
        success: true,
        book: newBook
    };
}

// Update book
function updateBook(id, bookData) {
    const books = getAllBooks();
    const index = books.findIndex(book => book.id === id);
    
    if (index === -1) {
        return {
            success: false,
            message: 'Livre non trouvé.'
        };
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser || books[index].ownerId !== currentUser.id) {
        return {
            success: false,
            message: 'Vous n\'êtes pas autorisé à modifier ce livre.'
        };
    }
    
    // Update book data
    books[index] = {
        ...books[index],
        ...bookData
    };
    
    // Save updated books array
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    
    return {
        success: true,
        book: books[index]
    };
}

// Delete book
function deleteBook(id) {
    const books = getAllBooks();
    const index = books.findIndex(book => book.id === id);
    
    if (index === -1) {
        return {
            success: false,
            message: 'Livre non trouvé.'
        };
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser || books[index].ownerId !== currentUser.id) {
        return {
            success: false,
            message: 'Vous n\'êtes pas autorisé à supprimer ce livre.'
        };
    }
    
    // Remove book from array
    books.splice(index, 1);
    
    // Save updated books array
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    
    // Update user's book count
    updateUserBookCount(currentUser.id);
    
    return {
        success: true
    };
}

// Update user's book count
function updateUserBookCount(userId) {
    const books = getAllBooks();
    const userBooks = books.filter(book => book.ownerId === userId);
    
    // Get all users
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].booksAdded = userBooks.length;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Update current user session if it's the same user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.booksAdded = userBooks.length;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }
}

// Search and filter books
function searchBooks(query = '', filters = {}) {
    let books = getAllBooks();
    
    // Search by title or author
    if (query) {
        const searchTerm = query.toLowerCase();
        books = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by type
    if (filters.type) {
        books = books.filter(book => book.type === filters.type);
    }
    
    // Filter by status
    if (filters.status) {
        books = books.filter(book => book.status === filters.status);
    }
    
    return books;
}

// Initialize books on page load
document.addEventListener('DOMContentLoaded', function() {
    initBooks();
    
    // Load books for catalog page
    const bookList = document.getElementById('bookList');
    if (bookList) {
        loadCatalog();
        
        // Add event listeners for search and filters
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const typeFilter = document.getElementById('typeFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                loadCatalog();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    loadCatalog();
                }
            });
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', function() {
                loadCatalog();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                loadCatalog();
            });
        }
    }
    
    // Load recent books for home page
    const recentBooks = document.getElementById('recentBooks');
    if (recentBooks && recentBooks.children.length <= 1) {
        loadRecentBooks();
    }
    
    // Load book details for book details page
    const bookDetailsContainer = document.getElementById('bookDetails');
    if (bookDetailsContainer) {
        loadBookDetails();
    }
});

// Load catalog with search and filters
function loadCatalog() {
    const bookList = document.getElementById('bookList');
    if (!bookList) return;
    
    // Get search and filter values
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const query = searchInput ? searchInput.value : '';
    const filters = {
        type: typeFilter ? typeFilter.value : '',
        status: statusFilter ? statusFilter.value : ''
    };
    
    // Search books
    const books = searchBooks(query, filters);
    
    // Clear current list
    bookList.innerHTML = '';
    
    if (books.length === 0) {
        bookList.innerHTML = '<div class="col-12"><div class="alert alert-info">Aucun livre ne correspond à votre recherche.</div></div>';
        return;
    }
    
    // Get book card template
    const template = document.getElementById('bookCardTemplate');
    
    // Add books to list
    books.forEach(book => {
        // Clone template
        const bookCard = template.content.cloneNode(true);
        
        // Set book data
        const img = bookCard.querySelector('.book-cover');
        img.src = book.coverImage;
        img.alt = `Couverture de ${book.title}`;
        
        const status = bookCard.querySelector('.book-status');
        status.textContent = getStatusText(book.status);
        status.className = `book-status status-${book.status}`;
        
        bookCard.querySelector('.book-title').textContent = book.title;
        bookCard.querySelector('.book-author').textContent = book.author;
        
        const typeCondition = bookCard.querySelector('.book-type-condition small');
        if (book.type === 'sale') {
            typeCondition.textContent = `Vente - ${book.price}€ - ${book.condition}`;
        } else if (book.type === 'exchange') {
            typeCondition.textContent = `Échange - ${book.condition}`;
        } else {
            typeCondition.textContent = `Prêt - ${book.condition}`;
        }
        
        const detailsLink = bookCard.querySelector('.book-details-link');
        detailsLink.href = `book-details.html?id=${book.id}`;
        
        // Add to list
        bookList.appendChild(bookCard);
    });
}

// Load recent books for home page
function loadRecentBooks() {
    const recentBooksContainer = document.getElementById('recentBooks');
    if (!recentBooksContainer) return;
    
    // Clear container (except for placeholder books)
    recentBooksContainer.innerHTML = '';
    
    // Get recent books
    const recentBooks = getRecentBooks(4);
    
    // Add books to container
    recentBooks.forEach(book => {
        const bookCol = document.createElement('div');
        bookCol.className = 'col-md-3';
        
        bookCol.innerHTML = `
            <div class="card book-card h-100">
                <div class="position-relative">
                    <img src="${book.coverImage}" class="card-img-top" alt="Couverture de ${book.title}">
                    <span class="book-status status-${book.status}">${getStatusText(book.status)}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="book-author">${book.author}</p>
                    <p class="card-text"><small class="text-muted">${getBookTypeText(book)}</small></p>
                    <a href="book-details.html?id=${book.id}" class="btn btn-sm btn-primary">Voir détails</a>
                </div>
            </div>
        `;
        
        recentBooksContainer.appendChild(bookCol);
    });
}

// Load book details
function loadBookDetails() {
    // Get book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        window.location.href = 'catalog.html';
        return;
    }
    
    // Get book
    const book = getBookById(bookId);
    
    if (!book) {
        document.getElementById('bookDetails').innerHTML = `
            <div class="alert alert-danger">
                Ce livre n'existe pas ou a été supprimé.
                <a href="catalog.html" class="btn btn-primary mt-3">Retour au catalogue</a>
            </div>
        `;
        return;
    }
    
    // Update page title
    document.title = `${book.title} - BookExchange`;
    
    // Update book details
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookCover').src = book.coverImage;
    document.getElementById('bookCover').alt = `Couverture de ${book.title}`;
    document.getElementById('bookDescription').textContent = book.description;
    document.getElementById('bookType').textContent = getTypeText(book.type);
    document.getElementById('bookCondition').textContent = book.condition;
    document.getElementById('bookStatus').textContent = getStatusText(book.status);
    document.getElementById('bookStatus').className = `badge bg-${getStatusClass(book.status)}`;
    
    // Additional details if available
    if (book.isbn) document.getElementById('bookIsbn').textContent = book.isbn;
    if (book.publisher) document.getElementById('bookPublisher').textContent = book.publisher;
    if (book.publicationYear) document.getElementById('bookYear').textContent = book.publicationYear;
    if (book.language) document.getElementById('bookLanguage').textContent = book.language;
    if (book.pages) document.getElementById('bookPages').textContent = book.pages;
    
    // Categories
    if (book.categories && book.categories.length > 0) {
        const categoriesContainer = document.getElementById('bookCategories');
        categoriesContainer.innerHTML = '';
        
        book.categories.forEach(category => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary me-1';
            badge.textContent = category;
            categoriesContainer.appendChild(badge);
        });
    }
    
    // Price if sale
    if (book.type === 'sale' && book.price) {
        document.getElementById('bookPrice').textContent = `${book.price} €`;
        document.getElementById('priceSection').style.display = 'block';
    } else {
        document.getElementById('priceSection').style.display = 'none';
    }
    
    // Owner info
    document.getElementById('ownerName').textContent = book.ownerName;
    document.getElementById('ownerLink').href = `profile.html?id=${book.ownerId}`;
    
    // Contact form visibility
    const contactForm = document.getElementById('contactForm');
    const contactSection = document.getElementById('contactSection');
    
    if (contactForm && contactSection) {
        const currentUser = getCurrentUser();
        
        if (currentUser) {
            // User is logged in
            if (currentUser.id === book.ownerId) {
                // User is the owner
                contactSection.innerHTML = `
                    <div class="alert alert-info">
                        C'est votre livre. <a href="#" id="editBookBtn" class="alert-link">Modifier</a> ou <a href="#" id="deleteBookBtn" class="alert-link">Supprimer</a>
                    </div>
                `;
                
                // Add event listeners for edit and delete
                document.getElementById('editBookBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = `edit-book.html?id=${book.id}`;
                });
                
                document.getElementById('deleteBookBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
                        const result = deleteBook(book.id);
                        if (result.success) {
                            showFlashMessage('success', 'Le livre a été supprimé avec succès.');
                            window.location.href = 'catalog.html';
                        } else {
                            showFlashMessage('danger', result.message);
                        }
                    }
                });
            } else {
                // User is not the owner
                contactSection.style.display = 'block';
                
                // Set recipient ID in hidden field
                document.getElementById('recipientId').value = book.ownerId;
                
                // Add event listener for contact form
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const message = document.getElementById('message').value;
                    
                    if (!message.trim()) {
                        alert('Veuillez entrer un message.');
                        return;
                    }
                    
                    // Send message
                    const result = sendMessage(book.ownerId, message, book.title);
                    
                    if (result.success) {
                        showFlashMessage('success', 'Votre message a été envoyé.');
                        contactForm.reset();
                    } else {
                        showFlashMessage('danger', result.message);
                    }
                });
            }
        } else {
            // User is not logged in
            contactSection.innerHTML = `
                <div class="alert alert-warning">
                    Vous devez être <a href="login.html" class="alert-link">connecté</a> pour contacter le propriétaire.
                </div>
            `;
        }
    }
}

// Helper functions
function getStatusText(status) {
    switch (status) {
        case 'available':
            return 'Disponible';
        case 'borrowed':
            return 'Emprunté';
        case 'unavailable':
            return 'Non disponible';
        default:
            return 'Inconnu';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'available':
            return 'success';
        case 'borrowed':
            return 'warning';
        case 'unavailable':
            return 'danger';
        default:
            return 'secondary';
    }
}

function getTypeText(type) {
    switch (type) {
        case 'loan':
            return 'Prêt';
        case 'exchange':
            return 'Échange';
        case 'sale':
            return 'Vente';
        default:
            return 'Inconnu';
    }
}

function getBookTypeText(book) {
    if (book.type === 'sale') {
        return `Vente - ${book.price}€ - ${book.condition}`;
    } else if (book.type === 'exchange') {
        return `Échange - ${book.condition}`;
    } else {
        return `Prêt - ${book.condition}`;
    }
}