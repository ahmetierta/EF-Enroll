# EF Enroll

EF Enroll is a course enrollment platform with three roles: admin, professor, and student. Students browse a public catalog, choose course duration, enroll, pay, and track their courses. Professors manage their own courses and materials. Admins manage approvals, payments, refunds, and academic data.

## Main Features

- Role-based login for admin, professor, and student
- Public home page and course catalog with course details
- Student course enrollment with duration options and first-time offer
- Payments with invoice number, transaction id, method, and refund support
- Waiting list management for full courses
- Course materials organized by type, module, week, and requirement
- JWT access tokens plus HTTP-only session/refresh cookies
- Refresh token rotation with logout revocation
- Live token validation against the current database user status
- Session management with logout-all and revoke-other-sessions support
- SQL-first database setup through `backend/database.sql`
- No migration files required
- Admin analytics with revenue, unpaid enrollments, top courses, and near-capacity courses
- Demo seed script for enrollments, payments, waiting list, extra courses, and course materials

## Project Structure

```text
backend/   Express, TypeORM, MySQL, auth, payments, SQL database setup
frontend/  React, Vite, role dashboards, catalog, enrollment UI
```

## Requirements

- Node.js 20 or newer
- MySQL running locally
- npm

## Database Setup

Create and seed the database by running the SQL file:

```text
backend/database.sql
```

This file creates the database, tables, admin user, demo students, demo professors, courses, and schedules.

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Demo Accounts

```text
Admin
admin@gmail.com
admin123

Student
arta.student@ef-enroll.test
123456

Professor
ilir.professor@ef-enroll.test
123456
```

## Useful Commands

Backend:

```bash
npm run dev
npm run start
npm run check
npm run seed:admin
npm run seed:test
npm run tokens:cleanup
```

Frontend:

```bash
npm run dev
npm run lint
npm run build
```

## Presentation Notes

The project uses access tokens for protected requests and HTTP-only session/refresh cookies for session continuity. The backend sets a short-lived `token` cookie and a longer-lived `sessionId` cookie; the signed refresh token is hashed in the database, rotated on refresh, and revoked on logout. This gives the project a more realistic authentication flow than storing one long-lived token in the browser.

Protected routes also re-check the user in the database. If a user becomes pending, rejected, or deleted after login, old access tokens stop working.

Database changes are managed with the normal SQL file `backend/database.sql`, so the project can be restored without migration scripts.

## Demo Data For Testing

After importing `backend/database.sql`, run:

```bash
cd backend
npm run seed:test
```

This adds extra courses, course materials, paid enrollments, unpaid enrollments, and waiting-list entries so the system can be tested with real data.

To clean expired or old revoked refresh tokens:

```bash
cd backend
npm run tokens:cleanup
```

## API Documentation

See:

```text
API_DOCUMENTATION.md
```
