-- ====================================================================
-- ORBIT // Production Supabase PostgreSQL Schema & Security Policies
-- ====================================================================

-- 1. Projects Table
create table if not exists public.projects (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  color_theme text not null default 'violet',
  status text not null default 'active',
  position jsonb not null default '[0, 0, 0]'::jsonb,
  notes text default '',
  target_date bigint,
  github jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Tasks Table
create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id text references public.projects(id) on delete cascade not null,
  title text not null,
  description text default '',
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date bigint,
  orbit_index int default 0,
  depends_on_task_id text,
  milestone_id text,
  github_issue_number int,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Milestones Table
create table if not exists public.milestones (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id text references public.projects(id) on delete cascade not null,
  title text not null,
  due_date bigint,
  completed boolean default false not null,
  created_at timestamptz default now() not null
);

-- 4. Dependency Links Table
create table if not exists public.links (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  source_project_id text references public.projects(id) on delete cascade not null,
  target_project_id text references public.projects(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.milestones enable row level security;
alter table public.links enable row level security;

-- Projects RLS Policies
create policy "Users can manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks RLS Policies
create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Milestones RLS Policies
create policy "Users can manage their own milestones"
  on public.milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Links RLS Policies
create policy "Users can manage their own links"
  on public.links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
