# TaskFlow Todo List

A fast, responsive To-Do List application built with plain HTML, CSS, and JavaScript, with a small Node.js serverless API for endpoint validation and automated API testing.

This project was coded entirely through an AI-assisted development workflow for the HNG task.

## Live frontend

GitHub Pages (static frontend):

https://godtech-ctl-create.github.io/todo-hng-task-1/

> GitHub Pages cannot run the Node.js API functions. For HNG submission, deploy this repository to Vercel so the same public URL serves both the UI and `/api/*` endpoints.

## Features

- Add, edit, complete, and delete tasks
- Add and edit notes for every task
- Search across both task titles and notes
- Due dates and priority levels
- All / Active / Completed filters
- Live task counters
- Browser `localStorage` persistence for tasks and notes
- Backward compatibility with older saved tasks that had no notes field
- Light and dark themes
- Responsive mobile and desktop layout
- Accessible labels, focus states, and keyboard-friendly controls
- Tested Node.js API endpoints

## Additional features

Beyond the required todo and notes functionality, TaskFlow includes due dates, priorities, search, filtering, overdue detection, persistent browser storage, task counters, theme switching, and an API validation layer.

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

The project includes dependency-free automated tests using Node.js' built-in test runner.

Requirements:

- Node.js 20 or newer

Run:

```bash
npm test
```

The suite validates:

- Task creation and blank-title rejection
- Notes creation/editing and notes search
- Task filtering and older localStorage compatibility
- Required notes UI elements and safe text rendering
- Script loading order
- `GET /api/health` success behavior
- API unsupported-method behavior
- `POST /api/validate-task` success behavior
- Missing title validation
- Malformed JSON handling
- Invalid field validation

GitHub Actions runs the same suite automatically on pushes to `main`, pull requests, and manual workflow runs through `.github/workflows/validate.yml`.

`AGENTS.md` requires every future API endpoint to include automated success, validation, method, not-found/auth where applicable, and failure-path tests before the change is considered complete.

## Run locally

The frontend itself needs no build step. You can serve the static files with any HTTP server:

```bash
python -m http.server 8000
```

For the complete serverless API behavior, use a Vercel-compatible local/deployment environment.

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

### Full HNG submission deployment

Deploy this repository to Vercel. Vercel will serve the root static frontend and automatically expose the files under `api/` as serverless endpoints.

Repository:

https://github.com/gODtECH-Ctl-Create/todo-hng-task-1

Quick import:

https://vercel.com/new/clone?repository-url=https://github.com/gODtECH-Ctl-Create/todo-hng-task-1

After deployment, verify:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/
https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```

### GitHub Pages fallback

Pushes to `main` continue to trigger `.github/workflows/pages.yml` and deploy the static frontend to:

https://godtech-ctl-create.github.io/todo-hng-task-1/

GitHub Pages does not execute the Node.js files under `api/`.

See [`AGENTS.md`](./AGENTS.md) for project constraints, structured AI-agent instructions, endpoint testing requirements, review steps, and the definition of done.
