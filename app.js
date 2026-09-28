const STORAGE_KEY = 'taskflow.todos.v1';
const THEME_KEY = 'taskflow.theme';

const form = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const dueDateInput = document.querySelector('#due-date');
const priorityInput = document.querySelector('#priority');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#search-input');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const clearCompletedButton = document.querySelector('#clear-completed');
const clearAllButton = document.querySelector('#clear-all');
const totalCount = document.querySelector('#total-count');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');
const template = document.querySelector('#task-template');
const themeToggle = document.querySelector('#theme-toggle');

const editDialog = document.querySelector('#edit-dialog');
const editForm = document.querySelector('#edit-form');
const editTitle = document.querySelector('#edit-title');
const editDate = document.querySelector('#edit-date');
const editPriority = document.querySelector('#edit-priority');
const closeDialogButton = document.querySelector('#close-dialog');
const cancelEditButton = document.querySelector('#cancel-edit');

let todos = loadTodos();
let currentFilter = 'all';
let editingId = null;

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normaliseTitle(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const endOfDueDate = new Date(`${todo.dueDate}T23:59:59`);
  return endOfDueDate < new Date();
}

function visibleTodos() {
  const query = searchInput.value.trim().toLowerCase();

  return todos.filter((todo) => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !todo.completed) ||
      (currentFilter === 'completed' && todo.completed);

    const matchesSearch = !query || todo.title.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

function render() {
  list.replaceChildren();
  const visible = visibleTodos();

  visible.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector('.todo-item');
    const checkbox = fragment.querySelector('.task-checkbox');
    const title = fragment.querySelector('.task-title');
    const meta = fragment.querySelector('.task-meta');
    const editButton = fragment.querySelector('.edit-button');
    const deleteButton = fragment.querySelector('.delete-button');

    item.dataset.id = todo.id;
    item.classList.toggle('completed', todo.completed);
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', todo.completed ? `Mark ${todo.title} active` : `Mark ${todo.title} complete`);
    title.textContent = todo.title;

    const priority = document.createElement('span');
    priority.className = `meta-chip priority-chip ${todo.priority}`;
    priority.textContent = `${todo.priority[0].toUpperCase()}${todo.priority.slice(1)} priority`;
    meta.append(priority);

    if (todo.dueDate) {
      const due = document.createElement('span');
      due.className = `meta-chip${isOverdue(todo) ? ' overdue' : ''}`;
      due.textContent = `${isOverdue(todo) ? 'Overdue' : 'Due'} ${formatDate(todo.dueDate)}`;
      meta.append(due);
    }

    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    editButton.addEventListener('click', () => openEditDialog(todo.id));
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    list.append(fragment);
  });

  emptyState.classList.toggle('hidden', visible.length > 0);

  const completed = todos.filter((todo) => todo.completed).length;
  totalCount.textContent = todos.length;
  completedCount.textContent = completed;
  activeCount.textContent = todos.length - completed;
  clearCompletedButton.disabled = completed === 0;
}

function addTodo(title, dueDate, priority) {
  todos.unshift({
    id: createId(),
    title,
    dueDate,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function openEditDialog(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  editingId = id;
  editTitle.value = todo.title;
  editDate.value = todo.dueDate || '';
  editPriority.value = todo.priority || 'normal';
  editDialog.showModal();
  requestAnimationFrame(() => editTitle.focus());
}

function closeEditDialog() {
  editingId = null;
  editDialog.close();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function initialiseTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = normaliseTitle(todoInput.value);
  if (!title) return;

  addTodo(title, dueDateInput.value, priorityInput.value);
  form.reset();
  priorityInput.value = 'normal';
  todoInput.focus();
});

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = normaliseTitle(editTitle.value);
  if (!title || !editingId) return;

  todos = todos.map((todo) =>
    todo.id === editingId
      ? { ...todo, title, dueDate: editDate.value, priority: editPriority.value }
      : todo
  );

  saveTodos();
  closeEditDialog();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

searchInput.addEventListener('input', render);

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

clearAllButton.addEventListener('click', () => {
  if (!todos.length) return;
  if (!window.confirm('Delete all tasks? This cannot be undone.')) return;
  todos = [];
  saveTodos();
  render();
});

closeDialogButton.addEventListener('click', closeEditDialog);
cancelEditButton.addEventListener('click', closeEditDialog);
editDialog.addEventListener('click', (event) => {
  if (event.target === editDialog) closeEditDialog();
});

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

initialiseTheme();
render();
