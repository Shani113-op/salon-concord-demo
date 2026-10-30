# Salon appointment API

Node.js 20+; run commands from `server/`: `npm.cmd install`, then `npm.cmd start`.
`npm.cmd run dev` starts Node's watch mode. Default base URL: `http://localhost:5000`.
Set `$env:PORT = '5001'` in PowerShell to override it. `.env.example` is a reference;
the server reads the process environment and does not automatically load `.env`.

Storage is in memory, with no database or authentication. **Restarting the server
clears all appointments.** Run only one server process for this demo. There is one
stylist: any booked appointment blocks its exact date/time across all services.
There are no service durations or overlapping-duration checks. Dates and times
are local salon wall-clock values with no timezone conversion. Past dates are
allowed. Listing includes booked and cancelled appointments in creation order.

## Response shapes

An appointment always has exactly these fields (ID is a generated UUID):

```json
{"id":"550e8400-e29b-41d4-a716-446655440000","customerName":"Alex","service":"Haircut","date":"2028-02-29","time":"10:30","status":"booked"}
```

`service` is exactly `Haircut`, `Beard Trim`, or `Facial`; `status` is `booked` or
`cancelled`. Success envelopes are listed below; no additional metadata is added.
Every error has exactly this envelope:

```json
{"error":{"code":"VALIDATION_ERROR","message":"customerName must be a nonempty string."}}
```

| Request | Status | Exact response structure |
| --- | --- | --- |
| `GET /api/health` | 200 | `{"status":"ok"}` |
| `GET /api/appointments` | 200 | `{"appointments":[<appointment>, ...]}`; initially `{"appointments":[]}` |
| `POST /api/appointments` | 201 | `{"appointment":<appointment>}` with status `booked` |
| `PATCH /api/appointments/:id/cancel` | 200 | `{"appointment":<appointment>}` with status `cancelled` |

## Create request

Send `Content-Type: application/json` and all four required fields:

```json
{"customerName":"  Alex  ","service":"Haircut","date":"2028-02-29","time":"10:30"}
```

`customerName` must be a string that is nonempty after trimming; stored value is
`Alex`. `date` must be a real Gregorian calendar date formatted `YYYY-MM-DD`,
years 0001–9999. `time` must be zero-padded 24-hour `HH:mm`, 00:00–23:59.
Extra input fields are ignored; clients cannot set ID or status. Validation
reports the first failing field in customerName, service, date, time order.

PowerShell example:

```powershell
$body = @{ customerName = 'Alex'; service = 'Haircut'; date = '2028-02-29'; time = '10:30' } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/appointments -ContentType 'application/json' -Body $body
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/appointments
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/appointments/$($result.appointment.id)/cancel"
```

Cancellation needs no body. Repeated cancellation is idempotent: HTTP 200 with
the same cancelled appointment. Cancellation immediately releases the slot;
rebooking creates a new ID and retains the old cancelled record.

## Error statuses and messages

All rows use `{"error":{"code":<code>,"message":<message>}}`.

| HTTP | Code | Message / condition |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | `Request body must be a JSON object.` |
| 400 | `VALIDATION_ERROR` | `customerName must be a nonempty string.` |
| 400 | `VALIDATION_ERROR` | `service must be Haircut, Beard Trim, or Facial.` |
| 400 | `VALIDATION_ERROR` | `date must be a valid calendar date in YYYY-MM-DD format.` |
| 400 | `VALIDATION_ERROR` | `time must be in HH:mm format (00:00–23:59).` |
| 400 | `INVALID_JSON` | `Request body must contain valid JSON.` (malformed JSON, including primitive JSON bodies rejected by Express) |
| 409 | `SLOT_UNAVAILABLE` | `This date and time are already booked.` |
| 404 | `NOT_FOUND` | `Appointment not found.` (unknown cancellation ID) |
| 404 | `NOT_FOUND` | `Route not found.` |
| 413 | `REQUEST_ERROR` | `Request body could not be processed.` (JSON exceeds Express's default 100 KB limit) |
| 4xx | `REQUEST_ERROR` | `Request body could not be processed.` (other body-parser request errors; status preserved, e.g. 415 unsupported encoding) |
| 500 | `INTERNAL_ERROR` | `An unexpected error occurred.` |

Requests with missing or non-JSON Content-Type have no parsed JSON body and
creation returns 400 `VALIDATION_ERROR`. `npm.cmd test` exercises the API over
HTTP on an automatically assigned loopback port, without starting the listener.
