create table tasks (
  id uuid primary key,
  title text not null,
  description text default '',
  priority text not null,
  category text not null,
  status text not null,
  due_date text default '',
  created_at timestamptz default now()
);

create table today_plans (
  date text primary key,
  main_goal text default '',
  must_do jsonb default '["","",""]',
  distractions text default '',
  energy_level integer default 3,
  work_blocks jsonb default '[]'
);

create table content_ideas (
  id uuid primary key,
  title text not null,
  platform text not null,
  status text not null,
  hook text default '',
  main_idea text default '',
  cta text default '',
  created_at timestamptz default now()
);

create table writing_items (
  id uuid primary key,
  title text not null,
  type text not null,
  priority text not null,
  status text not null,
  notes text default '',
  created_at timestamptz default now()
);

create table end_of_day_reviews (
  date text primary key,
  went_well text default '',
  completed text default '',
  postponed text default '',
  tomorrow_focus text default '',
  productivity_score integer default 5
);

create table settings (
  id integer primary key default 1,
  user_name text default '',
  day_start_time text default '09:00',
  day_end_time text default '18:00',
  default_block_duration integer default 90,
  constraint single_row check (id = 1)
);

create table daily_notes (
  date text primary key,
  content text default ''
);

create table main_focus (
  date text primary key,
  content text default ''
);

insert into settings (id) values (1) on conflict do nothing;


create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
