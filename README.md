# Studio Salon appointment demo

A small salon dashboard built with React, Vite, plain CSS, and an Express API.
Book a Haircut, Beard Trim, or Facial, view appointments, and cancel a booking.
The interface includes loading, empty, success, and error states, backend
validation messages, duplicate-slot feedback, and disabled pending actions.
The warm neutral and teal layout stacks the form and schedule on mobile.

## Setup and run (PowerShell)

Install Node.js 24 LTS (the tested runtime was 24.21.0) with npm. The browser
tests also require Microsoft Edge installed. Start in the cloned repository's
root directory. Commands use `npm.cmd` to avoid PowerShell script-policy issues.
There is no root package.json; install each application separately.

```powershell
# From the repository root, install locked dependencies.
Push-Location .\server
npm.cmd ci
Pop-Location
Push-Location .\client
npm.cmd ci
Pop-Location
```

Terminal 1, from the repository root:

```powershell
Set-Location .\server
$env:PORT = '5000'
npm.cmd start
# For backend watch mode instead: npm.cmd run dev
```

Terminal 2, from the repository root:

```powershell
Set-Location .\client
npm.cmd run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). Keep both terminals
running; use Ctrl+C to stop them. The backend defaults to port 5000 and can read
another port from `PORT`, but the frontend development proxy targets
`http://localhost:5000`. Use port 5000 when running the frontend as configured.
The backend does not automatically load `.env`; `.env.example` is a reference.

## Checks

Backend HTTP tests, from the repository root (no separately running server needed):

```powershell
Push-Location .\server
npm.cmd test
Pop-Location
```

Frontend production build, from the repository root:

```powershell
Push-Location .\client
npm.cmd run build
Pop-Location
```

Browser tests, from the repository root with Microsoft Edge installed:

```powershell
# Stop development servers first. Tests need free ports 5000 and 5173.
# Remove a custom PORT value from this terminal, if one was set.
Remove-Item Env:PORT -ErrorAction SilentlyContinue
Push-Location .\client
npx.cmd playwright test
Pop-Location
```

Playwright starts a fresh real backend and Vite, runs headless Edge, and shuts
the servers down afterward. Tests cover empty list, booking, duplicate feedback,
cancellation, rebooking, mobile layout, and a simulated network failure. Browser
results and screenshots are generated locally and excluded from Git.

To preview a completed production build:

```powershell
Push-Location .\client
npm.cmd run preview
Pop-Location
```

Preview serves static assets; it does **not** proxy API requests. Use the
development server for the fully connected local demo.

## API and demo limits

- Storage is in memory. Restarting the backend clears every appointment;
  multiple backend processes do not share data.
- There is one stylist. Only one booked appointment may occupy an exact date
  and time, across all services. Durations and overlapping intervals are not
  modeled. Cancellation releases the slot; repeated cancellation returns 200.
- There is no authentication or authorization. Anyone who can reach the API
  can list, create, and cancel appointments. This is a demo, not a production
  booking service.
- Dates and times are local salon wall-clock values, with no timezone
  conversion. Past dates are allowed.
- The frontend uses relative `/api` requests. Vite proxies these to the backend
  during development. Production hosting must serve the frontend and route
  `/api` to the Express backend on the same origin; this deployment routing is
  not configured here. No separate-origin CORS setup is provided.
- Optional Google Fonts use the network; local fallback fonts are available.

Endpoints: `GET /api/health`, `GET /api/appointments`,
`POST /api/appointments`, and `PATCH /api/appointments/:id/cancel`.
See [the API contract](docs/api-contract.md) for exact request/response shapes,
validation, and status codes.

## Repository and verification notes

`server/` contains the app, listener, routes, controllers, in-memory data, and
HTTP tests. `client/` contains the dashboard, API service, and browser tests.
[Trial notes](docs/trial-notes.md) distinguish recorded Concord evidence from
untested behavior. This work used one Codex session sequentially; cross-agent
messaging and collision handling were not tested.

Root ignore rules exclude local agent/MCP configuration, Concord databases and
generated records, credentials/environment files, dependencies, logs, build
output, and browser reports. Source, package lockfiles, example environment
files, and portable project instructions remain eligible for Git. No commit
or push was performed as part of preparation.
