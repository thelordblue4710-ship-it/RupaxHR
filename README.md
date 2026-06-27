# HR System

A single-company HR app built with **Next.js (App Router)**, **Supabase** (Postgres + Auth + RLS), deployed on **Vercel**.

Two core flows:

- **Employee records** — managers add employees and view their full records.
- **Scheduling** — managers create shifts and *send* (publish) them to employees, who see only their own published shifts.

Access is role-based: `manager` vs `employee`, enforced both in the UI and at the database level with Row Level Security.

---

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
3. Create your first manager login: **Authentication → Users → Add user** (set an email + password, tick auto-confirm).
4. Copy that user's UUID and run in the SQL editor:

   ```sql
   insert into public.employees (id, full_name, email, role)
   values ('PASTE-UUID', 'Your Name', 'you@company.com', 'manager');
   ```

5. Grab your keys from **Project Settings → API**: the project URL, the `anon` key, and the `service_role` key.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

> The `service_role` key bypasses RLS and is used server-side only (to create employee logins). Never expose it to the browser — keep it out of any `NEXT_PUBLIC_` variable.

## 3. Run locally (Codespaces or local)

```bash
npm install
npm run dev
```

Open the forwarded port (Codespaces shows a popup) and sign in with your manager account.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com](https://vercel.com).
3. Add the same three environment variables in **Project → Settings → Environment Variables**.
4. Deploy. Every `git push` redeploys automatically.

---

## How it works

| Area | Notes |
|------|-------|
| Auth | Supabase email/password. `middleware.ts` refreshes the session and redirects unauthenticated users to `/login`. |
| Roles | `is_manager()` is a `SECURITY DEFINER` SQL function so role-check policies don't recurse on the `employees` table. |
| Records | `employees` table. Managers can read/insert/update all; employees can read only their own row. |
| Scheduling | `schedules` table. Managers manage all shifts; employees read only their own `published` shifts. |
| Adding employees | A server action uses the admin (service_role) client to create the auth user, then inserts the matching profile row, rolling back the auth user if the insert fails. |

## Suggested next steps

- Leave / absence requests (request → manager approval → balance).
- Document storage with Supabase Storage (contracts, payslips).
- A weekly calendar/grid view of the schedule instead of a list.
- Email notifications when a shift is sent (Supabase + Resend).
