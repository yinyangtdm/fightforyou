@AGENTS.md

# Legal Directory — Codebase Guide

## What this is
A Next.js admin tool for managing a civil-rights lawyer directory. There is no public-facing frontend yet — everything lives under `/admin`. The root `/` redirects to `/admin`.

## Stack
- **Next.js** (see AGENTS.md — this version has breaking changes)
- **Prisma 7** with `@prisma/adapter-pg` (PostgreSQL via Railway)
- **NextAuth v5 beta** — single-user password auth (`ADMIN_PASSWORD` env var)
- **Cloudinary** — photo storage with 400×400 face-crop transform
- **Tailwind CSS v4**

## Database
Always instantiate Prisma like this — the adapter is required, not optional:
```ts
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})
```
The only model is `Listing` (see `prisma/schema.prisma`). The generated client lives in `app/generated/prisma/`.

## Auth
All `/admin` routes call `auth()` from `./auth` and redirect to `/admin/login` if no session. API routes return 401. The auth config is in `auth.ts` (root).

## Key conventions

**Slugs** — `generateSlug()` is defined (duplicated) in both form files and `BulkPhotoUpload.tsx`. It strips titles (Mr/Dr), suffixes (Jr/III), entity types (LLC/PLLC), punctuation, and lowercases with hyphens. Slugs are unique per listing and used as Cloudinary `public_id`.

**State field** — always stored as 2-letter abbreviation (CA, TX, etc.). Run `node scripts/abbreviate-states.js` to normalise any full state names in the DB.

**Photos** — uploaded via `POST /api/upload` with 400×400 face-crop. Bulk upload passes `publicId` (the listing's slug) so re-uploading overwrites the existing Cloudinary asset (`overwrite: true, invalidate: true`). Single-upload from the edit form does not set a `publicId`.

**Zip autofill** — `lookupByZip()` calls `api.zippopotam.us` to fill city+state from a zip code. Used on zip field blur and after address parse.

**Address parser** — `parseAddress()` in both form files. Tries `street, city, ST zip` then `street, city ST zip` then zip-only fallback.

## Next.js specifics (this version)
- `params` and `searchParams` props are **Promises** — always `await` them:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  ```
- Server components fetch data directly; client components are separate files with `"use client"`.

## Build rules — must follow every time

**Internal navigation** — never use `<a href="...">` for internal routes. Always use `<Link href="...">` from `next/link`. The linter treats this as a hard error and breaks the build.

**Images** — never use `<img>` for public-facing pages. Use `<Image>` from `next/image` with explicit `width` and `height`. For images with unknown dimensions at render time (e.g. markdown body images, admin upload previews), add `{/* eslint-disable-next-line @next/next/no-img-element */}` on the line directly before the `<img>` tag — not inside a JSX expression/return wrapper.

**Static pages that query the DB** — any page route that is not a dynamic segment (e.g. `/guides`, `/guides/filing-deadlines-by-state`) must export `export const dynamic = "force-dynamic"` instead of `revalidate`. The Railway build environment cannot reach the database, so static prerendering fails. Dynamic segments (`[slug]`, `[id]`) are safe without this because Next.js does not prerender them without `generateStaticParams`.

## File map
```
auth.ts                              NextAuth config
app/
  page.tsx                           redirects / → /admin
  admin/
    page.tsx                         dashboard
    login/page.tsx                   login form
    listings/
      page.tsx                       listings table (server) — sortable by name/type via ?sort=&dir=
      BulkPhotoUpload.tsx            drag-drop bulk photo upload (client)
      DeleteButton.tsx               delete with router.refresh (client)
      new/page.tsx                   add listing form (client)
      [id]/edit/
        page.tsx                     edit page (server, fetches listing)
        EditForm.tsx                 edit form (client)
  api/
    listings/route.ts                GET (list), POST (create)
    listings/[id]/route.ts           PATCH (update), DELETE
    upload/route.ts                  Cloudinary upload — accepts optional publicId
    auth/[...nextauth]/route.ts      NextAuth handler
prisma/schema.prisma
scripts/
  import-profiles.js                bulk import from CSV/data
  abbreviate-states.js              normalise state field to 2-letter codes
  dry-run.js
  query-specialties.mjs
```

## Scripts
Scripts use CommonJS + dotenv + the same Prisma adapter pattern:
```js
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
```
Run with `node scripts/<name>.js`.

## Environment variables
`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
