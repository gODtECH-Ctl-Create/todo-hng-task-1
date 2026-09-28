const test = require('node:test');
const assert = require('node:assert/strict');

const healthHandler = require('../api/health');
const validateTaskHandler = require('../api/validate-task');

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('GET /api/health returns service status', () => {
  const req = { method: 'GET' };
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    status: 'ok',
    service: 'taskflow-api',
  });
});

test('/api/health rejects unsupported methods', () => {
  const req = { method: 'POST' };
  const res = createMockResponse();

  healthHandler(req, res);

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'GET');
  assert.equal(res.body.error, 'Method not allowed');
});

test('POST /api/validate-task accepts and normalises a valid task', () => {
  const req = {
    method: 'POST',
    body: {
      title: '  Finish   HNG task  ',
      notes: 'Check endpoint tests.   ',
      priority: 'high',
      dueDate: '2026-09-30',
    },
  };
  const res = createMockResponse();

  validateTaskHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.valid, true);
  assert.deepEqual(res.body.task, {
    title: 'Finish HNG task',
    notes: 'Check endpoint tests.',
    priority: 'high',
    dueDate: '2026-09-30',
  });
});

test('POST /api/validate-task rejects a blank title', () => {
  const req = {
    method: 'POST',
    body: { title: '   ', notes: 'A note' },
  };
  const res = createMockResponse();

  validateTaskHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.valid, false);
  assert.equal(res.body.field, 'title');
});

test('POST /api/validate-task rejects invalid JSON', () => {
  const req = {
    method: 'POST',
    body: '{invalid-json',
  };
  const res = createMockResponse();

  validateTaskHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.valid, false);
  assert.match(res.body.error, /valid JSON/i);
});

test('POST /api/validate-task rejects invalid priority', () => {
  const req = {
    method: 'POST',
    body: { title: 'A task', priority: 'urgent' },
  };
  const res = createMockResponse();

  validateTaskHandler(req, res);

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.valid, false);
  assert.equal(res.body.field, 'priority');
});

test('/api/validate-task rejects unsupported methods', () => {
  const req = { method: 'GET' };
  const res = createMockResponse();

  validateTaskHandler(req, res);

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
  assert.equal(res.body.error, 'Method not allowed');
});
