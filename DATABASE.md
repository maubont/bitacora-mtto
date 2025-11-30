# Database Schema - Digital Maintenance Log

## Tables

### `users` (extends Supabase auth.users)
Extended user profiles with role information.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text check (role in ('technician', 'supervisor', 'programmer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

### `activities`
Main log entries for maintenance activities.

```sql
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  category text not null check (category in ('Eléctrico', 'Mecánico', 'Instrumentación', 'Preventivo', 'Correctivo', 'Inspección')),
  status text default 'completed' check (status in ('pending', 'completed')),
  equipment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- Policies
create policy "Technicians can insert their own activities"
  on activities for insert
  with check (auth.uid() = user_id);

create policy "Users can view all activities"
  on activities for select
  using (true);

create policy "Users can update their own activities"
  on activities for update
  using (auth.uid() = user_id);
```

### `pending_tasks`
Tasks to be completed.

```sql
create table public.pending_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.pending_tasks enable row level security;

-- Policies
create policy "All authenticated users can view tasks"
  on pending_tasks for select
  using (auth.role() = 'authenticated');

create policy "Supervisors can insert tasks"
  on pending_tasks for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('supervisor', 'programmer')
    )
  );

create policy "Supervisors and assignees can update tasks"
  on pending_tasks for update
  using (
    auth.uid() = assigned_to or
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('supervisor', 'programmer')
    )
  );
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Run the SQL commands above in the Supabase SQL editor
3. Copy your project URL and anon key to `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Create test users via Supabase Auth panel
5. Insert profile records for each user with appropriate roles
