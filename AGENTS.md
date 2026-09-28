# AGENTS.md

## Project mission
Build and maintain a simple, polished HNG To-Do List application that is easy to use, easy to review, safe to deploy, and verifiable through automated tests, including API endpoint tests.

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
- Frontend: HTML, CSS, and vanilla JavaScript.
- API: minimal Node.js serverless functions under `api/` for endpoint validation and HNG API-testing requirements.
- Tasks remain persisted in browser `localStorage`; there is no database dependency.
- The full app plus API should be deployed on a platform that supports serverless functions, such as Vercel.
- GitHub Pages may remain available as a static frontend-only fallback, but it cannot host the `/api` functions.
- Node.js 20 or newer is used for automated tests and API functions.
- Frontend assets and links must use relative paths so the static frontend continues to work at the GitHub Pages repository path.
- Never commit secrets, credentials, tokens, or private data.

## Source structure
- `index.html` — semantic page structure and UI controls, including create/edit notes fields.
- `styles.css` — responsive visual design, themes, notes presentation, and component states.
- `task-model.js` — reusable task validation, normalization, creation, editing, filtering, and notes-search logic.
- `app.js` — browser state, localStorage persistence, event handling, rendering, and theme behavior.
- `api/health.js` — health/status endpoint.
- `api/validate-task.js` — server-side task validation endpoint.
- `tests/` — automated Node.js tests, including endpoint tests.
- `package.json` — dependency-free test commands.
- `.github/workflows/validate.yml` — automated validation on pushes and pull requests.
- `.github/workflows/pages.yml` — GitHub Pages static deployment workflow.
- `README.md` — project overview, features, API, testing, and deployment instructions.

## Working method for agents
For every change, follow this order:
1. Read this file and every file affected by the requested change.
2. Identify the intended user-visible or API-visible behavior before editing.
3. Check existing tests and add or update tests when behavior changes.
4. Prefer the smallest change that fully solves the request.
5. Keep reusable task rules in `task-model.js`; keep browser/UI orchestration in `app.js`.
6. Keep API handlers small, deterministic, and free of hidden external dependencies unless the architecture is deliberately changed.
7. Do not place application logic in inline HTML event attributes.
8. Render user-provided task titles and notes with `textContent`, never unsanitized `innerHTML`.
9. Preserve GitHub Pages compatibility for the static frontend and Vercel/serverless compatibility for `api/`.
10. Check keyboard usability, labels, focus states, and mobile behavior.
11. Preserve existing localStorage data. Older todos without a `notes` property must continue to load safely.
12. Run the full automated validation suite before declaring the work complete.
13. Review the final diff for unrelated changes before committing.

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

## API rules
- `GET /api/health` must return HTTP 200 with a JSON health response.
- `POST /api/validate-task` must validate and normalize task input and return JSON.
- Unsupported methods must return HTTP 405 and an `Allow` header.
- Invalid JSON or missing required input must return a 4xx response, never an unhandled exception.
- Validation errors must identify the affected field when practical.
- API responses must not expose stack traces, secrets, environment variables, or sensitive implementation details.
- If an endpoint contract changes, its automated tests must change in the same revision.

## Testing and validation rules
Run the full automated suite with:

```bash
npm test
```

Automated frontend/model tests must cover, at minimum:
- Task-title normalization and blank-title rejection.
- Creating a task with notes.
- Editing notes without losing completion state, due date, or priority.
- Searching text stored inside notes.
- Combining search with Active/Completed filters.
- Loading or filtering older saved tasks that do not have a `notes` property.
- Required static UI contracts for the create-notes field, edit-notes field, notes display element, and script loading order.

Automated API tests must cover, at minimum:
- `GET /api/health` success response and HTTP 200.
- `/api/health` unsupported-method behavior and HTTP 405.
- `POST /api/validate-task` success response for valid input.
- Missing/blank required task title.
- Malformed JSON input.
- Invalid priority or other field-level validation.
- Unsupported-method behavior for `/api/validate-task`.

For every future endpoint, add automated tests for:
- The expected success response and status code.
- Required-field and invalid-input validation responses.
- Unsupported HTTP methods where applicable.
- Not-found behavior where applicable.
- Authentication/authorization behavior where applicable.
- A relevant failure/error path without exposing sensitive details.

Do not merge a new API endpoint with only manual testing.

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
- Confirm the GitHub Pages workflow remains valid for the frontend.
- Confirm a serverless deployment exposes `/api/health` and `/api/validate-task`.

## Definition of done
A change is complete only when:
- The requested feature works without a console-breaking error.
- `npm test` passes.
- API endpoint tests pass.
- Add, notes, complete, edit, delete, filter, and search still work.
- Notes persist after refresh and remain editable.
- Existing pre-notes localStorage data remains usable.
- The layout remains usable at phone and desktop widths.
- User-provided content is rendered safely.
- The static frontend can still be served with `index.html` at the repository root.
- The API handlers remain deployable as serverless functions.
- GitHub Pages static deployment remains valid.

## Deployment
Validation is handled by `.github/workflows/validate.yml`. A failed validation run must be fixed before considering the revision ready for submission.

Pushes to `main` continue to trigger the GitHub Pages workflow in `.github/workflows/pages.yml` for the static frontend.

For HNG submission, use a deployment platform that supports the `api/` directory so the live submission URL exposes both the UI and tested endpoints. Vercel is the intended deployment target for the full application.

If GitHub Pages has never been enabled for the repository, enable it once in **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Commit guidance
Use short commit messages that describe the change. Keep unrelated work in separate changes when practical.
