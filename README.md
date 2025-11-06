# Best Notepad


Best Notepad is a simple, offline-friendly note-taking application built using pure HTML, CSS and vanilla JavaScript. It started as a basic notepad for creating and editing notes and has evolved into a more powerful tool with tags, dark mode and a built‑in to‑do list.

## Features

- **Create, edit & delete notes** – each note can have a title, content and tags.
- **Search** – filter notes by title, content or tags with the search box.
- **Tagging** – add comma-separated tags to a note and see them displayed as badges.
- **Dark Mode** – toggle between light and dark themes with a click.
- **To-Do list** – manage tasks in a table format:
  - Add tasks with optional due dates.
  - Mark tasks as complete or pending (completed tasks are crossed out).
  - Delete tasks you no longer need.
  - Overdue tasks are highlighted automatically.
- **Responsive design** – works on desktop, tablet and mobile devices.
- **Offline-first** – all notes and tasks are stored in your browser’s local storage, so the app works without an internet connection.
- **Optional backend** – a Node.js/Express backend (with SQLite) is included for persistent storage if you want to deploy it on a server.

## Getting started

### Running the static frontend

1. Clone or download this repository.
2. Open `frontend/index.html` in your web browser.
3. Start taking notes:
   - Click **New Note** to open the modal. Enter a title (optional), tags (comma-separated) and your note content, then click **Save**.
   - Use the search box to filter your notes.
   - Click **Edit** to modify a note or **Delete** to remove it.
   - Use **Dark Mode** in the header to switch themes.
4. Manage tasks in the **To‑Do List** section:
   - Enter a task title and optionally select a due date, then click **Add Task**.
   - Use **Complete** / **Undo** to toggle a task’s status.
   - Click **Delete** to remove a task.
   - Overdue tasks (not completed and with a past due date) will be highlighted.

All data is saved in localStorage, so it will persist across page refreshes on the same device.

### Running the full stack

The `/backend` folder contains a Node.js + Express server with SQLite for storing notes and tasks.

1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` (optional for port configuration).
4. Start the server:
   ```bash
   node server.js
   ```
   The API will be available at `http://localhost:4000/api`.
5. Update the `API_BASE` constant in `frontend/script.js` to point to your server (e.g., `http://localhost:4000/api`).
6. Serve the `frontend` directory using any static server (e.g., `python3 -m http.server`) or deploy it via GitHub Pages/Vercel/Netlify.
7. Notes and tasks will now be persisted in the SQLite database rather than localStorage.

### Deploying

- **Frontend only** – The static version is live on GitHub Pages for this repository.
- **Frontend + Backend** – Deploy the backend to a service like Render, Railway or Fly.io, then update `API_BASE` in the frontend. You can still host the `frontend` folder on GitHub Pages or another static host.

## Roadmap

This project currently covers the essentials of a personal notebook. Future improvements could include:

- Rich text/Markdown support for notes.
- Cloud synchronization across devices.
- Collaboration and real‑time editing.
- User authentication and encryption.
- Extensions/plugins for custom functionality.


### Live Demo

The latest version of this app is always available on GitHub Pages: [https://naimcreates.github.io/Basic_Html_Css/](https://naimcreates.github.io/Basic_Html_Css/). Open this link in your browser to use the notebook without any setup.
