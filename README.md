# Workflow Ticket System Demo

Interactive, recruiter-facing demo of a lightweight workflow ticket system for
a software development team.

## Live demo

**[Open the live demo](https://workflow-ticket-system-demo.vercel.app/)**

The demo is hosted on Vercel and uses fictional data only. Changes are stored
in the visitor's browser and can be restored with **Reset Demo**.

The demo mirrors the user experience of a fuller Flask/SQLAlchemy implementation
while remaining completely isolated from its backend and database.

## Live-demo architecture

This repository is intentionally static:

- HTML, CSS and vanilla JavaScript only
- Bootstrap 5 and Bootstrap Icons from a CDN
- fictional software-house data only
- no Flask backend
- no PostgreSQL or Neon connection
- no API keys or application secrets
- no shared writable state
- browser-local changes through `localStorage`
- one-click reset to the original fictional dataset

The fuller implementation includes Flask, SQLAlchemy, migrations, CSRF
protection, server-side validation and automated tests. It is maintained
separately from this public recruiter demo.

## Demo features

- dashboard metrics for active work
- search and filtering by status, priority, type and project
- ticket detail pages
- create and edit ticket flows
- workflow status and ownership changes
- delete confirmation
- project and category reference views
- responsive Bootstrap interface
- browser-local persistence
- Reset Demo control

## Running locally

No dependency installation or build step is required.

Serve the repository with any static web server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Safety model

All data is fictional. User-created changes are stored only in the current
browser. Visitors do not share state, and the demo contains no credentials,
backend connection or remote database mutation path.
