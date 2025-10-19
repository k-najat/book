// messages.js - Messaging system for BookExchange

// Constants
const MESSAGES_KEY = 'bookexchange_messages';
const CONVERSATIONS_KEY = 'bookexchange_conversations';

// Initialize messages system
function initMessages() {
    // Check if messages exist in local storage
    if (!localStorage.getItem(MESSAGES_KEY)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }
    
    // Check if conversations exist in local storage
    if (!localStorage.getItem(CONVERSATIONS_KEY)) {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify([]));
    }
}

// Get all messages
function getAllMessages() {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
}

// Get all conversations
function getAllConversations() {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]');
}

// Get conversation by user ID
function getConversation(userId) {
    const conversations = getAllConversations();
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return null;
    }
    
    // Find conversation between current user and specified user
    return conversations.find(conv => 
        (conv.user1Id === currentUser.id && conv.user2Id === userId) || 
        (conv.user1Id === userId && conv.user2Id === currentUser.id)
    );
}

// Create or get conversation
function getOrCreateConversation(userId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return { success: false, message: 'Vous devez être connecté pour envoyer un message.' };
    }
    
    // Check if conversation exists
    let conversation = getConversation(userId);
    
    // If not, create new conversation
    if (!conversation) {
        const conversations = getAllConversations();
        conversation = {
            id: generateId(),
            user1Id: currentUser.id,
            user2Id: userId,
            lastMessageDate: new Date().toISOString(),
            unreadCount: 0
        };
        
        conversations.push(conversation);
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
    
    return { success: true, conversation };
}

// Get messages for a conversation
function getMessagesForConversation(userId) {
    const messages = getAllMessages();
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return [];
    }
    
    // Filter messages between current user and specified user
    return messages.filter(msg => 
        (msg.senderId === currentUser.id && msg.recipientId === userId) || 
        (msg.senderId === userId && msg.recipientId === currentUser.id)
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Send message
function sendMessage(recipientId, content) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return { success: false, message: 'Vous devez être connecté pour envoyer un message.' };
    }
    
    if (!content.trim()) {
        return { success: false, message: 'Le message ne peut pas être vide.' };
    }
    
    // Create or get conversation
    const conversationResult = getOrCreateConversation(recipientId);
    
    if (!conversationResult.success) {
        return conversationResult;
    }
    
    const conversation = conversationResult.conversation;
    
    // Create message
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        recipientId,
        content,
        date: new Date().toISOString(),
        read: false
    };
    
    // Add message to storage
    const messages = getAllMessages();
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    
    // Update conversation
    const conversations = getAllConversations();
    const conversationIndex = conversations.findIndex(conv => conv.id === conversation.id);
    
    if (conversationIndex !== -1) {
        conversations[conversationIndex].lastMessageDate = message.date;
        
        // If recipient is the current user, increment unread count
        if (conversations[conversationIndex].user1Id === currentUser.id) {
            conversations[conversationIndex].unreadCount = 0;
        } else {
            conversations[conversationIndex].unreadCount = (conversations[conversationIndex].unreadCount || 0) + 1;
        }
        
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
    
    return { success: true, message };
}

// Mark messages as read
function markMessagesAsRead(userId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return { success: false, message: 'Vous devez être connecté.' };
    }
    
    // Get all messages
    const messages = getAllMessages();
    let updated = false;
    
    // Mark messages from the specified user to current user as read
    messages.forEach(msg => {
        if (msg.senderId === userId && msg.recipientId === currentUser.id && !msg.read) {
            msg.read = true;
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        
        // Update conversation unread count
        const conversations = getAllConversations();
        const conversationIndex = conversations.findIndex(conv => 
            (conv.user1Id === currentUser.id && conv.user2Id === userId) || 
            (conv.user1Id === userId && conv.user2Id === currentUser.id)
        );
        
        if (conversationIndex !== -1) {
            conversations[conversationIndex].unreadCount = 0;
            localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        }
    }
    
    return { success: true };
}

// Get total unread message count
function getUnreadMessageCount() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return 0;
    }
    
    const conversations = getAllConversations();
    
    // Sum unread counts for conversations where current user is user2
    return conversations.reduce((total, conv) => {
        if (conv.user2Id === currentUser.id) {
            return total + (conv.unreadCount || 0);
        }
        return total;
    }, 0);
}

// Update unread message count in UI
function updateUnreadMessageCount() {
    const unreadCount = getUnreadMessageCount();
    const messageBadge = document.querySelector('.message-badge');
    
    if (messageBadge) {
        if (unreadCount > 0) {
            messageBadge.textContent = unreadCount;
            messageBadge.classList.remove('d-none');
        } else {
            messageBadge.classList.add('d-none');
        }
    }
}

// Load conversations
function loadConversations() {
    const currentUser = getCurrentUser();
    const conversationsList = document.getElementById('conversationsList');
    
    if (!currentUser || !conversationsList) {
        return;
    }
    
    // Get conversations
    const conversations = getAllConversations();
    
    // Filter conversations for current user
    const userConversations = conversations.filter(conv => 
        conv.user1Id === currentUser.id || conv.user2Id === currentUser.id
    );
    
    // Sort by last message date
    userConversations.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    
    // Clear list
    conversationsList.innerHTML = '';
    
    if (userConversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="text-center py-4 text-muted no-conversations">
                <i class="fas fa-comments fa-2x mb-2"></i>
                <p>Aucune conversation</p>
            </div>
        `;
        return;
    }
    
    // Add conversations to list
    userConversations.forEach(conv => {
        // Get other user
        const otherUserId = conv.user1Id === currentUser.id ? conv.user2Id : conv.user1Id;
        const otherUser = getUserById(otherUserId);
        
        if (!otherUser) {
            return;
        }
        
        // Get last message
        const messages = getMessagesForConversation(otherUserId);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        // Create conversation item
        const conversationItem = document.createElement('a');
        conversationItem.href = '#';
        conversationItem.className = 'list-group-item list-group-item-action conversation-item';
        conversationItem.dataset.userId = otherUserId;
        
        // Add unread indicator
        const unreadCount = conv.user2Id === currentUser.id ? (conv.unreadCount || 0) : 0;
        const unreadBadge = unreadCount > 0 ? `<span class="badge bg-primary rounded-pill">${unreadCount}</span>` : '';
        
        conversationItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${otherUser.username}</h6>
                    <p class="mb-1 text-muted small conversation-preview">
                        ${lastMessage ? truncateText(lastMessage.content, 30) : 'Aucun message'}
                    </p>
                </div>
                <div>
                    ${unreadBadge}
                    <small class="text-muted conversation-date">
                        ${lastMessage ? formatRelativeTime(lastMessage.date) : ''}
                    </small>
                </div>
            </div>
        `;
        
        conversationsList.appendChild(conversationItem);
    });
}

// Load conversation
function loadConversation(userId) {
    const currentUser = getCurrentUser();
    const messagesContainer = document.querySelector('.messages-container');
    const messageFormContainer = document.querySelector('.message-form-container');
    const conversationTitle = document.querySelector('.conversation-title');
    const conversationActions = document.querySelector('.conversation-actions');
    const viewProfileBtn = document.querySelector('.view-profile-btn');
    const recipientIdInput = document.getElementById('recipientId');
    
    if (!currentUser || !messagesContainer) {
        return;
    }
    
    // Get other user
    const otherUser = getUserById(userId);
    
    if (!otherUser) {
        return;
    }
    
    // Update conversation title and actions
    if (conversationTitle) {
        conversationTitle.textContent = otherUser.username;
    }
    
    if (conversationActions) {
        conversationActions.classList.remove('d-none');
    }
    
    if (viewProfileBtn) {
        viewProfileBtn.href = `profile.html?id=${userId}`;
    }
    
    // Show message form
    if (messageFormContainer) {
        messageFormContainer.classList.remove('d-none');
    }
    
    // Set recipient ID
    if (recipientIdInput) {
        recipientIdInput.value = userId;
    }
    
    // Get messages
    const messages = getMessagesForConversation(userId);
    
    // Clear container
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <p>Aucun message dans cette conversation</p>
                <p>Envoyez un message pour commencer</p>
            </div>
        `;
    } else {
        // Create messages list
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        
        // Add messages
        messages.forEach(msg => {
            const isCurrentUser = msg.senderId === currentUser.id;
            const messageClass = isCurrentUser ? 'message-sent' : 'message-received';
            
            const messageItem = document.createElement('div');
            messageItem.className = `message ${messageClass}`;
            messageItem.innerHTML = `
                <div class="message-content">
                    <p>${msg.content}</p>
                    <small class="message-time">${formatTime(msg.date)}</small>
                </div>
            `;
            
            messagesList.appendChild(messageItem);
        });
        
        messagesContainer.appendChild(messagesList);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Mark messages as read
    markMessagesAsRead(userId);
    
    // Update unread count
    updateUnreadMessageCount();
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// Helper function to format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
        return 'À l\'instant';
    } else if (diffMins < 60) {
        return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
        return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
        return `Il y a ${diffDays}j`;
    } else {
        return date.toLocaleDateString('fr-FR');
    }
}

// Helper function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Show flash message
function showFlashMessage(type, message) {
    const flashContainer = document.querySelector('.flash-message-container');
    
    if (!flashContainer) {
        return;
    }
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `alert alert-${type} alert-dismissible fade show flash-message`;
    flashMessage.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    flashContainer.appendChild(flashMessage);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        flashMessage.classList.remove('show');
        setTimeout(() => {
            flashContainer.removeChild(flashMessage);
        }, 150);
    }, 5000);
}