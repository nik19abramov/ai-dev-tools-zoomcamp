# Collaborative Interview Sandbox (Week 2)

End-to-end web app for shared code interviews. React + Vite frontend, Express + Socket.IO backend, in-browser JS/Python execution (Pyodide).

## Project structure
- `package.json` (root) – workspace scripts
- `client/` – Vite React app
- `server/` – Express + Socket.IO

## Commands
Install deps (from `week2/`):
```bash
npm install
```

Run backend:
```bash
npm run dev:server
```

Run frontend:
```bash
npm run dev:client
```

Tests (none yet):
```bash
npm test
```

## How it works
- **Rooms:** New Session creates `/room/<id>`. Share the URL; everyone sees the same buffer.
- **Sync:** Socket.IO broadcasts code + language changes per room.
- **Editor:** CodeMirror with JS/Python highlighting.
- **Run code:**  
  - JavaScript: executed via an async Function with captured console (no global eval).  
  - Python: Pyodide loaded from CDN, `runPythonAsync` for output.

## Backend (server/index.js)
- Joins rooms, sends initial state, broadcasts `code_change` and `language_change`.
- In-memory room state (code + language). Health check at `/health`.

## Frontend highlights
- Routing: `/` landing + `/room/:roomId` collaborative editor.
- Components: `App.jsx`, `components/Room.jsx`, `components/collab/Editor.jsx`.
- Socket client: `src/socket.js` (`joinRoom`, shared socket instance).
- Output panel shows stdout/errors; language selector controls highlighting and runner.

## Notes
- Socket endpoint defaults to `http://localhost:4000` (override with `VITE_SOCKET_URL`).
- All code execution stays in-browser; server is only for synchronization.
