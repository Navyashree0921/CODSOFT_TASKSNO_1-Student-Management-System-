# EduManage — Student Management System

Next.js 14 (App Router) · Node.js · PostgreSQL · Prisma · JWT auth · Zod validation

## Run it
```bash
npm install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npx prisma db push            # create tables
npm run db:seed               # demo data
npm run dev                   # http://localhost:3000
```
Demo logins (password `password123`): `admin@edu.test`, `teacher@edu.test`, `student@edu.test`

## What's built
- Role-based access (Admin / Teacher / Student) via httpOnly JWT cookie, route middleware and `requireRole()` in every API
- Students: search, create (admin), per-class listing — `/api/students`
- Attendance: bulk mark per day with upsert, student sees own history — `/api/attendance`
- Fees: create, list (students see only their own), mark paid — `/api/fees`
- Schema covers exams, marks, subjects, teachers and classes (see `prisma/schema.prisma`)
- Role-specific dashboards at `/dashboard`

## Pages
`/dashboard` overview, `/students`, `/attendance`, `/exams` (create exams, enter scores, student results), `/fees`

## Next steps
Report-card PDFs, pagination, fee receipts, audit log, tests, Docker compose.
