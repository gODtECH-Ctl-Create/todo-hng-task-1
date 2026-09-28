# TaskFlow Todo List

A polished, responsive To-Do List application built with plain HTML, CSS, and JavaScript, with a small Node.js serverless API and automated endpoint tests.

This project was coded entirely through an AI-assisted development workflow for the HNG task.

## Live application

**HNG submission / full app + API:**

https://todo-hng-task-1.vercel.app/

API health check:

https://todo-hng-task-1.vercel.app/api/health

Static GitHub Pages fallback:

https://godtech-ctl-create.github.io/todo-hng-task-1/

> GitHub Pages serves the frontend only. Vercel is the primary submission deployment because it also executes the `/api/*` serverless functions.

## Core requirements

- Create, edit, complete, and delete tasks
- Add and edit notes for every task
- Public deployment
- `AGENTS.md` with structured AI-agent rules
- Automated validation and API endpoint tests

## Additional features

TaskFlow goes beyond the required todo + notes functionality with:

- **Categories** — General, Work, Personal, Study, and Errands
- **Priority levels** — Low, Normal, and High
- **Due dates with smart status badges** — overdue, due today, due tomorrow, days remaining, or a formatted future date
- **Search** across task titles, notes, and categories
- **Filters** for All, Active, and Completed tasks
- **Sorting** by Manual order, Newest, Oldest, Due date, and Priority
- **Drag-and-drop manual ordering** with persisted order
- **Undo delete** using a toast action
- **Completion dashboard** with total, active, completed counts, percentage, and progress bar
- **Context-aware empty states** for filters and search
- **Light and dark themes**
- **Responsive mobile and desktop layout**
- **Subtle UI animations** with reduced-motion support
- **Browser `localStorage` persistence**
- **Backward compatibility** with older saved tasks that did not have notes or categories
- **Live API status indicator** on the Vercel deployment
- **Accessible labels, focus states, and keyboard-friendly controls**

### Drag ordering behavior

Manual drag ordering is intentionally enabled only when:

- Filter = **All**
- Sort = **Manual order**
- Search is empty

This prevents a sorted or filtered view from accidentally changing the user's persisted manual order.

## API endpoints

### `GET /api/health`

Returns the API health state.

Example success response:

```json
{
  "status": "ok",
  "service": "taskflow-api"
}
```

Unsupported methods return HTTP `405` with an `Allow: GET` header.

### `POST /api/validate-task`

Validates and normalizes task input before it is accepted by an API consumer.

Example request:

```json
{
  "title": "Finish HNG task",
  "notes": "Check endpoint tests",
  "priority": "high",
  "dueDate": "2026-09-30"
}
```

The endpoint validates required title input, notes length, priority, due-date format, malformed JSON, and unsupported HTTP methods.

## Automated validation

The project uses Node.js' built-in test runner and has no test-framework dependency.

Requirements:

- Node.js 20 or newer

Run:

```bash
npm test
```

The suite validates:

- Task title and notes normalization
- Blank-title rejection
- Category normalization and legacy fallback
- Notes/category editing without losing task state
- Search across notes and categories
- Active/Completed filtering
- Newest/Oldest/Due/Priority sorting without source mutation
- Required UI contracts for notes, categories, drag controls, sorting, progress, toast undo, and API status
- Safe text rendering
- `GET /api/health` success behavior
- API unsupported-method behavior
- `POST /api/validate-task` success behavior
- Missing-title validation
- Malformed JSON handling
- Invalid-field validation

GitHub Actions runs the same validation automatically on pushes to `main`, pull requests, and manual workflow runs through `.github/workflows/validate.yml`.

`AGENTS.md` requires every future API endpoint to include automated success, validation, method, not-found/auth where applicable, and failure-path tests before the change is considered complete.

## Run locally

The frontend itself needs no build step. You can serve the static files with any HTTP server:

```bash
python -m http.server 8000
```

For complete Vercel/serverless API behavior, use a Vercel-compatible local or deployed environment.

## Project structure

```text
.
├── .github/workflows/
│   ├── pages.yml
│   └── validate.yml
├── api/
│   ├── health.js
│   └── validate-task.js
├── tests/
│   ├── api-endpoints.test.js
│   ├── static-app.test.js
│   └── task-model.test.js
├── AGENTS.md
├── app.js
├── index.html
├── package.json
├── task-model.js
├── styles.css
└── README.md
```

## Deployment

### Vercel — primary HNG deployment

The public deployment is:

https://todo-hng-task-1.vercel.app/

Verify the tested endpoint at:

https://todo-hng-task-1.vercel.app/api/health

### GitHub Pages — static fallback

Pushes to `main` continue to trigger `.github/workflows/pages.yml` and deploy the frontend to:

https://godtech-ctl-create.github.io/todo-hng-task-1/

GitHub Pages does not execute the Node.js files under `api/`.

See [`AGENTS.md`](./AGENTS.md) for project constraints, structured AI-agent instructions, UI regression rules, endpoint testing requirements, and the definition of done.
