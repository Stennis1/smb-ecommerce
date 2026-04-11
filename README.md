# StaySmart

StaySmart is a production-minded MVP for an admin-managed multi-category
listings platform built with Next.js App Router, TypeScript, Tailwind CSS,
PostgreSQL, and Prisma.

Current scope:

- Admin-managed listings
- Category management
- S3 image keys stored in the database
- Direct-to-S3 admin image uploads
- Public homepage, category pages, and listing pages
- WhatsApp click-to-chat enquiries only

## Getting Started

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Fill in your PostgreSQL and AWS S3 values.
   `AWS_S3_PUBLIC_BASE_URL` should point to the public bucket or CDN base URL
   used to serve uploaded listing images.

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

- Finish local admin seeding verification
- Production deployment and environment validation

## Admin Auth

Seed the first admin account after configuring `DATABASE_URL` and running the
database migration:

```bash
npm run admin:seed -- --email admin@example.com --password strongpassword123
```

Then sign in at `http://localhost:3000/admin/login`.
