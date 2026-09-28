const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'loader.js'), 'utf8');

test('create form includes an optional notes field', () => {
  assert.match(html, /id="notes-input"/);
  assert.match(html, /name="notes"/);
});

test('create and edit forms expose task categories', () => {
  assert.match(html, /id="category"/);
  assert.match(html, /name="category"/);
  assert.match(html, /id="edit-category"/);
});

test('edit dialog includes an editable notes field', () => {
  assert.match(html, /id="edit-notes"/);
});

test('task template includes notes and drag controls', () => {
  assert.match(html, /class="task-notes"/);
  assert.match(html, /class="drag-handle"/);
});

test('dashboard includes progress tracking and sorting controls', () => {
  assert.match(html, /id="progress-track"/);
  assert.match(html, /id="progress-bar"/);
  assert.match(html, /id="sort-select"/);
});

test('interface includes undo toast and API status feedback', () => {
  assert.match(html, /id="toast"/);
  assert.match(html, /id="toast-action"/);
  assert.match(html, /id="api-status"/);
});

test('initial page exposes a loading splash before the todo interface', () => {
  assert.match(html, /<body class="app-loading">/);
  assert.match(html, /id="app-loader"/);
  assert.match(html, /Preparing your tasks\.\.\./);
  assert.match(html, /href="\.\/loader\.css"/);
  assert.match(html, /src="\.\/loader\.js"/);
});

test('loading controller waits for page load and reveals the application', () => {
  assert.match(loader, /MINIMUM_VISIBLE_MS/);
  assert.match(loader, /window\.addEventListener\('load'/);
  assert.match(loader, /classList\.remove\('app-loading'\)/);
  assert.match(loader, /classList\.add\('app-ready'\)/);
});

test('task model loads before the browser application and loader runs last', () => {
  const modelPosition = html.indexOf('src="./task-model.js"');
  const appPosition = html.indexOf('src="./app.js"');
  const loaderPosition = html.indexOf('src="./loader.js"');

  assert.notEqual(modelPosition, -1);
  assert.notEqual(appPosition, -1);
  assert.notEqual(loaderPosition, -1);
  assert.ok(modelPosition < appPosition);
  assert.ok(appPosition < loaderPosition);
});

test('rendered notes use textContent rather than HTML injection', () => {
  assert.match(app, /notes\.textContent\s*=/);
  assert.doesNotMatch(app, /notes\.innerHTML\s*=/);
});

test('browser app searches and sorts through the shared task model', () => {
  assert.match(app, /TaskModel\.filterTodos/);
  assert.match(app, /TaskModel\.sortTodos/);
});

test('browser app implements drag reorder and undoable deletion', () => {
  assert.match(app, /dragstart/);
  assert.match(app, /reorderTodo/);
  assert.match(app, /Task deleted\./);
  assert.match(app, /Task restored\./);
});
