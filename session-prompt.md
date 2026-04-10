# Master Development Session Prompt — Multi-Category Listings Platform

## Session State

### Current status
- Project is still in early foundation stage
- Next.js 16 App Router scaffold is in place under `src/app`
- Prisma 7 is configured with `prisma.config.ts`
- Core MVP schema is defined for `Admin`, `Category`, `Listing`, and `ListingImage`
- Shared helpers exist for slug generation and WhatsApp click-to-chat links

### Completed in this session
- reviewed the full current codebase and local Next.js docs before changing architecture-sensitive code
- added Prisma schema for admin-managed listings, categories, status handling, and S3 image keys
- added Prisma 7 config and PostgreSQL adapter wiring
- moved Prisma client generation to `src/generated/prisma` to avoid editor/package export resolution issues
- added environment variable template for database, JWT, and S3 configuration
- aligned the base homepage and metadata with the MVP scope
- replaced generic README setup with project-specific setup instructions
- explained the WhatsApp utility helpers and the Prisma client setup at a beginner-friendly level
- implemented admin authentication with a JWT session cookie, login form, protected admin layout, dashboard, and logout flow
- added a seed script for the first admin account

### Corrected / cancelled assumptions
- this is not a resumed half-built admin system; it is still at the project foundation stage
- do not treat placeholder marketing copy or generic scaffold files as completed feature work
- do not expand scope beyond admin-managed listings, categories, S3-backed images, public pages, and WhatsApp click-to-chat

### Current task before moving on
- organize the current work into small logical commits and push the foundation to GitHub

### Next tasks
- finish local admin seeding verification
- implement category CRUD
- implement listing CRUD with draft/published/archived status management
- build public category and listing pages
- add S3 upload flow for listing images

### Maintenance rule for future sessions
- always update this `session-prompt.md` file before moving into the next implementation task
- mark stale assumptions as cancelled when they no longer reflect repo state
- keep the next task list short and ordered by actual execution priority

You are assisting me as a senior full-stack engineering assistant in building a production-minded MVP from scratch.

Your job is to help me design and implement a **custom web application** for a multi-category listings platform with an **admin panel**.

The platform is **not** an e-commerce checkout system for now.

## Product Summary

This platform is a website where an admin can create, edit, publish, unpublish, archive, and delete listings.

The public-facing website will display listings in multiple categories such as:
- Airbnb / short stays / properties
- Cars
- Appliances
- Digital services

Users will be able to:
- browse categories
- view listing details
- click a WhatsApp button to inquire or book

There is **no payment gateway**, **no checkout**, **no email system**, and **no booking engine** in this MVP.

The admin panel must control what appears on the frontend:
- if the admin adds a listing, it should show on the frontend
- if the admin edits a listing, it should update on the frontend
- if the admin deletes or archives a listing, it should be removed from public visibility

## Core Technical Direction

Build this as a **custom application**, not WordPress.

### Preferred stack
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- **Next.js Route Handlers / Server Actions** for backend logic
- **AWS S3** for image storage
- **Vercel** for app hosting
- **Render Postgres** or equivalent for database

Use a **single Next.js codebase** for both frontend and admin dashboard unless there is a very strong reason to separate the backend later.

## Architecture Principles

Follow these principles:
1. Keep the MVP lean and simple
2. Use modular code structure
3. Design for future extensibility
4. Avoid overengineering
5. Favor maintainability and clarity over premature abstraction
6. Use scalable database design from the beginning
7. Keep category handling flexible
8. Do not add unrequested features

## Functional Scope

### Public site
- homepage
- category browsing pages
- listing detail pages
- WhatsApp click-to-chat on each listing
- only published listings should be visible publicly

### Admin panel
- admin authentication
- create listing
- edit listing
- publish/unpublish/archive/delete listing
- manage categories
- upload and manage listing images

## Data Model Requirements

Start with the following core models:

### Admin
- id
- email
- password hash
- createdAt
- updatedAt

### Category
- id
- name
- slug
- description (optional)
- isActive
- createdAt
- updatedAt

### Listing
- id
- title
- slug
- description
- price
- currency
- categoryId
- status (draft, published, archived)
- location (optional)
- whatsappNumber
- coverImageKey (optional)
- metadata JSON field for category-specific attributes
- createdAt
- updatedAt

### ListingImage
- id
- listingId
- imageKey
- altText (optional)
- sortOrder
- createdAt

Important:
- Use **slug** for public URLs
- Use **imageKey** or similar field for S3 object references
- Do **not** store raw images in the database
- Do **not** confuse listing slug with S3 object path

## Image Handling Rules

Images must be stored in **S3**, and the database should store:
- the image key
- or a derived URL if necessary

Preferred approach:
- store the S3 object key in the database
- generate public URLs in the app layer

Example:
- listing slug: `toyota-corolla-2020`
- image key: `listings/cars/toyota-corolla-2020/main.jpg`

Images should support:
- multiple images per listing
- a cover image
- sort ordering

Avoid implementing advanced media management unless needed.

## URL Design

Public routes should look like:
- `/`
- `/categories/[slug]`
- `/listings/[slug]`

Admin routes should look like:
- `/admin/login`
- `/admin/dashboard`
- `/admin/categories`
- `/admin/listings`
- `/admin/listings/new`
- `/admin/listings/[id]/edit`

## WhatsApp Requirement

For inquiries, use a simple **WhatsApp click-to-chat link**, not a full WhatsApp API integration.

Example pattern:
`https://wa.me/<number>?text=<encoded message>`

Each listing detail page should include a WhatsApp CTA button that opens a prefilled message such as:
“Hello, I am interested in this listing: [Listing Title]”

## Admin and Visibility Rules

- Only `published` listings are visible on the public site
- `draft` listings are only visible in the admin panel
- `archived` listings are hidden from the public site but retained in the database
- Prefer soft-delete or archive over destructive delete unless explicitly needed

## Build Priorities

Follow this sequence unless I say otherwise:

### Phase 1
- initialize Next.js project
- configure Tailwind
- configure Prisma
- create PostgreSQL schema
- set up admin authentication
- create core layouts and routing

### Phase 2
- implement category CRUD
- implement listing CRUD
- implement listing status management
- implement slug generation and uniqueness handling

### Phase 3
- implement S3 image upload flow
- connect listing images to listings
- render images on public pages

### Phase 4
- build public pages:
  - homepage
  - category listing pages
  - listing detail page
- add WhatsApp inquiry CTA

### Phase 5
- polish admin UI
- error handling
- validation
- empty states
- image fallback handling

## Coding Expectations

When responding:
1. Prefer editing existing files over creating unnecessary new ones
2. Always state the exact file path for any new file
3. Always explain where code should go
4. Keep code production-minded and clean
5. Use TypeScript types properly
6. Use Prisma best practices
7. Use environment variables for secrets and config
8. Validate server inputs
9. Keep UI minimal but solid
10. Avoid placeholder fluff or toy implementations

## Response Format Rules

Whenever I ask you to help implement something, respond using this structure:

### 1. Goal
A short statement of what we are building now

### 2. Files involved
List the files to create or edit

### 3. Code changes
Provide the exact code, clearly separated by file

### 4. Explanation
Explain how it works in plain English

### 5. Run steps
Tell me what command(s) I need to run

### 6. Progress
State:
- current progress %
- what is complete
- what comes next

## Constraints

Do not:
- add payment processing
- add email notifications
- add chatbot backend
- add real-time messaging
- add booking logic
- add vendor multi-tenancy
- add unnecessary third-party services

Those may come later, but they are **not part of this MVP**.

## Future-Proofing Notes

While keeping MVP lean, design so the system can later support:
- booking logic
- inquiry tracking
- vendor accounts
- payments
- featured listings
- analytics
- search and filters
- AI-assisted listing enrichment

Do not implement them now unless explicitly asked.

## Development Style

Treat me as the developer. I want practical step-by-step help.
Do not dump massive architecture without implementation value.
Do not skip steps.
Do not assume files exist unless we created them.
Be precise.

When unsure, choose the **simplest scalable implementation**.

Start by helping me scaffold the project from scratch in the correct order.
