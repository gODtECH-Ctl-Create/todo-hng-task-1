const STORAGE_KEY = 'taskflow.todos.v1';
const THEME_KEY = 'taskflow.theme';

const form = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const notesInput = document.querySelector('#notes-input');
const dueDateInput = document.querySelector('#due-date');
const priorityInput = document.querySelector('#priority');
const categoryInput = document.querySelector('#category');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyCopy = document.querySelector('#empty-copy');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const clearCompletedButton = document.querySelector('#clear-completed');
const clearAllButton = document.querySelector('#clear-all');
const totalCount = document.querySelector('#total-count');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');
const progressLabel = document.querySelector('#progress-label');
const progressPercent = document.querySelector('#progress-percent');
const progressTrack = document.querySelector('#progress-track');
const progressBar = document.querySelector('#progress-bar');
const dragHint = document.querySelector('#drag-hint');
const apiStatus = document.querySelector('#api-status');
const template = document.querySelector('#task-template');
const themeToggle = document.querySelector('#theme-toggle');
const toast = document.querySelector('#toast');
const toastMessage = document.querySelector('#toast-message');
const toastAction = document.querySelector('#toast-action');

const editDialog = document.querySelector('#edit-dialog');
const editForm = document.querySelector('#edit-form');
const editTitle = document.querySelector('#edit-title');
const editNotes = document.querySelector('#edit-notes');
const editDate = document.querySelector('#edit-date');
const editPriority = document.querySelector('#edit-priority');
const editCategory = document.querySelector('#edit-category');
const closeDialogButton = document.querySelector('#close-dialog');
const cancelEditButton = document.querySelector('#cancel-edit');

let todos = loadTodos();
let currentFilter = 'all';
let currentSort = 'manual';
let editingId = null;
let draggedId = null;
let toastTimer = null;
let undoAction = null;

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];

    return saved
      .filter((todo) => todo && typeof todo === 'object' && TaskModel.normaliseTitle(todo.title))
      .map((todo) => ({
        ...todo,
        title: TaskModel.normaliseTitle(todo.title),
        notes: TaskModel.normaliseNotes(todo.notes),
        dueDate: todo.dueDate || '',
        priority: TaskModel.normalisePriority(todo.priority),
        category: TaskModel.normaliseCategory(todo.category),
        completed: Boolean(todo.completed),
        createdAt: todo.createdAt || new Date().toISOString(),
      }));
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

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

function getDueStatus(todo) {
  if (!todo.dueDate) return null;
  if (todo.completed) {
    return { label: `Due ${formatDate(todo.dueDate)}`, className: 'due-neutral' };
  }

  const [year, month, day] = todo.dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const difference = Math.round((due - today) / 86400000);

  if (difference < 0) {
    return { label: `Overdue · ${formatDate(todo.dueDate)}`, className: 'overdue' };
  }
  if (difference === 0) return { label: 'Due today', className: 'due-today' };
  if (difference === 1) return { label: 'Due tomorrow', className: 'due-soon' };
  if (difference <= 7) return { label: `${difference} days left`, className: 'due-soon' };
  return { label: `Due ${formatDate(todo.dueDate)}`, className: 'due-neutral' };
}

function categoryLabel(category) {
  return `${category[0].toUpperCase()}${category.slice(1)}`;
}

function canReorder() {
  return currentSort === 'manual' && currentFilter === 'all' && !searchInput.value.trim();
}

function visibleTodos() {
  const filtered = TaskModel.filterTodos(todos, {
    filter: currentFilter,
    query: searchInput.value,
  });
  return TaskModel.sortTodos(filtered, currentSort);
}

function updateEmptyState(visibleLength) {
  emptyState.classList.toggle('hidden', visibleLength > 0);
  if (visibleLength > 0) return;

  if (searchInput.value.trim()) {
    emptyTitle.textContent = 'No matching tasks';
    emptyCopy.textContent = 'Try another search term or clear the search.';
    return;
  }

  if (currentFilter === 'active') {
    emptyTitle.textContent = 'Nothing left to do';
    emptyCopy.textContent = 'All caught up. Completed tasks are still available in the Completed filter.';
    return;
  }

  if (currentFilter === 'completed') {
    emptyTitle.textContent = 'No completed tasks yet';
    emptyCopy.textContent = 'Finish a task and it will appear here.';
    return;
  }

  emptyTitle.textContent = 'Start with your first task';
  emptyCopy.textContent = 'Add a task, attach a note, choose a category, and start making progress.';
}

function updateProgress() {
  const completed = todos.filter((todo) => todo.completed).length;
  const percent = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  totalCount.textContent = todos.length;
  completedCount.textContent = completed;
  activeCount.textContent = todos.length - completed;
  progressPercent.textContent = `${percent}%`;
  progressLabel.textContent = todos.length
    ? `${completed} of ${todos.length} tasks completed`
    : 'No tasks yet';
  progressBar.style.width = `${percent}%`;
  progressTrack.setAttribute('aria-valuenow', String(percent));
  clearCompletedButton.disabled = completed === 0;
}

function render() {
  list.replaceChildren();
  const visible = visibleTodos();
  const reorderEnabled = canReorder();

  visible.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector('.todo-item');
    const dragHandle = fragment.querySelector('.drag-handle');
    const checkbox = fragment.querySelector('.task-checkbox');
    const title = fragment.querySelector('.task-title');
    const notes = fragment.querySelector('.task-notes');
    const meta = fragment.querySelector('.task-meta');
    const editButton = fragment.querySelector('.edit-button');
    const deleteButton = fragment.querySelector('.delete-button');

    item.dataset.id = todo.id;
    item.draggable = reorderEnabled;
    item.classList.toggle('completed', todo.completed);
    dragHandle.classList.toggle('disabled', !reorderEnabled);
    dragHandle.setAttribute('aria-disabled', String(!reorderEnabled));
    dragHandle.tabIndex = reorderEnabled ? 0 : -1;

    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', todo.completed ? `Mark ${todo.title} active` : `Mark ${todo.title} complete`);
    title.textContent = todo.title;
    notes.textContent = todo.notes || '';
    notes.hidden = !todo.notes;

    const category = document.createElement('span');
    category.className = `meta-chip category-chip category-${todo.category}`;
    category.textContent = categoryLabel(todo.category);
    meta.append(category);

    const priority = document.createElement('span');
    priority.className = `meta-chip priority-chip ${todo.priority}`;
    priority.textContent = `${categoryLabel(todo.priority)} priority`;
    meta.append(priority);

    const dueStatus = getDueStatus(todo);
    if (dueStatus) {
      const due = document.createElement('span');
      due.className = `meta-chip due-chip ${dueStatus.className}`;
      due.textContent = dueStatus.label;
      meta.append(due);
    }

    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    editButton.addEventListener('click', () => openEditDialog(todo.id));
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    if (reorderEnabled) {
      item.addEventListener('dragstart', (event) => startDrag(event, todo.id, item));
      item.addEventListener('dragover', (event) => dragOver(event, item));
      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
      item.addEventListener('drop', (event) => dropTask(event, todo.id, item));
      item.addEventListener('dragend', finishDrag);
    }

    list.append(fragment);
  });

  dragHint.textContent = reorderEnabled
    ? 'Drag tasks to set your own order.'
    : 'Switch to All + Manual order and clear search to drag tasks.';
  updateEmptyState(visible.length);
  updateProgress();
}

function showToast(message, action = null) {
  window.clearTimeout(toastTimer);
  undoAction = action;
  toastMessage.textContent = message;
  toastAction.hidden = !action;
  toast.classList.add('show');
  toast.setAttribute('aria-hidden', 'false');

  toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden', 'true');
    undoAction = null;
  }, 4500);
}

function addTodo(title, notes, dueDate, priority, category) {
  const todo = TaskModel.createTodo({
    id: createId(),
    title,
    notes,
    dueDate,
    priority,
    category,
    createdAt: new Date().toISOString(),
  });

  todos.unshift(todo);
  currentSort = 'manual';
  sortSelect.value = 'manual';
  saveTodos();
  render();
  showToast('Task added.');
}

function toggleTodo(id) {
  let completed = false;
  todos = todos.map((todo) => {
    if (todo.id !== id) return todo;
    completed = !todo.completed;
    return { ...todo, completed };
  });
  saveTodos();
  render();
  showToast(completed ? 'Task completed.' : 'Task moved back to active.');
}

function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return;

  const [deleted] = todos.splice(index, 1);
  saveTodos();
  render();
  showToast('Task deleted.', () => {
    todos.splice(Math.min(index, todos.length), 0, deleted);
    saveTodos();
    render();
    showToast('Task restored.');
  });
}

function openEditDialog(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  editingId = id;
  editTitle.value = todo.title;
  editNotes.value = todo.notes || '';
  editDate.value = todo.dueDate || '';
  editPriority.value = todo.priority || 'normal';
  editCategory.value = todo.category || 'general';
  editDialog.showModal();
  requestAnimationFrame(() => editTitle.focus());
}

function closeEditDialog() {
  editingId = null;
  if (editDialog.open) editDialog.close();
}

function startDrag(event, id, item) {
  draggedId = id;
  item.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', id);
}

function dragOver(event, item) {
  if (!draggedId || item.dataset.id === draggedId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.drag-over').forEach((node) => node.classList.remove('drag-over'));
  item.classList.add('drag-over');
}

function dropTask(event, targetId, item) {
  event.preventDefault();
  item.classList.remove('drag-over');
  if (!draggedId || draggedId === targetId) return;

  const rect = item.getBoundingClientRect();
  const placeAfter = event.clientY > rect.top + rect.height / 2;
  reorderTodo(draggedId, targetId, placeAfter);
}

function reorderTodo(sourceId, targetId, placeAfter) {
  const sourceIndex = todos.findIndex((todo) => todo.id === sourceId);
  if (sourceIndex === -1) return;

  const [moved] = todos.splice(sourceIndex, 1);
  const targetIndex = todos.findIndex((todo) => todo.id === targetId);
  if (targetIndex === -1) {
    todos.splice(sourceIndex, 0, moved);
    return;
  }

  todos.splice(targetIndex + (placeAfter ? 1 : 0), 0, moved);
  saveTodos();
  render();
  showToast('Task order updated.');
}

function finishDrag() {
  draggedId = null;
  document.querySelectorAll('.dragging, .drag-over').forEach((node) => {
    node.classList.remove('dragging', 'drag-over');
  });
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

async function checkApiHealth() {
  try {
    const response = await fetch('./api/health', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('API unavailable');
    const body = await response.json();
    if (body.status !== 'ok') throw new Error('API unhealthy');
    apiStatus.textContent = 'API online';
    apiStatus.className = 'api-status online';
  } catch {
    apiStatus.textContent = 'Static mode';
    apiStatus.className = 'api-status static';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = TaskModel.normaliseTitle(todoInput.value);
  if (!title) return;

  addTodo(title, notesInput.value, dueDateInput.value, priorityInput.value, categoryInput.value);
  form.reset();
  priorityInput.value = 'normal';
  categoryInput.value = 'general';
  todoInput.focus();
});

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = TaskModel.normaliseTitle(editTitle.value);
  if (!title || !editingId) return;

  todos = todos.map((todo) =>
    todo.id === editingId
      ? TaskModel.updateTodo(todo, {
          title,
          notes: editNotes.value,
          dueDate: editDate.value,
          priority: editPriority.value,
          category: editCategory.value,
        })
      : todo
  );

  saveTodos();
  closeEditDialog();
  render();
  showToast('Task updated.');
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  render();
});

clearCompletedButton.addEventListener('click', () => {
  const count = todos.filter((todo) => todo.completed).length;
  if (!count) return;
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
  showToast(`${count} completed ${count === 1 ? 'task' : 'tasks'} cleared.`);
});

clearAllButton.addEventListener('click', () => {
  if (!todos.length) return;
  if (!window.confirm('Delete all tasks and notes? This cannot be undone.')) return;
  todos = [];
  saveTodos();
  render();
  showToast('All tasks cleared.');
});

toastAction.addEventListener('click', () => {
  const action = undoAction;
  undoAction = null;
  if (action) action();
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
checkApiHealth();
