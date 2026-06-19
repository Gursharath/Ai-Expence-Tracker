create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  category text not null,
  description text,
  date date not null,
  type text check (type in ('income', 'expense')),
  is_recurring boolean default false,
  created_at timestamp default now()
);

create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  category text,
  monthly_limit numeric,
  created_at timestamp default now()
);

create table ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  insight text,
  created_at timestamp default now()
);