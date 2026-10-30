# Salon demo trial notes

Recorded on 2026-10-30. This was **one Codex session working sequentially** on
registration, backend, frontend, and documentation. Cross-agent messaging and
collision handling were **not tested**. Successful zero-overlap claims do not
demonstrate collision enforcement, concurrent editing, or handoffs to peers.

## Versions and evidence sources

- `concord.cmd --version` returned **0.18.0** during documentation preparation;
  the installed `@concord-ai/concord-mcp` package also reported 0.18.0.
- `codex.cmd --version` returned **codex-cli 0.166.0**. It also warned that PATH
  aliases could not be created because the home directory could not be found;
  the version command still completed successfully.
- Node **v24.21.0** was verified during backend work. The frontend build reported
  Vite **7.3.7**. These are observed versions, not claims about all compatible
  versions or a separately verified model version.
- Evidence below comes from this session's actual local commands and Concord
  `inspect_work` task records, including decisions, progress, completion
  evidence, and ownership history. Local `.concord/` records are excluded from
  Git; this document is a portable summary, not a full database export.

## Actual task records and claims

| Task | Claimed files | Observed lifecycle evidence |
| --- | --- | --- |
| `verify-concord-session-001` | `docs/trial-notes.md` | New claim at version 1; closed at version 2; no files edited |
| `salon-backend-001` | `server/`, `docs/api-contract.md` | New claim at version 1; complete at version 2; two recorded updates |
| `salon-frontend-001` | `client/` | New claim at version 1; complete at version 2; two recorded updates |
| `salon-documentation-001` | `README.md`, `.gitignore`, `docs/trial-notes.md` | Started at version 1 with zero overlaps; final completion is recorded by `finish_work` after the documentation checks |

The initial registration attempt supplied an empty task ID and failed schema
validation: `Too small: expected string to have >=1 characters at task_id`.
The session then inspected the installed schema and implementation, confirmed
caller-assigned nonempty IDs, and successfully used the supplied verification
ID. It closed that task with the returned version 1, receiving version 2.
No invented versions or task IDs were needed for the successful workflow.

Before backend edits, the session read AGENTS.md, inspected placeholder files,
inspected the workspace, and claimed only the backend scope. Before frontend
edits, it read the exact API contract and inspected `salon-backend-001`, whose
record showed complete/version 2 and the backend's decisions and checks.
Documentation preparation inspected the workspace and both implementation tasks
again, plus the closed verification task. All observed claims reported zero
overlaps; there was no overlap to resolve.

## Recorded decisions and completion evidence

The backend decision update recorded the success envelopes `{appointments}`
and `{appointment}`, consistent `{error:{code,message}}` errors, 400 validation
and malformed-JSON handling, 409 slot conflicts, 404 unknown IDs, the
single-stylist assumption, and idempotent repeated cancellation returning 200.
It also recorded trimmed names, real calendar dates, strict time format,
in-memory storage, separate app/listener, and server-local npm scripts.

The backend completion listed the package manifest and lockfile, environment
example and ignore file, app/listener, routes, controller, data module, HTTP
tests, and API contract. It used the current version 1 and returned complete at
version 2. Its recorded checks were:

- Dependency installation succeeded; audit reported zero vulnerabilities.
- JavaScript syntax checks passed for all backend source files.
- Backend HTTP suite: **7 tests passed, 0 failed** (six subtests plus the parent).
  Covered health, create/list, trimmed name, missing/invalid inputs, calendar
  boundaries, malformed JSON, duplicate slot across services, cancellation,
  repeated cancellation, rebooking the released slot, and unknown ID/route.
- Actual listener health checks passed on default port 5000 and custom port
  51237. A fresh process returned an empty appointment list. Processes were
  stopped after verification.

The frontend decision update recorded exact contract unwrapping in
`src/services/api.js`, relative requests, the Vite proxy to localhost:5000,
serialized actions with a synchronous guard and disabled controls, refreshing
after changes, and separate reporting when a successful save cannot refresh.
Its completion listed client package/configuration files, HTML, components,
CSS, service, README, and browser tests. It used current version 1 and returned
complete at version 2. Its recorded checks were:

- Dependency installation succeeded; audit reported zero vulnerabilities.
- Production build passed: Vite 7.3.7 transformed 32 modules.
- **Two Playwright tests passed in actual headless Microsoft Edge**, using a
  fresh real backend through the Vite development proxy. Covered initial empty
  list, booking and trimmed name, duplicate-slot message, cancellation and
  status refresh, released-slot rebooking, and simulated network-error feedback
  with an enabled Refresh button.
- The 390px mobile layout had one column and no horizontal overflow. The
  full-page screenshot was viewed. The booking test reported no page JS errors.
- The first browser run failed because its status locator matched both success
  and loading messages. The test selector was narrowed and the full suite then
  passed; this was not reported as a passing initial run.

Documentation adds reproducible PowerShell commands and publication exclusions
without changing application code. Its task records the source records used,
version checks, ignore-rule checks, status review, and remaining limits. The
implementation suites were not rerun solely for documentation changes; their
results above are evidence from the implementation tasks.

Documentation checks performed:

- Compared the run/test instructions with both package manifests and the
  Playwright configuration; commands use existing scripts and installed Edge.
- `git status --short --untracked-files=all` and
  `git ls-files --others --exclude-standard` showed only intended source,
  portable instructions, lockfiles, environment examples, and documentation
  eligible after the ignore update.
- `git check-ignore -v` confirmed exclusion of Concord database and sidecar,
  agent/MCP configs, dependencies, build output, browser screenshot output,
  local `.env`, a credentials filename, and a log filename. Some sample paths
  are rule probes, not claims that credential files exist.
- A targeted text scan of the new documents and portable agent instructions
  found no Windows/home-directory paths or password/API-key assignments. This
  was a targeted check, not a comprehensive secret-scanner audit.

## Windows setup friction and provenance

The user reports that PowerShell blocked `concord.ps1` during setup and that
hook commands were changed to **`concord.cmd`**. This is user-reported setup
history: the present session did not perform or reproduce that hook change.
Inspected repository hook files still used bare `concord` commands and did not
independently establish the reported change, which may concern configuration
outside this repository. No hook configuration was edited in this task.

This session directly observed PowerShell blocking **`npm.ps1`** with
`PSSecurityException` / `UnauthorizedAccess`; using `npm.cmd` avoided that
script-policy restriction. Sandboxed dependency installation encountered a
stall or `EACCES`, and Vite/esbuild encountered `Access is denied` while reading
parent directories. Approved execution outside the sandbox succeeded. These
are separate observations from the user-reported Concord hook issue.

## Publication exclusions and limitations

Git status initially showed local agent directories, MCP files, source, and
documentation as untracked. Local MCP configuration contained absolute machine
paths. Root ignore rules exclude those local configs (including `.github/mcp.json`),
`.concord/` databases and generated records, database sidecars, secret/env files,
logs, dependencies, build output, caches, and browser reports. Portable
instructions, source, lockfiles, and `.env.example` files remain eligible.
No credentials, database contents, logs, or personal machine paths are included
in these new documents. Ignoring files does not remove already tracked files;
the initial `git ls-files` output was empty in this repository.

Remaining limits: in-memory process-local storage, no authentication, no service
duration model, no timezone conversion, and no production deployment or API
reverse proxy verification. Edge was the only browser tested. Other browsers,
screen-reader behavior, exhaustive keyboard/accessibility checks, browser
validation-field permutations, and rapid-click prevention remain manual.
Optional Google Fonts need network access, with local fallbacks provided.
No cross-agent prompts, replies, collision resolution, peer handoffs, commits,
or pushes were performed in this trial.
