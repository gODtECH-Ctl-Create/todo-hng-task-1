# TaskFlow Todo List

A fast, responsive todo list built with plain HTML, CSS, and JavaScript and designed to run on GitHub Pages.

## Live site

https://godtech-ctl-create.github.io/todo-hng-task-1/

## Features

- Add, edit, complete, and delete tasks
- Due dates and priority levels
- All / Active / Completed filters
- Task search
- Live task counters
- Browser `localStorage` persistence
- Light and dark themes
- Responsive mobile and desktop layout
- Accessible labels, focus states, and keyboard-friendly controls

## Run locally

No installation is required. Open `index.html` in a browser or serve the repository with any static HTTP server.

For example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
.
├── .github/workflows/pages.yml
├── AGENTS.md
├── app.js
├── index.html
├── styles.css
└── README.md
```

## Deployment

Pushes to `main` trigger the GitHub Pages workflow in `.github/workflows/pages.yml`.


See [`AGENTS.md`](./AGENTS.md) for project constraints, coding rules, review steps, and the definition of done.
