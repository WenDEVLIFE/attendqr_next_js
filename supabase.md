# Supabase (AttendQR)

This project uses Supabase for Postgres storage, plus a **custom `users` table** for login (it does **not** use Supabase Auth for signing in).

## Environment variables

The browser/client Supabase SDK is initialized in `src/lib/supabase/client.ts` using:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-side API routes under `src/pages/api/admin/*` use a Supabase client with a **service role key** (admin privileges) to perform privileged operations when RLS blocks browser requests.

Recommended server-only key:

- `SUPABASE_SERVICE_ROLE_KEY` (**do not expose publicly**)

Notes:

- Keys prefixed with `NEXT_PUBLIC_` are exposed to the browser by Next.js. Avoid putting the service role key in any `NEXT_PUBLIC_*` variable.
- Some API routes fall back to `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` if `SUPABASE_SERVICE_ROLE_KEY` is missing; this is convenient for local dev but **not safe** for production.

## Database setup (SQL migration)

Run `supabase_migration.sql` once in **Supabase Dashboard → SQL Editor**.

It does three key things:

- **Enables `pgcrypto`**
- **Creates a trigger** to bcrypt-hash the `users.password` column on insert/update
- **Enables RLS** on `users` and adds permissive policies needed for the custom login/registration flows

If your login fails with “User not found” while you know the user exists, it’s commonly because RLS is enabled without a SELECT policy for `anon`. The migration includes:

- `Allow public email lookup` (SELECT for `anon`)
- `Allow public registration` (INSERT for `anon`)

## How login works (custom users table)

The admin login page is `src/pages/auth/login.tsx`:

- Looks up a user row by email from `users` (selects `password` hash).
- Verifies the password with bcrypt (`src/lib/supabase/hash.ts`).
- Checks `role === 'admin'`.
- Stores “logged in” state via `useAuth` (app-level auth state), not Supabase Auth sessions.

## RLS + privileged operations

Many write operations to `users` can be blocked by RLS when executed from the browser using the anon key.

The user service (`src/services/user_service.ts`) attempts the direct browser operation first, and on common RLS errors it falls back to a Next.js API route that uses the **service role** key:

- Create: `POST /api/admin/create-user`
- Update: `POST /api/admin/update-user`
- Delete: `POST /api/admin/delete-user`

## Quick verification queries

After creating/seeding a user, you can verify password hashing:

```sql
select id, username, email, role, left(password, 7) as hash_prefix
from users;
```

Expected: `hash_prefix` starts with `$2a$`, `$2b$`, or `$2y$`.

