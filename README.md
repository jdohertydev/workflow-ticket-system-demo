# Workflow Ticket System Demo

A recruiter-facing interactive demo of a lightweight workflow ticket system for a software development house.

## Live-demo architecture

This repository is intentionally separate from the full Flask/SQLAlchemy application.

- Static HTML, CSS and JavaScript only
- Bootstrap 5 interface
- Fictional software-house data only
- No Flask backend
- No database connection
- No API keys or application secrets
- Changes are stored only in the visitor's browser with `localStorage`
- **Reset demo** restores the original fictional dataset

The production-style Flask implementation, including SQLAlchemy models, migrations, validation, CSRF protection and automated tests, lives in the main project repository: [flask-sqlalchemy-task-manager](https://github.com/jdohertydev/flask-sqlalchemy-task-manager).

## Demo features

- Dashboard metrics for open, new, in-progress, blocked, critical and overdue work
- Search and filtering by status, priority, type and project
- Ticket detail view
- Create and edit tickets
- Change workflow status and ownership
- Delete tickets with confirmation
- Project and category reference views
- Responsive Bootstrap UI
- Browser-local persistence and one-click reset

## Running locally

No build process is required. Open `index.html` directly, or serve the folder with any static web server.

For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Safety

This demo is isolated from the real application and uses fictional data. Visitor changes never reach a shared backend or database.
