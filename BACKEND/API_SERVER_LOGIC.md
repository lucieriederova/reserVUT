# API and Server Logic Map

Last updated: 2026-02-25

## 1. Backend architecture

- Runtime: Node.js + Express + TypeScript (ESM)
- ORM: Prisma (`@prisma/client`)
- DB: PostgreSQL (Supabase)
- Fallback mode: in-memory store (`src/services/memoryStore.ts`) when Prisma operation fails
- Entry point: `src/server.ts`

Request flow:

1. HTTP request reaches Express app in `src/server.ts`
2. Router dispatches by prefix:
   - `/api/auth` -> `src/routes/authRoutes.ts`
   - `/api/reservations` -> `src/routes/reservationRoutes.ts`
3. Controller handles validation + business logic
4. Controller tries Prisma first, then falls back to memory store in selected paths

## 2. Routes map

### Health check

- `GET /`
- Purpose: simple liveness check
- Response: plain text (`reserVUT API is running...`)

### Auth routes

- Prefix: `/api/auth`
- File: `src/routes/authRoutes.ts`

Endpoints:

- `POST /api/auth/login` -> `loginUser`

Notes:

- `registerUser` exists in `src/controllers/authController.ts` but is currently **not wired** to router.

### Reservation routes

- Prefix: `/api/reservations`
- File: `src/routes/reservationRoutes.ts`

Endpoints:

- `GET /api/reservations` -> `listReservations`
- `POST /api/reservations` -> `createReservation`

## 3. Auth logic (`loginUser`)

File: `src/controllers/authController.ts`

Input body:

- `email` (required)
- `role` (required): `Student | CEO | Guide | Head Admin` (or uppercase variants)

Validation:

- Rejects missing `email`/`role` with `400`
- Accepts only `@vut.cz` / `@vutbr.cz` domains
- Maps UI roles to Prisma enum values:
  - `Student` -> `STUDENT`
  - `CEO` -> `CEO`
  - `Guide` -> `GUIDE`
  - `Head Admin` -> `HEAD_ADMIN`

DB behavior:

- If user by email exists:
  - updates `role`
  - updates `isVerified` (`true` for `STUDENT`, `HEAD_ADMIN`; otherwise `false`)
  - returns `200`
- If user does not exist:
  - creates user with generated `vutId` (`vut-${Date.now()}`)
  - returns `201`

Fallback behavior:

- If Prisma path fails, uses `upsertMemoryUser(...)` and returns `200`

## 4. Reservation logic (`createReservation`)

File: `src/controllers/reservationController.ts`

Accepted request aliases:

- Room: `roomName` or `roomId`
- Priority: `priorityLevel` or `priority`
- Type label: `type` or `title`

Required resolved fields:

- `userId`
- resolved room name
- `startTime`
- `endTime`

Validation rules:

- Reservation duration must be `> 0` and `<= 3 hours`
- Priority must be numeric

Conflict and priority engine:

1. Find overlapping reservations in same room:
   - `existing.startTime < new.endTime`
   - `existing.endTime > new.startTime`
2. If conflicts exist:
   - If new priority is strictly higher than max existing priority:
     - delete conflicting reservations (pre-emption)
     - create new reservation
   - Else:
     - reject with `409 Conflict`

Persistence:

- Prisma create on success (`201`)
- If Prisma path fails, fallback to memory store:
  - `createMemoryReservation(...)`
  - preserves same conflict semantics

## 5. Reservation read logic (`listReservations`)

File: `src/controllers/reservationController.ts`

Primary path:

- `prisma.reservation.findMany(...)`
- includes user projection: `id`, `email`, `role`
- ordered by `startTime ASC`

Fallback path:

- If Prisma read fails -> `listMemoryReservations()`

## 6. Data model map (Prisma)

File: `prisma/schema.prisma`

Enums:

- `Role`: `STUDENT | CEO | GUIDE | HEAD_ADMIN`

Models:

- `User`
  - `id` (uuid)
  - `vutId` (unique)
  - `email` (unique)
  - `role`
  - `isVerified`
  - `createdAt`
- `Reservation`
  - `roomName`, `startTime`, `endTime`
  - `priorityLevel`, `type`
  - `userId` (FK -> User)
- `AuditLog`
  - prepared for cancellation audit (currently not used by exposed routes)

## 7. Frontend -> API interaction map

Frontend client file: `FRONTEND/src/lib/api.ts`

- `login(email, password, role)`:
  1. Supabase auth: `signInWithPassword`
  2. backend sync: `POST /api/auth/login`
- `registerAccount(email, password, firstName, lastName)`:
  1. Supabase `signUp` with metadata (`first_name`, `last_name`, `full_name`)
  2. backend sync as `Student` via `POST /api/auth/login`
- `sendPasswordReset(email)`:
  - Supabase password reset email
- `fetchReservations()`:
  - `GET /api/reservations`
- `createReservation(payload)`:
  - `POST /api/reservations`

## 8. Environment variables

Backend (`BACKEND/.env`):

- `DATABASE_URL` (pooled)
- `DIRECT_URL` (direct)
- optional `PORT`

Frontend (Vercel):

- `VITE_API_URL` (must point to backend base, e.g. `https://...up.railway.app/api`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 9. Known gaps and technical debt

- `registerUser` controller is unused (no route wiring).
- User `firstName`/`lastName` are stored in Supabase metadata, not in backend Prisma `User`.
- `cors()` is currently open/default; no explicit origin policy.
- Business rules are implemented in controller directly; priority/constraint logic is only partially abstracted.

## 10. Quick manual API tests

Auth login:

```bash
curl -i -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"269387@vutbr.cz","role":"Student"}'
```

Create reservation:

```bash
curl -i -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"userId":"<USER_ID>","roomName":"Meeting Room","startTime":"2026-02-25T10:00:00.000Z","endTime":"2026-02-25T11:00:00.000Z","priorityLevel":1,"type":"Manual test"}'
```

List reservations:

```bash
curl -i http://localhost:5001/api/reservations
```
