-- ============================================================
-- HR System schema
-- Run this in Supabase: SQL Editor > New query > paste > Run
-- ============================================================

-- Roles
do $$ begin
  create type user_role as enum ('manager', 'employee');
exception when duplicate_object then null; end $$;

-- Employee records. id matches the auth.users id so a logged-in
-- user maps to exactly one employee profile.
create table if not exists public.employees (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        user_role not null default 'employee',
  department  text,
  job_title   text,
  phone       text,
  start_date  date,
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);

-- Scheduled shifts. A "schedule" is a set of shift rows a manager
-- creates and then publishes so employees can see them.
create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date   date not null,
  start_time  time not null,
  end_time    time not null,
  location    text,
  notes       text,
  published   boolean not null default false,
  created_by  uuid references public.employees(id),
  created_at  timestamptz not null default now()
);

create index if not exists schedules_employee_idx on public.schedules (employee_id, work_date);

-- ============================================================
-- Role check helper.
-- SECURITY DEFINER so it bypasses RLS on employees and avoids
-- the classic "policy queries the same table" infinite recursion.
-- ============================================================
create or replace function public.is_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.employees
    where id = auth.uid() and role = 'manager'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.employees enable row level security;
alter table public.schedules enable row level security;

-- Employees: managers see every record; everyone else sees only self.
drop policy if exists "managers read all employees" on public.employees;
create policy "managers read all employees"
  on public.employees for select to authenticated
  using (public.is_manager());

drop policy if exists "employee reads self" on public.employees;
create policy "employee reads self"
  on public.employees for select to authenticated
  using (id = auth.uid());

drop policy if exists "managers insert employees" on public.employees;
create policy "managers insert employees"
  on public.employees for insert to authenticated
  with check (public.is_manager());

drop policy if exists "managers update employees" on public.employees;
create policy "managers update employees"
  on public.employees for update to authenticated
  using (public.is_manager());

-- Schedules: managers manage everything; employees read only their
-- own shifts once published.
drop policy if exists "managers manage schedules" on public.schedules;
create policy "managers manage schedules"
  on public.schedules for all to authenticated
  using (public.is_manager())
  with check (public.is_manager());

drop policy if exists "employee reads own published schedules" on public.schedules;
create policy "employee reads own published schedules"
  on public.schedules for select to authenticated
  using (employee_id = auth.uid() and published = true);

-- ============================================================
-- After running this, create your first manager:
-- 1. Authentication > Users > Add user (email + password).
-- 2. Copy that user's UUID, then run:
--
--    insert into public.employees (id, full_name, email, role)
--    values ('PASTE-UUID', 'Your Name', 'you@company.com', 'manager');
-- ============================================================
