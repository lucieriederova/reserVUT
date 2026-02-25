# Database Architecture (Current State)

Last updated: 2026-02-25

## 1. Is the database architecture "done"?


What is already solid:

- Core entities for reservations exist (`User`, `Reservation`).
- Roles are modeled as enum (`Role`).
- Foreign keys and uniqueness constraints are present (`userId`, unique `email`, unique `vutId`).
- Conflict handling in app logic works with current schema.

What is still incomplete:

- `firstName` / `lastName` are not in Prisma `User` table (currently stored in Supabase auth metadata on frontend sign-up flow).
- `AuditLog` model exists but is not fully integrated into main reservation cancellation flow.
- Missing performance indexes for typical reservation queries.

## 2. ER model (logical)

```text
User (1) ---- (N) Reservation
User (1) ---- (N) AuditLog  [as performedBy/admin]
```

## 3. Prisma schema map

Source: `BACKEND/prisma/schema.prisma`

### Enum: `Role`

- `STUDENT`
- `CEO`
- `GUIDE`
- `HEAD_ADMIN`

### Table: `User`

- `id` `String` PK (UUID)
- `vutId` `String` UNIQUE
- `email` `String` UNIQUE
- `role` `Role` default `STUDENT`
- `isVerified` `Boolean` default `false`
- `createdAt` `DateTime` default `now()`

Relations:

- `reservations` -> `Reservation[]`
- `canceledLogs` -> `AuditLog[]` (`AdminCanceled`)

### Table: `Reservation`

- `id` `String` PK (UUID)
- `roomName` `String`
- `startTime` `DateTime`
- `endTime` `DateTime`
- `priorityLevel` `Int`
- `type` `String`
- `userId` `String` FK -> `User.id`
- `createdAt` `DateTime` default `now()`

### Table: `AuditLog`

- `id` `String` PK (UUID)
- `action` `String`
- `canceledBookingId` `String`
- `reason` `String`
- `adminId` `String` FK -> `User.id` (`AdminCanceled`)
- `timestamp` `DateTime` default `now()`

## 4. Physical constraints currently enforced

- Unique:
  - `User.email`
  - `User.vutId`
- Referential integrity:
  - `Reservation.userId` -> `User.id`
  - `AuditLog.adminId` -> `User.id`
- Defaults:
  - `User.role = STUDENT`
  - `User.isVerified = false`
  - `createdAt`/`timestamp` fields use `now()`

## 5. Query patterns vs indexing

Common reads in code:

- Reservations by room + overlapping time window.
- Reservations ordered by `startTime`.
- User lookup by `email`.

Current index situation:

- `User.email` and `User.vutId` indexed via unique constraints.
- No explicit composite index on reservation conflict pattern.

Recommended indexes:

1. `Reservation(roomName, startTime, endTime)`
2. `Reservation(startTime)`
3. optionally `Reservation(userId, startTime)`

## 6. Data ownership and split with Supabase Auth

Current split:

- Supabase Auth owns: credentials, password reset, auth user metadata.
- App DB (`User`) owns: role/verification and reservation-level domain model.

Impact:

- Name/surname are currently in Supabase metadata, not in `User`.
- Backend logic cannot reliably query/filter by name without syncing metadata into DB.

## 7. Recommended next migration (if you want full DB architecture)

Add to `User`:

- `firstName String?`
- `lastName String?`

Then update backend auth sync:

- include `firstName`/`lastName` on user create/update.

Optional hardening:

- Add check/validation for reservation bounds at DB layer or via Prisma middleware.
- Add explicit CORS origin allowlist in server config.

## 8. Versioning note

If this document changes, also update:

- `BACKEND/API_SERVER_LOGIC.md`
- any deployment runbook for migrations (`prisma migrate`)
