# EF Enroll API Documentation

Base URL:

```text
http://localhost:5000
```

The API uses HTTP-only cookies for the access token and refresh token. After login, the browser sends cookies automatically.

## Health

### GET `/health`

Checks if backend and database are working.

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "uptime_seconds": 120,
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

## Authentication

### POST `/auth/login`

Request:

```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

Response:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gmail.com",
    "role": "admin",
    "status": "approved"
  }
}
```

### POST `/auth/register/student`

Creates an approved student account.

### POST `/auth/register/professor`

Creates a pending professor account that must be approved by admin.

### POST `/auth/refresh`

Refreshes the access token using a refresh token cookie.

### POST `/auth/logout`

Revokes the refresh token and clears cookies.

## Admin

### GET `/admin/dashboard-summary`

Returns professional dashboard statistics.

Response includes:

```json
{
  "totals": {
    "students": 5,
    "professors": 5,
    "pending_professors": 0,
    "courses": 10,
    "scheduled_courses": 10,
    "active_enrollments": 7,
    "unpaid_enrollments": 2,
    "waiting_list": 3,
    "paid_payments": 3,
    "refunded_payments": 0,
    "total_revenue": 600,
    "refunded_amount": 0
  },
  "courses_near_capacity": [],
  "top_courses": [],
  "recent_payments": []
}
```

### GET `/admin/pending-professors`

Returns professors waiting for approval.

### PUT `/admin/users/:id/approve`

Approves a professor account.

### PUT `/admin/users/:id/reject`

Rejects a professor account.

## Courses

### GET `/courses`

Public users see all courses. Professors see only their own courses.

### GET `/courses/:id`

Returns one course with professor, semester, schedule, seats, and waiting list count.

### POST `/courses`

Admin creates a course.

### PUT `/courses/:id`

Admin updates a course.

### DELETE `/courses/:id`

Admin deletes a course and related enrollments/payments/materials/waiting-list rows.

## Enrollments

### GET `/enrollments`

Admin sees all enrollments. Professor sees enrollments for their own courses.

### GET `/enrollments/mine`

Student sees their own enrollments.

### POST `/enrollments`

Student enrolls in a course.

Request:

```json
{
  "course_id": 1,
  "duration_months": 3
}
```

Rules:

- Duration must be 1, 3, 6, or 12 months.
- Student cannot enroll twice in the same course.
- If course is full, student is added to waiting list.
- First enrollment can receive a discount.

## Payments

### GET `/payments`

Admin sees all payments.

### GET `/payments/mine`

Student sees their own payments.

### POST `/payments`

Student pays for an active enrollment.

Request:

```json
{
  "enrollment_id": 1,
  "payment_method": "card"
}
```

Supported methods:

```text
simulated, card, bank_transfer, cash
```

### PUT `/payments/:id/refund`

Admin refunds a payment.

## Waiting List

### GET `/waiting-list`

Admin sees all entries. Professor sees entries for their own courses. Student sees their own entries.

### POST `/waiting-list`

Student joins waiting list for a full course.

### POST `/waiting-list/:id/promote`

Admin or professor promotes first waiting-list student when a seat is available.

### DELETE `/waiting-list/:id`

Removes a waiting list entry and reorders positions.

## Materials

### GET `/materials`

Admin/professor/student can see materials according to permissions.

### POST `/materials`

Professor adds material for their own course.

### PUT `/materials/:id`

Professor/admin updates material.

### DELETE `/materials/:id`

Professor/admin deletes material.

Supported material types:

```text
video, reading, slides, assignment, quiz, resource, link
```

## Demo Seed

Run:

```bash
cd backend
npm run seed:test
```

This creates:

- more demo courses
- materials for courses
- paid enrollments
- unpaid enrollments
- waiting list entries
- a small-capacity testing course
