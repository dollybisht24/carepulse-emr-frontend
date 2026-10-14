# CarePulse EMR Frontend

The React frontend for CarePulse EMR, a hospital appointment management system. It provides role-based dashboards and appointment workflows for administrators, receptionists, and doctors.

## Features

- Role-aware dashboard and navigation
- Appointment scheduling, booking, and registry
- Doctor schedule management for administrators
- Audit log viewer for administrators
- Doctor patient queue
- JWT access-token handling with automatic refresh through an HttpOnly cookie
- Live updates over Socket.IO
- Interactive Swagger API documentation link

## Requirements

- Node.js 18 or later
- npm
- The CarePulse EMR backend running on `http://localhost:5000` for API and Socket.IO requests

## Getting started

From this directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite development server proxies `/api` and `/socket.io` requests to the backend at `http://localhost:5000`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Application routes

| Route | Access |
| --- | --- |
| `/login` | Public |
| `/` | Signed-in users |
| `/scheduler` | Signed-in users |
| `/appointments` | Signed-in users |
| `/book` | Administrators and receptionists |
| `/admin/schedules` | Administrators |
| `/admin/audit-logs` | Administrators |

## Project structure

```text
src/
  components/   Shared UI and domain components
  context/      Authentication context
  hooks/        Reusable React hooks
  layouts/      Application layouts and navigation
  pages/        Route-level screens
  routes/       Route and role protection
  services/     API and Socket.IO clients
```

The frontend expects the backend API under `/api/v1`. In local development, the Vite proxy forwards those requests, including WebSocket traffic, to the backend.
