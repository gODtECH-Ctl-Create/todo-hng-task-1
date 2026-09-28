const TaskModel = require('../task-model');

const VALID_PRIORITIES = new Set(['low', 'normal', 'high']);
const MAX_TITLE_LENGTH = 120;
const MAX_NOTES_LENGTH = 2000;

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  throw new Error('Unsupported request body.');
}

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed',
      allowed: ['POST'],
    });
  }

  let body;
  try {
    body = parseBody(req);
  } catch (_error) {
    return res.status(400).json({
      valid: false,
      error: 'Request body must be valid JSON.',
    });
  }

  const title = TaskModel.normaliseTitle(body.title);
  const notes = TaskModel.normaliseNotes(body.notes);
  const priority = body.priority == null || body.priority === '' ? 'normal' : String(body.priority);
  const dueDate = body.dueDate == null ? '' : String(body.dueDate).trim();

  if (!title) {
    return res.status(400).json({
      valid: false,
      error: 'Task title is required.',
      field: 'title',
    });
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return res.status(422).json({
      valid: false,
      error: `Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
      field: 'title',
    });
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    return res.status(422).json({
      valid: false,
      error: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`,
      field: 'notes',
    });
  }

  if (!VALID_PRIORITIES.has(priority)) {
    return res.status(422).json({
      valid: false,
      error: 'Priority must be low, normal, or high.',
      field: 'priority',
    });
  }

  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(422).json({
      valid: false,
      error: 'Due date must use YYYY-MM-DD format.',
      field: 'dueDate',
    });
  }

  return res.status(200).json({
    valid: true,
    task: {
      title,
      notes,
      priority,
      dueDate,
    },
  });
};
