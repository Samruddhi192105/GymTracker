create extension if not exists "uuid-ossp";

-- exercises
create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  muscle_group text not null,
  equipment text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--workouts
create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  workout_date date not null default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

--workout sets
create table if not exists public.workout_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  set_number integer not null default 1,
  weight numeric(10,2) not null default 0,
  reps integer not null default 0,
  created_at timestamptz default now()
);

-- indexes 
create index if not exists idx_exercises_user_id on public.exercises(user_id);
create index if not exists idx_workouts_user_id on public.workouts(user_id);
create index if not exists idx_workouts_date on public.workouts(workout_date);
create index if not exists idx_workout_sets_workout on public.workout_sets(workout_id);
create index if not exists idx_workout_sets_exercise on public.workout_sets(exercise_id);

--rls
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;

-- Exercises policies
create policy "Users can view own exercises"
  on public.exercises for select
  using (auth.uid() = user_id);

create policy "Users can insert own exercises"
  on public.exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exercises"
  on public.exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete own exercises"
  on public.exercises for delete
  using (auth.uid() = user_id);

-- Workouts policies
create policy "Users can view own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Workout Sets policies
create policy "Users can view own workout sets"
  on public.workout_sets for select
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can insert own workout sets"
  on public.workout_sets for insert
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can update own workout sets"
  on public.workout_sets for update
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can delete own workout sets"
  on public.workout_sets for delete
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- Function to calculate total volume for a user
create or replace function public.get_total_volume(p_user_id uuid)
returns numeric
language sql
security definer
as $$
  select coalesce(sum(ws.weight * ws.reps), 0)
  from public.workout_sets ws
  join public.workouts w on w.id = ws.workout_id
  where w.user_id = p_user_id;
$$;

-- Function to get workout dates for streak calculation
create or replace function public.get_workout_dates(p_user_id uuid)
returns table (workout_date date)
language sql
security definer
as $$
  select distinct workout_date
  from public.workouts
  where user_id = p_user_id
  order by workout_date desc;
$$;
