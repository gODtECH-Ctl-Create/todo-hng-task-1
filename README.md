# TaskFlow Todo List

A fast, responsive To-Do List application built with plain HTML, CSS, and JavaScript and designed to run on GitHub Pages.

This project was coded entirely through an AI-assisted development workflow for the HNG task.

## Live site

https://godtech-ctl-create.github.io/todo-hng-task-1/

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

## Additional features

Beyond the required todo and notes functionality, TaskFlow includes due dates, priorities, search, filtering, overdue detection, persistent browser storage, task counters, and theme switching.

## Automated validation

The project includes dependency-free automated tests using Node.js' built-in test runner.

Requirements:

- Node.js 20 or newer

Run:

```bash
npm test
```

The tests validate task creation, blank-title rejection, notes creation/editing, notes search, task filtering, compatibility with older tasks, required notes UI elements, safe text rendering, and script loading order.

GitHub Actions also runs the same test suite automatically on pushes to `main`, pull requests, and manual workflow runs through `.github/workflows/validate.yml`.

The project has no backend or API at present, so API endpoint tests are not applicable. `AGENTS.md` requires endpoint tests for success, validation, authentication/authorization where applicable, not-found, and failure cases if an API is introduced later.

## Run locally

The production application needs no installation or build step. Open `index.html` in a browser or serve the repository with any static HTTP server.

For example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
.
├── .github/workflows/
│   ├── pages.yml
│   └── validate.yml
├── tests/
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

Pushes to `main` trigger the GitHub Pages deployment workflow in `.github/workflows/pages.yml`.

Live URL:

https://godtech-ctl-create.github.io/todo-hng-task-1/

See [`AGENTS.md`](./AGENTS.md) for project constraints, structured AI-agent instructions, testing rules, API validation requirements, review steps, and the definition of done.
