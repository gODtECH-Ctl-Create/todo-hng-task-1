(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.TaskModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VALID_PRIORITIES = new Set(['low', 'normal', 'high']);
  const VALID_FILTERS = new Set(['all', 'active', 'completed']);

  function normaliseTitle(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
  }

  function normaliseNotes(value) {
    return String(value ?? '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();
  }

  function normalisePriority(value) {
    return VALID_PRIORITIES.has(value) ? value : 'normal';
  }

  function createTodo({ id, title, notes = '', dueDate = '', priority = 'normal', createdAt }) {
    const cleanTitle = normaliseTitle(title);

    if (!cleanTitle) {
      throw new Error('Task title is required.');
    }

    return {
      id,
      title: cleanTitle,
      notes: normaliseNotes(notes),
      dueDate: dueDate || '',
      priority: normalisePriority(priority),
      completed: false,
      createdAt,
    };
  }

  function updateTodo(todo, changes = {}) {
    if (!todo) return todo;

    const nextTitle = changes.title === undefined ? todo.title : normaliseTitle(changes.title);
    if (!nextTitle) {
      throw new Error('Task title is required.');
    }

    return {
      ...todo,
      title: nextTitle,
      notes: changes.notes === undefined ? normaliseNotes(todo.notes) : normaliseNotes(changes.notes),
      dueDate: changes.dueDate === undefined ? todo.dueDate || '' : changes.dueDate || '',
      priority: changes.priority === undefined
        ? normalisePriority(todo.priority)
        : normalisePriority(changes.priority),
    };
  }

  function filterTodos(todos, { filter = 'all', query = '' } = {}) {
    const safeFilter = VALID_FILTERS.has(filter) ? filter : 'all';
    const cleanQuery = String(query ?? '').trim().toLowerCase();

    return todos.filter((todo) => {
      const matchesFilter =
        safeFilter === 'all' ||
        (safeFilter === 'active' && !todo.completed) ||
        (safeFilter === 'completed' && todo.completed);

      const searchableText = `${todo.title || ''} ${todo.notes || ''}`.toLowerCase();
      const matchesSearch = !cleanQuery || searchableText.includes(cleanQuery);

      return matchesFilter && matchesSearch;
    });
  }

  return {
    normaliseTitle,
    normaliseNotes,
    createTodo,
    updateTodo,
    filterTodos,
  };
});
