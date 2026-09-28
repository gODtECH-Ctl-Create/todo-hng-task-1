const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normaliseTitle,
  normaliseNotes,
  normaliseCategory,
  createTodo,
  updateTodo,
  filterTodos,
  sortTodos,
} = require('../task-model.js');

test('normaliseTitle trims and collapses repeated whitespace', () => {
  assert.equal(normaliseTitle('  Finish   HNG   task  '), 'Finish HNG task');
});

test('normaliseNotes trims outer whitespace and preserves line breaks', () => {
  assert.equal(
    normaliseNotes('  First line  \r\nSecond line   \r\n'),
    'First line\nSecond line'
  );
});

test('normaliseCategory falls back safely for unknown or older values', () => {
  assert.equal(normaliseCategory('work'), 'work');
  assert.equal(normaliseCategory('unexpected'), 'general');
  assert.equal(normaliseCategory(undefined), 'general');
});

test('createTodo includes notes, category, and safe defaults', () => {
  const todo = createTodo({
    id: 'task-1',
    title: '  Submit project  ',
    notes: 'Remember the live URL',
    priority: 'unexpected',
    category: 'study',
    createdAt: '2026-09-28T18:00:00.000Z',
  });

  assert.deepEqual(todo, {
    id: 'task-1',
    title: 'Submit project',
    notes: 'Remember the live URL',
    dueDate: '',
    priority: 'normal',
    category: 'study',
    completed: false,
    createdAt: '2026-09-28T18:00:00.000Z',
  });
});

test('createTodo rejects a blank title', () => {
  assert.throws(
    () => createTodo({ id: 'task-1', title: '   ', createdAt: 'now' }),
    /Task title is required/
  );
});

test('updateTodo edits notes and category without losing existing task state', () => {
  const original = {
    id: 'task-1',
    title: 'Submit project',
    notes: 'Old note',
    dueDate: '2026-09-30',
    priority: 'high',
    category: 'work',
    completed: true,
    createdAt: '2026-09-28T18:00:00.000Z',
  };

  const updated = updateTodo(original, {
    title: 'Submit final project',
    notes: 'Add repository and live URL',
    category: 'study',
  });

  assert.equal(updated.title, 'Submit final project');
  assert.equal(updated.notes, 'Add repository and live URL');
  assert.equal(updated.category, 'study');
  assert.equal(updated.completed, true);
  assert.equal(updated.dueDate, '2026-09-30');
  assert.equal(updated.priority, 'high');
});

test('updateTodo rejects a blank title', () => {
  assert.throws(
    () => updateTodo({ title: 'Existing task' }, { title: '   ' }),
    /Task title is required/
  );
});

test('filterTodos searches task notes and categories as well as titles', () => {
  const todos = [
    { id: '1', title: 'Submit task', notes: 'Include GitHub Pages URL', category: 'work', completed: false },
    { id: '2', title: 'Join team', notes: 'Official HNG channel', category: 'study', completed: false },
  ];

  assert.deepEqual(filterTodos(todos, { query: 'github pages' }).map((todo) => todo.id), ['1']);
  assert.deepEqual(filterTodos(todos, { query: 'study' }).map((todo) => todo.id), ['2']);
});

test('filterTodos combines completion filters with search', () => {
  const todos = [
    { id: '1', title: 'Write tests', notes: 'Node test runner', completed: true },
    { id: '2', title: 'Write README', notes: 'Testing section', completed: false },
    { id: '3', title: 'Deploy', notes: 'Pages workflow', completed: false },
  ];

  assert.deepEqual(
    filterTodos(todos, { filter: 'active', query: 'write' }).map((todo) => todo.id),
    ['2']
  );

  assert.deepEqual(
    filterTodos(todos, { filter: 'completed', query: 'write' }).map((todo) => todo.id),
    ['1']
  );
});

test('filterTodos safely handles older tasks without notes or categories', () => {
  const todos = [{ id: 'legacy', title: 'Old saved task', completed: false }];
  assert.equal(filterTodos(todos, { query: 'old' }).length, 1);
  assert.equal(filterTodos(todos, { query: 'missing note' }).length, 0);
});

test('sortTodos supports newest and oldest without mutating source order', () => {
  const todos = [
    { id: 'older', createdAt: '2026-09-20T10:00:00.000Z' },
    { id: 'newer', createdAt: '2026-09-28T10:00:00.000Z' },
  ];

  assert.deepEqual(sortTodos(todos, 'newest').map((todo) => todo.id), ['newer', 'older']);
  assert.deepEqual(sortTodos(todos, 'oldest').map((todo) => todo.id), ['older', 'newer']);
  assert.deepEqual(todos.map((todo) => todo.id), ['older', 'newer']);
});

test('sortTodos puts dated tasks first when sorting by due date', () => {
  const todos = [
    { id: 'none', dueDate: '' },
    { id: 'later', dueDate: '2026-10-10' },
    { id: 'soon', dueDate: '2026-09-30' },
  ];

  assert.deepEqual(sortTodos(todos, 'due').map((todo) => todo.id), ['soon', 'later', 'none']);
});

test('sortTodos orders high, normal, then low priority', () => {
  const todos = [
    { id: 'low', priority: 'low' },
    { id: 'high', priority: 'high' },
    { id: 'normal', priority: 'normal' },
  ];

  assert.deepEqual(sortTodos(todos, 'priority').map((todo) => todo.id), ['high', 'normal', 'low']);
});
