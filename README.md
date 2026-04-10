# StaySmart

StaySmart is a production-minded MVP for an admin-managed multi-category
listings platform built with Next.js App Router, TypeScript, Tailwind CSS,
PostgreSQL, and Prisma.

Current scope:

- Admin-managed listings
- Category management
- S3 image keys stored in the database
- Public homepage, category pages, and listing pages
- WhatsApp click-to-chat enquiries only

## Getting Started

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Fill in your PostgreSQL and AWS S3 values.

3. Generate Prisma Client:

```bash
npm run db:generate
```

4. Apply your first migration after the database is configured:

```bash
npm run db:migrate -- --name init
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:generate`
- `npm run db:migrate -- --name <migration-name>`
- `npm run db:push`
- `npm run db:studio`

## Status

The current foundation includes:

- Next.js 16 App Router project structure
- Prisma schema for admins, categories, listings, and listing images
- Shared Prisma client wiring
- Slug generation and WhatsApp link helpers
- Admin authentication with a JWT session cookie and protected admin routes

Next implementation steps:

- Category CRUD
- Listing CRUD and status management
- Public category and listing routes

## Admin Auth

Seed the first admin account after configuring `DATABASE_URL` and running the
database migration:

```bash
npm run admin:seed -- --email admin@example.com --password strongpassword123
```

Then sign in at `http://localhost:3000/admin/login`.
