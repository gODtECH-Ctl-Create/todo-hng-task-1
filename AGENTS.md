# AGENTS.md

## Project mission
Build and maintain a simple, polished todo list that is easy to use, easy to review, and safe to deploy on GitHub Pages.

## Product requirements
The application must let a user:
- Add a task.
- Mark a task complete or active.
- Edit a task.
- Delete a task.
- Filter all, active, and completed tasks.
- Search tasks by title.
- Optionally set a due date and priority.
- Keep tasks after refresh using browser localStorage.
- Use the app comfortably on mobile and desktop.

## Technical constraints
- Static frontend only: HTML, CSS, and vanilla JavaScript.
- No backend or database is required.
- No package manager, build step, or runtime dependency is required.
- Assets and links must use relative paths so the project works at the GitHub Pages repository path.
- Never commit secrets, credentials, tokens, or private data.

## Source structure
- `index.html` — semantic page structure and UI controls.
- `styles.css` — responsive visual design, themes, and component states.
- `app.js` — task state, persistence, filtering, search, editing, and rendering.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.
- `README.md` — project overview and usage instructions.

## Working method for agents
For every change, follow this order:
1. Read this file and the files affected by the requested work.
2. Restate the intended user-visible behavior internally before editing.
3. Prefer the smallest change that fully solves the request.
4. Keep state changes in `app.js`; do not mix application logic into HTML event attributes.
5. Render user-provided text with `textContent`, never unsanitized `innerHTML`.
6. Preserve GitHub Pages compatibility and relative asset paths.
7. Check keyboard usability, labels, focus states, and mobile behavior.
8. Verify that existing todo data in localStorage remains compatible unless a migration is intentionally added.
9. Review the final diff for unrelated changes before committing.

## UI rules
- Keep the interface clean and task-focused.
- Use existing CSS variables before introducing new visual tokens.
- Maintain readable contrast in both light and dark themes.
- Keep tap/click targets practical on small screens.
- Avoid decorative dependencies, remote fonts, or assets that can break offline rendering.

## JavaScript rules
- Keep functions small and focused.
- Prefer immutable array updates where practical.
- Persist after every task mutation.
- Treat localStorage data as untrusted and fall back safely if parsing fails.
- Do not introduce framework code unless the project is deliberately migrated and the deployment workflow is updated with it.

## Definition of done
A change is complete when:
- The requested feature works without a console-breaking error.
- Add, complete, edit, delete, filter, and search still work.
- Refresh preserves saved tasks.
- The layout remains usable at phone and desktop widths.
- The page can be served as static files with `index.html` at the repository root.
- GitHub Pages deployment remains valid.

## Deployment
Deployment is handled by `.github/workflows/pages.yml` on pushes to `main` and can also be started manually from GitHub Actions.

If GitHub Pages has never been enabled for the repository, enable it once in **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, pushes to `main` should deploy automatically.

## Commit guidance
Use concise conventional-style messages when possible, for example:
- `feat: add task sorting`
- `fix: preserve due date while editing`
- `style: improve mobile task actions`
- `docs: update usage instructions`
