// frontend/script.js
// Connects the notepad UI to a backend API (Node.js + Express)

const API_BASE = 'http://localhost:4000/api';

// Element references
const notesListEl = document.getElementById('notesList');
const addNoteBtn  = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const noteModal   = document.getElementById('noteModal');
const noteForm    = document.getElementById('noteForm');
const cancelBtn   = document.getElementById('cancelBtn');
const modalTitle  = document.getElementById('modalTitle');
const noteIdInput = document.getElementById('noteId');
const noteTitle   = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');

// State
let allNotes = [];

// Helper to call the backend API and handle JSON
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    // Try to parse error message, otherwise throw generic
    let errorMsg;
    try {
      const data = await res.json();
      errorMsg = data.error || res.statusText;
    } catch (e) {
      errorMsg = res.statusText;
    }
    throw new Error(errorMsg);
  }
  return res.status === 204 ? null : res.json();
}

// Load notes from backend
async function loadNotes() {
  try {
    allNotes = await fetchJSON(`${API_BASE}/notes`);
    renderNotes();
  } catch (err) {
    console.error('Failed to load notes', err);
    alert('Error loading notes. Please ensure the server is running.');
  }
}

// Render notes list with filtering
function renderNotes() {
  const query = searchInput.value.trim().toLowerCase();
  // Clear list
  notesListEl.innerHTML = '';
  // Filter notes
  const filtered = allNotes.filter(n => {
    const title = n.title || '';
    const content = n.content || '';
    return (
      title.toLowerCase().includes(query) ||
      content.toLowerCase().includes(query)
    );
  });
  // Create note elements
  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    // Header with title and actions
    const head = document.createElement('div');
    head.className = 'note-head';
    const strong = document.createElement('strong');
    strong.textContent = note.title || 'Untitled';
    head.appendChild(strong);
    const actions = document.createElement('div');
    actions.className = 'actions';
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => openModal(note);
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteNote(note.id);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    head.appendChild(actions);
    // Body with content snippet
    const body = document.createElement('div');
    body.className = 'note-body';
    body.textContent = note.content;
    // Append to list item
    li.appendChild(head);
    li.appendChild(body);
    notesListEl.appendChild(li);
  });
}

// Open modal for adding or editing a note
function openModal(note = null) {
  if (note) {
    modalTitle.textContent = 'Edit Note';
    noteIdInput.value = note.id;
    noteTitle.value   = note.title || '';
    noteContent.value = note.content || '';
  } else {
    modalTitle.textContent = 'Add New Note';
    noteIdInput.value = '';
    noteTitle.value = '';
    noteContent.value = '';
  }
  noteModal.style.display = 'flex';
  noteTitle.focus();
}

// Close the modal and clear form
function closeModal() {
  noteModal.style.display = 'none';
  noteForm.reset();
  noteIdInput.value = '';
}

// Save note (create or update)
async function saveNote(e) {
  e.preventDefault();
  const id = noteIdInput.value;
  const payload = {
    title: noteTitle.value.trim(),
    content: noteContent.value.trim()
  };
  if (!payload.content) {
    alert('Content is required');
    return;
  }
  try {
    if (id) {
      await fetchJSON(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await fetchJSON(`${API_BASE}/notes`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    closeModal();
    await loadNotes();
  } catch (err) {
    console.error('Error saving note', err);
    alert('Error saving note.');
  }
}

// Delete a note
async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  try {
    await fetchJSON(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    await loadNotes();
  } catch (err) {
    console.error('Error deleting note', err);
    alert('Error deleting note.');
  }
}

// Escape HTML to prevent injection
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

// Event listeners
addNoteBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', () => closeModal());
noteForm.addEventListener('submit', saveNote);
searchInput.addEventListener('input', renderNotes);

// Initialize
loadNotes();