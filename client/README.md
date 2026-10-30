# Salon dashboard

Requires Node.js 20.19+ (or a compatible current Node release).

```powershell
# In a separate terminal, start the backend from server/ first.
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. Development `/api` requests proxy to
`http://localhost:5000`. All API calls live in `src/services/api.js`.

```powershell
npm.cmd run build
npm.cmd run preview
```

Preview serves the production assets. It does not configure an API proxy;
production hosting must route `/api` to the backend on the same origin.
Use the development server to exercise the demo locally.

Browser regression checks use installed Microsoft Edge and start both servers:

```powershell
# Stop existing servers on ports 5000 and 5173 before this command.
npx.cmd playwright test
```

These tests use a fresh in-memory backend. They cover an empty list, booking,
duplicate feedback, cancellation, rebooking, mobile layout, and network failure.
No authentication or persistent storage is provided. Backend restart clears
appointments. Google Fonts are optional; local font fallbacks work offline.
