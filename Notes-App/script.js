// Notes App JavaScript

// State management
let notes = [];
let editingNoteId = null;
let isGridView = true;

// DOM elements
const addNoteBtn = document.getElementById('addNoteBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('closeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const noteForm = document.getElementById('noteForm');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const notesContainer = document.getElementById('notesContainer');
const emptyState = document.getElementById('emptyState');
const modalTitle = document.getElementById('modalTitle');
const layoutToggle = document.getElementById('layoutToggle');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadNotesFromStorage();
    renderNotes();
    setupEventListeners();
});

// Event listeners setup
function setupEventListeners() {
    addNoteBtn.addEventListener('click', openAddNoteModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', handleOverlayClick);
    noteForm.addEventListener('submit', handleFormSubmit);
    layoutToggle.addEventListener('click', toggleLayout);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });
}

// Open add note modal
function openAddNoteModal() {
    editingNoteId = null;
    modalTitle.textContent = 'Add New Note';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    showModal();
}

// Open edit note modal
function openEditNoteModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    editingNoteId = noteId;
    modalTitle.textContent = 'Edit Note';
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    showModal();
}

// Show modal
function showModal() {
    modalOverlay.classList.add('show');
    noteTitleInput.focus();
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove('show');
    editingNoteId = null;
    noteForm.reset();
}

// Handle overlay click
function handleOverlayClick(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title || !content) return;
    
    if (editingNoteId) {
        updateNote(editingNoteId, title, content);
    } else {
        addNote(title, content);
    }
    
    closeModal();
}

// Add new note
function addNote(title, content) {
    const note = {
        id: generateId(),
        title,
        content,
        createdAt: new Date().toISOString()
    };
    
    notes.unshift(note);
    saveNotesToStorage();
    renderNotes();
}

// Update existing note
function updateNote(id, title, content) {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return;
    
    notes[noteIndex] = {
        ...notes[noteIndex],
        title,
        content,
        updatedAt: new Date().toISOString()
    };
    
    saveNotesToStorage();
    renderNotes();
}

// Delete note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        saveNotesToStorage();
        renderNotes();
    }
}

// Toggle layout between grid and list
function toggleLayout() {
    isGridView = !isGridView;
    
    if (isGridView) {
        notesContainer.classList.remove('list-view');
        layoutToggle.textContent = '☰';
        layoutToggle.title = 'Switch to List View';
    } else {
        notesContainer.classList.add('list-view');
        layoutToggle.textContent = '⊞';
        layoutToggle.title = 'Switch to Grid View';
    }
}

// Render all notes
function renderNotes() {
    // Clear container
    notesContainer.innerHTML = '';
    
    // Show empty state if no notes
    if (notes.length === 0) {
        notesContainer.appendChild(emptyState);
        return;
    }
    
    // Render each note
    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
    });
}

// Create note element
function createNoteElement(note) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.style.animationDelay = '0.1s';
    
    noteCard.innerHTML = `
        <div class="note-content">
            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <p class="note-text">${escapeHtml(note.content)}</p>
        </div>
        <div class="note-actions">
            <button class="edit-btn" onclick="openEditNoteModal('${note.id}')">
                ✏️ Edit
            </button>
            <button class="delete-btn" onclick="deleteNote('${note.id}')">
                🗑️ Delete
            </button>
        </div>
    `;
    
    return noteCard;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save notes to localStorage
function saveNotesToStorage() {
    try {
        localStorage.setItem('notesApp_notes', JSON.stringify(notes));
    } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
    }
}

// Load notes from localStorage
function loadNotesFromStorage() {
    try {
        const savedNotes = localStorage.getItem('notesApp_notes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
        }
    } catch (error) {
        console.error('Failed to load notes from localStorage:', error);
        notes = [];
    }
}