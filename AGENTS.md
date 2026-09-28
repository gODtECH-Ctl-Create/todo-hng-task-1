# AGENTS.md

## Project mission
Build and maintain a polished HNG To-Do List application that is easy to use, easy to review, safe to deploy, and verifiable through automated tests, including API endpoint tests.

## Product requirements
The application must let a user:
- Add a task.
- Add optional notes to a task.
- View and edit task notes.
- Assign a task category: General, Work, Personal, Study, or Errands.
- Optionally set a due date and Low, Normal, or High priority.
- Mark a task complete or active.
- Edit and delete a task.
- Undo an individual task deletion from the toast notification.
- Filter All, Active, and Completed tasks.
- Search tasks by title, notes, or category.
- Sort by manual order, newest, oldest, due date, or priority.
- Drag and reorder tasks in the unfiltered Manual-order view.
- See total, active, completed, and completion-progress information.
- See clear due-date states such as overdue, due today, due tomorrow, or days remaining.
- Keep tasks, notes, categories, and manual order after refresh using browser `localStorage`.
- Use the app comfortably on mobile and desktop in light or dark theme.

The notes feature is mandatory. Do not remove or silently break it while changing unrelated functionality.

## Technical constraints
- Frontend: HTML, CSS, and vanilla JavaScript.
- API: minimal Node.js serverless functions under `api/` for endpoint validation and HNG API-testing requirements.
- Tasks remain persisted in browser `localStorage`; there is no database dependency.
- The full app plus API is deployed on Vercel.
- GitHub Pages may remain available as a static frontend-only fallback, but it cannot host the `/api` functions.
- Node.js 20 or newer is used for automated tests and API functions.
- Frontend assets and links must use relative paths so the static frontend continues to work at the GitHub Pages repository path.
- Never commit secrets, credentials, tokens, or private data.

## Source structure
- `index.html` — semantic page structure and UI controls, including notes, category, sort, progress, drag handle, toast, and edit controls.
- `styles.css` — responsive visual design, themes, task cards, badges, drag states, progress, and toast states.
- `task-model.js` — reusable task normalization, creation, editing, filtering, categories, and sorting logic.
- `app.js` — browser state, localStorage persistence, event handling, rendering, drag ordering, toast undo, due-state display, progress, API status, and theme behavior.
- `api/health.js` — health/status endpoint.
- `api/validate-task.js` — server-side task validation endpoint.
- `tests/` — automated Node.js tests, including model, static UI contract, and endpoint tests.
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
10. Check keyboard usability, labels, focus states, reduced-motion behavior, and mobile behavior.
11. Preserve existing localStorage data. Older todos without `notes` or `category` must continue to load safely.
12. Run the full automated validation suite before declaring the work complete.
13. Review the final diff for unrelated changes before committing.

## UI rules
- Keep the interface clean and task-focused; new controls must earn their space.
- Notes must remain clearly associated with their task without overwhelming the title.
- Category, priority, and due-state badges must remain readable in light and dark themes.
- Progress must be derived from actual completed/total task counts.
- Drag affordances must clearly indicate when reordering is unavailable.
- Manual drag ordering is enabled only for **All + Manual order + empty search**. Sorted or filtered views must not mutate persisted manual order.
- Toasts must not block core controls and the delete toast must expose an Undo action.
- Empty-state copy should reflect search/filter context rather than always showing the same message.
- Use existing CSS variables before introducing new visual tokens.
- Maintain readable contrast in both light and dark themes.
- Keep tap/click targets practical on small screens.
- Avoid remote fonts or decorative runtime dependencies that can break offline/static rendering.

## JavaScript rules
- Keep functions small and focused.
- Prefer immutable array updates where practical; direct array mutation is acceptable for deliberate manual reordering and undo insertion.
- Persist after every task mutation and every manual reorder.
- Treat localStorage data as untrusted and fall back safely if parsing fails.
- Task search must continue to search task titles, notes, and categories.
- New tasks and older tasks with unknown categories must normalize safely to `general`.
- Sorting must operate on copies and must not mutate the persisted manual task order.
- Due-date labels must be based on local calendar days, not UTC midnight assumptions.
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
- Creating a task with notes and category.
- Safe category fallback for unknown/legacy tasks.
- Editing notes and category without losing completion state, due date, or priority.
- Searching text stored inside notes and categories.
- Combining search with Active/Completed filters.
- Loading/filtering older saved tasks that do not have `notes` or `category`.
- Newest, oldest, due-date, and priority sorting without mutating source order.
- Required static UI contracts for notes, categories, sort controls, progress, drag handle, toast/undo, API status, and script loading order.
- Safe user-content rendering with `textContent`.

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
- Create a task with title, notes, category, priority, and due date.
- Refresh and confirm all task data still exists.
- Edit notes/category and confirm the updated values persist after refresh.
- Complete and reactivate a task and verify the progress bar/count changes.
- Search by a word that appears only in notes and by a category name.
- Verify All, Active, and Completed filters.
- Verify Newest, Oldest, Due date, Priority, and Manual sort modes.
- In All + Manual order with no search, drag a task and confirm order persists after refresh.
- Confirm drag is disabled while filtered, searching, or using a non-Manual sort.
- Delete one task and verify Undo restores it to its previous position.
- Verify overdue, today, tomorrow, and future due-state badges.
- Delete/clear tasks and verify contextual empty states.
- Check light/dark theme behavior.
- Check the layout at phone and desktop widths.
- Confirm there are no console-breaking errors.
- Confirm the GitHub Pages workflow remains valid for the frontend.
- Confirm the Vercel deployment exposes `/api/health` and `/api/validate-task`.

## Definition of done
A change is complete only when:
- The requested feature works without a console-breaking error.
- `npm test` passes, including API endpoint tests.
- Add, notes, categories, complete, edit, delete, undo, filter, search, sort, and drag reorder still work.
- Progress and due-state labels reflect task state correctly.
- Notes, categories, and manual order persist after refresh.
- Existing legacy localStorage data remains usable.
- The layout remains usable at phone and desktop widths.
- User-provided content is rendered safely.
- The static frontend can still be served with `index.html` at the repository root.
- The API handlers remain deployable as serverless functions.
- GitHub Pages static deployment remains valid.
- The Vercel production deployment remains healthy.

## Deployment
Validation is handled by `.github/workflows/validate.yml`. A failed validation run must be fixed before considering the revision ready for submission.

Pushes to `main` continue to trigger the GitHub Pages workflow in `.github/workflows/pages.yml` for the static frontend.

For HNG submission, use the Vercel deployment so the live submission URL exposes both the UI and tested endpoints.

If GitHub Pages has never been enabled for the repository, enable it once in **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Commit guidance
Use short descriptive commit messages. Keep unrelated work in separate changes when practical.
