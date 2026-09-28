const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('create form includes an optional notes field', () => {
  assert.match(html, /id="notes-input"/);
  assert.match(html, /name="notes"/);
});

test('edit dialog includes an editable notes field', () => {
  assert.match(html, /id="edit-notes"/);
});

test('task template includes a notes display element', () => {
  assert.match(html, /class="task-notes"/);
});

test('task model loads before the browser application', () => {
  const modelPosition = html.indexOf('src="./task-model.js"');
  const appPosition = html.indexOf('src="./app.js"');

  assert.notEqual(modelPosition, -1);
  assert.notEqual(appPosition, -1);
  assert.ok(modelPosition < appPosition);
});

test('rendered notes use textContent rather than HTML injection', () => {
  assert.match(app, /notes\.textContent\s*=/);
  assert.doesNotMatch(app, /notes\.innerHTML\s*=/);
});

test('browser app searches through the shared task model', () => {
  assert.match(app, /TaskModel\.filterTodos/);
});
