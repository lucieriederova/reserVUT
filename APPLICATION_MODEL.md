# Application Model

Last updated: 2026-02-25

## 1. System purpose

`reserVUT` is a room reservation system for VUT users with role-based priority and conflict pre-emption.

## 2. Context model (high-level)

Actors:

- `Student`
- `CEO`
- `Guide`
- `Head Admin`

External systems:

- `Supabase Auth` (identity, credentials, password reset)
- `PostgreSQL (Supabase)` via Prisma (app data)
- `Vercel` (frontend hosting)
- `Railway` (backend hosting)

## 3. Container model

### Frontend container

- Tech: React + Vite + TypeScript
- Path: `FRONTEND/`
- Responsibilities:
  - login/signup/reset UI
  - role selection
  - reservation UI and interaction
  - calls backend API
  - calls Supabase auth directly for credential operations

### Backend container

- Tech: Express + TypeScript + Prisma
- Path: `BACKEND/`
- Responsibilities:
  - auth sync into app `User` model (`/api/auth/login`)
  - reservation CRUD entrypoints (currently list/create)
  - validation + constraint + priority engine
  - persistence through Prisma
  - fallback to in-memory store on DB path failure

### Data container

- Primary DB: PostgreSQL (Supabase)
- Schema: `User`, `Reservation`, `AuditLog`, `Role`
- Managed by Prisma schema in `BACKEND/prisma/schema.prisma`

### Identity container

- Supabase Authentication
- Stores:
  - email/password
  - password reset flow
  - auth user metadata (currently includes signup `first_name`/`last_name`)

## 4. Component model (backend)

Entry:

- `src/server.ts`

Routing:

- `src/routes/authRoutes.ts`
- `src/routes/reservationRoutes.ts`

Controllers:

- `src/controllers/authController.ts`
- `src/controllers/reservationController.ts`

Services:

- `src/services/memoryStore.ts` (fallback persistence + conflict behavior)
- `src/services/priorityEngine.ts` (exists, partial/auxiliary usage)

## 5. Key application flows

### Flow A: Login

1. User enters email/password + role in frontend.
2. Frontend calls `supabase.auth.signInWithPassword`.
3. On success, frontend calls backend `POST /api/auth/login`.
4. Backend upserts user role/verification in app DB.
5. Frontend stores resulting user session info in local storage (`inprofo_user`).

### Flow B: Sign up

1. User opens signup modal and enters first name, last name, email, password.
2. Frontend calls `supabase.auth.signUp` with metadata.
3. Frontend syncs app domain user through `POST /api/auth/login` as `Student`.
4. User can then log in through standard login flow.

### Flow C: Create reservation

1. Frontend sends reservation request to `POST /api/reservations`.
2. Backend validates required fields + duration constraints.
3. Backend resolves overlap and compares priorities.
4. If higher priority request arrives, conflicting lower priority records are pre-empted.
5. Backend persists and returns created reservation.

## 6. Domain model (application-level)

### User aggregate

- Identity: `id`, `email`, `vutId`
- Authorization: `role`, `isVerified`

### Reservation aggregate

- Scheduling: `roomName`, `startTime`, `endTime`
- Priority semantics: `priorityLevel`
- Ownership: `userId`

### Audit record

- Tracks cancellation/pre-emption intent (`AuditLog`) for administrative traceability.

## 7. Business rules model

- Allowed email domains: `@vut.cz`, `@vutbr.cz`
- Reservation max duration: 3 hours
- Conflict rule:
  - new booking accepted only if it has strictly higher priority than current conflict max
  - otherwise `409 Conflict`
- Verification rule (as implemented now):
  - auto-verified: `STUDENT`, `HEAD_ADMIN`
  - non-auto-verified: `CEO`, `GUIDE`

## 8. Deployment model

### Frontend deployment

- Host: Vercel
- Required env:
  - `VITE_API_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Backend deployment

- Host: Railway
- Required env:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - optional `PORT`

## 9. Current architectural gaps

- `firstName`/`lastName` are not yet persisted in backend Prisma `User`.
- `registerUser` controller exists but is not exposed by route.
- CORS policy is open/default (no allowlist).
- Priority logic partly duplicated between controller and service layer.

## 10. Suggested model evolution

1. Extend Prisma `User` with `firstName`, `lastName`.
2. Introduce explicit `AuthService`, `ReservationService` boundaries.
3. Move conflict/priority logic fully into service layer.
4. Add API versioning (`/api/v1/...`).
5. Add observability model (structured logs + request IDs).
