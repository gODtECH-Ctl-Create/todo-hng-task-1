(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.TaskModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VALID_PRIORITIES = new Set(['low', 'normal', 'high']);
  const VALID_FILTERS = new Set(['all', 'active', 'completed']);
  const VALID_CATEGORIES = new Set(['general', 'work', 'personal', 'study', 'errands']);
  const VALID_SORTS = new Set(['manual', 'newest', 'oldest', 'due', 'priority']);
  const PRIORITY_WEIGHT = { high: 0, normal: 1, low: 2 };

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

  function normaliseCategory(value) {
    return VALID_CATEGORIES.has(value) ? value : 'general';
  }

  function createTodo({
    id,
    title,
    notes = '',
    dueDate = '',
    priority = 'normal',
    category = 'general',
    createdAt,
  }) {
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
      category: normaliseCategory(category),
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
      category: changes.category === undefined
        ? normaliseCategory(todo.category)
        : normaliseCategory(changes.category),
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

      const searchableText = `${todo.title || ''} ${todo.notes || ''} ${todo.category || ''}`.toLowerCase();
      const matchesSearch = !cleanQuery || searchableText.includes(cleanQuery);

      return matchesFilter && matchesSearch;
    });
  }

  function timestamp(value) {
    const time = Date.parse(value || '');
    return Number.isFinite(time) ? time : 0;
  }

  function sortTodos(todos, sort = 'manual') {
    const safeSort = VALID_SORTS.has(sort) ? sort : 'manual';
    const sorted = [...todos];

    if (safeSort === 'newest') {
      return sorted.sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
    }

    if (safeSort === 'oldest') {
      return sorted.sort((a, b) => timestamp(a.createdAt) - timestamp(b.createdAt));
    }

    if (safeSort === 'due') {
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return String(a.dueDate).localeCompare(String(b.dueDate));
      });
    }

    if (safeSort === 'priority') {
      return sorted.sort(
        (a, b) =>
          PRIORITY_WEIGHT[normalisePriority(a.priority)] -
          PRIORITY_WEIGHT[normalisePriority(b.priority)]
      );
    }

    return sorted;
  }

  return {
    normaliseTitle,
    normaliseNotes,
    normalisePriority,
    normaliseCategory,
    createTodo,
    updateTodo,
    filterTodos,
    sortTodos,
  };
});
