const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normaliseTitle,
  normaliseNotes,
  createTodo,
  updateTodo,
  filterTodos,
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

test('createTodo includes notes and safe defaults', () => {
  const todo = createTodo({
    id: 'task-1',
    title: '  Submit project  ',
    notes: 'Remember the live URL',
    priority: 'unexpected',
    createdAt: '2026-09-28T18:00:00.000Z',
  });

  assert.deepEqual(todo, {
    id: 'task-1',
    title: 'Submit project',
    notes: 'Remember the live URL',
    dueDate: '',
    priority: 'normal',
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

test('updateTodo edits notes without losing existing task state', () => {
  const original = {
    id: 'task-1',
    title: 'Submit project',
    notes: 'Old note',
    dueDate: '2026-09-30',
    priority: 'high',
    completed: true,
    createdAt: '2026-09-28T18:00:00.000Z',
  };

  const updated = updateTodo(original, {
    title: 'Submit final project',
    notes: 'Add repository and live URL',
  });

  assert.equal(updated.title, 'Submit final project');
  assert.equal(updated.notes, 'Add repository and live URL');
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

test('filterTodos searches task notes as well as titles', () => {
  const todos = [
    { id: '1', title: 'Submit task', notes: 'Include GitHub Pages URL', completed: false },
    { id: '2', title: 'Join team', notes: 'Official HNG channel', completed: false },
  ];

  const matches = filterTodos(todos, { query: 'github pages' });
  assert.deepEqual(matches.map((todo) => todo.id), ['1']);
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

test('filterTodos safely handles older tasks without notes', () => {
  const todos = [{ id: 'legacy', title: 'Old saved task', completed: false }];
  assert.equal(filterTodos(todos, { query: 'old' }).length, 1);
  assert.equal(filterTodos(todos, { query: 'missing note' }).length, 0);
});
