// Use localStorage to store notes so the notepad works without a backend API

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
const noteTags    = document.getElementById('noteTags');
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');

// Keys used in localStorage
const STORAGE_KEY   = 'notes';
const DARK_MODE_KEY = 'darkMode';

// State: array of all notes
let allNotes = [];

// Load notes from localStorage and render
function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  allNotes = saved ? JSON.parse(saved) : [];
  renderNotes();
}

// Save notes to localStorage
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
}

// Generate a pseudo-unique ID for new notes
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Render the notes list with search filtering
function renderNotes() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = allNotes.filter(n =>
    (n.title || '').toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q) ||
    (n.tags ? n.tags.join(' ').toLowerCase().includes(q) : false)
  );

  notesListEl.innerHTML = '';
  filtered.forEach(n => {
    const li = document.createElement('li');
    li.className = 'note-item';
    const tagsHtml = (n.tags && n.tags.length)
      ? `<div class="note-tags">${n.tags.map(t => `<span class="note-tag">${escapeHTML(t)}</span>`).join('')}</div>`
      : '';
    li.innerHTML = `
      <div class="note-head"><strong>${escapeHTML(n.title || 'Untitled')}</strong>
        <div class="actions">
          <button class="btn edit">Edit</button>
          <button class="btn danger delete">Delete</button>
        </div>
      </div>
      <div class="note-body">${escapeHTML(n.content)}${tagsHtml}</div>
    `;
    li.querySelector('.edit').onclick   = () => openModal(n);
    li.querySelector('.delete').onclick = () => deleteNote(n.id);
    notesListEl.appendChild(li);
  });
}

// Open the modal for adding or editing a note
function openModal(note = null) {
  modalTitle.textContent = note ? 'Edit Note' : 'Add New Note';
  noteIdInput.value   = note?.id ?? '';
  noteTitle.value     = note?.title ?? '';
  noteContent.value   = note?.content ?? '';
  noteTags.value      = note?.tags ? note.tags.join(', ') : '';
  noteModal.style.display = 'flex';
}

// Close the modal and reset the form
function closeModal() {
  noteModal.style.display = 'none';
  noteForm.reset();
  noteIdInput.value = '';
}

// Handle form submission to save a note
function saveNote(e) {
  e.preventDefault();
  const id      = noteIdInput.value;
  const title   = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const tags    = noteTags.value.split(',').map(t => t.trim()).filter(Boolean);
  if (!content) {
    alert('Content is required');
    return;
  }
  if (id) {
    // Update existing note
    const index = allNotes.findIndex(n => n.id === id);
    if (index !== -1) {
      allNotes[index] = {
        ...allNotes[index],
        title,
        content,
        tags,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    // Create new note
    const now = new Date().toISOString();
    allNotes.unshift({
      id: generateId(),
      title,
      content,
      tags,
      created_at: now,
      updated_at: now
    });
  }
  saveToStorage();
  closeModal();
  renderNotes();
}

// Delete a note by id after confirmation
function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  allNotes = allNotes.filter(n => n.id !== id);
  saveToStorage();
  renderNotes();
}

// Escape HTML to prevent injection
function escapeHTML(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialize dark mode based on localStorage
function initializeDarkMode() {
  const isDark = localStorage.getItem(DARK_MODE_KEY) === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
}

// Event listeners
addNoteBtn.onclick    = () => openModal();
cancelBtn.onclick     = () => closeModal();
noteForm.onsubmit     = saveNote;
searchInput.oninput   = () => renderNotes();
toggleDarkModeBtn.onclick = () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(DARK_MODE_KEY, isDark);
};

// Initialize the app
initializeDarkMode();
loadNotes();


// ===== Task (to-do list) functionality =====
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDueDate = document.getElementById('taskDueDate');
const tasksBody = document.getElementById('tasksBody');

const TASKS_KEY = 'tasks';
let allTasks = [];

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  allTasks = saved ? JSON.parse(saved) : [];
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
}

function renderTasks() {
  tasksBody.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  allTasks.forEach(task => {
    const tr = document.createElement('tr');
    // highlight overdue tasks
    if (!task.completed && task.dueDate && task.dueDate < today) {
      tr.classList.add('task-overdue');
    }
    tr.innerHTML = `
      <td>${escapeHTML(task.title)}</td>
      <td>${task.dueDate || ''}</td>
      <td>${task.completed ? 'Completed' : 'Pending'}</td>
      <td>
        <button class="btn small complete">${task.completed ? 'Undo' : 'Complete'}</button>
        <button class="btn small danger delete">Delete</button>
      </td>
    `;
    tr.querySelector('.complete').onclick = () => toggleTaskComplete(task.id);
    tr.querySelector('.delete').onclick = () => deleteTask(task.id);
    tasksBody.appendChild(tr);
  });
}

function addTask(e) {
  e.preventDefault();
  const title = taskTitle.value.trim();
  const dueDate = taskDueDate.value;
  if (!title) {
    alert('Task title is required');
    return;
  }
  allTasks.unshift({
    id: generateId(),
    title,
    dueDate: dueDate || '',
    completed: false
  });
  saveTasks();
  taskForm.reset();
  renderTasks();
}

function toggleTaskComplete(id) {
  const index = allTasks.findIndex(t => t.id === id);
  if (index !== -1) {
    allTasks[index].completed = !allTasks[index].completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  allTasks = allTasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Register task event listener
if (taskForm) {
  taskForm.onsubmit = addTask;
}

// Load tasks on initialization
loadTasks();
