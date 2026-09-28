# AGENTS.md

## Project mission
Build and maintain a simple, polished HNG To-Do List application that is easy to use, easy to review, safe to deploy on GitHub Pages, and verifiable through automated tests.

## Product requirements
The application must let a user:
- Add a task.
- Add optional notes to a task.
- View and edit task notes.
- Mark a task complete or active.
- Edit a task.
- Delete a task.
- Filter all, active, and completed tasks.
- Search tasks by title or notes.
- Optionally set a due date and priority.
- Keep tasks and notes after refresh using browser `localStorage`.
- Use the app comfortably on mobile and desktop.

The notes feature is mandatory. Do not remove or silently break it while changing unrelated functionality.

## Technical constraints
- Static frontend only: HTML, CSS, and vanilla JavaScript.
- No backend or database is currently required.
- Production must not require a package install, build step, framework runtime, or external service.
- Node.js is used only for automated tests and validation.
- Assets and links must use relative paths so the project works at the GitHub Pages repository path.
- Never commit secrets, credentials, tokens, or private data.

## Source structure
- `index.html` — semantic page structure and UI controls, including create/edit notes fields.
- `styles.css` — responsive visual design, themes, notes presentation, and component states.
- `task-model.js` — reusable task validation, normalization, creation, editing, filtering, and notes-search logic.
- `app.js` — browser state, localStorage persistence, event handling, rendering, and theme behavior.
- `tests/` — automated Node.js tests.
- `package.json` — dependency-free test commands.
- `.github/workflows/validate.yml` — automated validation on pushes and pull requests.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.
- `README.md` — project overview, features, testing, and deployment instructions.

## Working method for agents
For every change, follow this order:
1. Read this file and every file affected by the requested change.
2. Identify the intended user-visible behavior before editing.
3. Check existing tests and add or update tests when behavior changes.
4. Prefer the smallest change that fully solves the request.
5. Keep reusable task rules in `task-model.js`; keep browser/UI orchestration in `app.js`.
6. Do not place application logic in inline HTML event attributes.
7. Render user-provided task titles and notes with `textContent`, never unsanitized `innerHTML`.
8. Preserve GitHub Pages compatibility and relative asset paths.
9. Check keyboard usability, labels, focus states, and mobile behavior.
10. Preserve existing localStorage data. Older todos without a `notes` property must continue to load safely.
11. Run the automated validation suite before declaring the work complete.
12. Review the final diff for unrelated changes before committing.

## UI rules
- Keep the interface clean and task-focused.
- Notes must remain clearly associated with their task without overwhelming the task title.
- Use existing CSS variables before introducing new visual tokens.
- Maintain readable contrast in both light and dark themes.
- Keep tap/click targets practical on small screens.
- Avoid decorative dependencies, remote fonts, or assets that can break offline rendering.

## JavaScript rules
- Keep functions small and focused.
- Prefer immutable array updates where practical.
- Persist after every task mutation.
- Treat localStorage data as untrusted and fall back safely if parsing fails.
- Task search must continue to search both task titles and notes.
- Do not introduce framework code unless the project is deliberately migrated and deployment/testing workflows are updated with it.

## Testing and validation rules
Run the full automated suite with:

```bash
npm test
```

Automated tests must cover, at minimum:
- Task-title normalization and blank-title rejection.
- Creating a task with notes.
- Editing notes without losing completion state, due date, or priority.
- Searching text stored inside notes.
- Combining search with Active/Completed filters.
- Loading or filtering older saved tasks that do not have a `notes` property.
- Required static UI contracts for the create-notes field, edit-notes field, notes display element, and script loading order.

For browser-facing changes, also manually validate:
- Create a task with a title and notes.
- Refresh and confirm the task and notes still exist.
- Edit the task notes and confirm the updated value persists after refresh.
- Complete and reactivate a task.
- Search by a word that appears only in the notes.
- Verify All, Active, and Completed filters.
- Delete a task, clear completed tasks, and clear all tasks.
- Check light/dark theme behavior.
- Check the layout at phone and desktop widths.
- Confirm there are no console-breaking errors.
- Confirm the GitHub Pages workflow remains valid.

### API testing rule
This project currently has no API or backend, so endpoint tests are not applicable today.

If an API is introduced later, every endpoint must have automated tests before the feature is considered complete. At minimum test:
- The expected success response and status code.
- Required-field and invalid-input validation responses.
- Not-found behavior where applicable.
- Authentication/authorization behavior where applicable.
- A relevant failure/error path without exposing sensitive details.

Do not merge a new API endpoint with only manual testing.

## Definition of done
A change is complete only when:
- The requested feature works without a console-breaking error.
- `npm test` passes.
- Add, notes, complete, edit, delete, filter, and search still work.
- Notes persist after refresh and remain editable.
- Existing pre-notes localStorage data remains usable.
- The layout remains usable at phone and desktop widths.
- User-provided content is rendered safely.
- The page can be served as static files with `index.html` at the repository root.
- GitHub Pages deployment remains valid.

## Deployment
Deployment is handled by `.github/workflows/pages.yml` on pushes to `main` and can also be started manually from GitHub Actions.

Validation is handled by `.github/workflows/validate.yml`. A failed validation run must be fixed before considering the revision ready for submission.

If GitHub Pages has never been enabled for the repository, enable it once in **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, pushes to `main` should deploy automatically.

## Commit guidance
Use short commit messages that describe the change. Keep unrelated work in separate changes when practical.
