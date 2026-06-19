-- Migrations for SmartExpense AI Agentic Copilot

-- 1. Create Goals Table
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric default 0 check (current_amount >= 0),
  target_date date not null,
  status text check (status in ('active', 'completed', 'failed')) default 'active',
  created_at timestamp default now()
);

-- Enable RLS for goals
alter table goals enable row level security;

create policy "Users can perform CRUD actions on their own goals"
  on goals for all using (auth.uid() = user_id);


-- 2. Create Agent Logs Table
create table if not exists agent_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_name text not null,
  action text not null,
  result jsonb,
  created_at timestamp default now()
);

-- Enable RLS for agent logs
alter table agent_logs enable row level security;

create policy "Users can perform CRUD actions on their own agent logs"
  on agent_logs for all using (auth.uid() = user_id);


-- 3. Create AI Memory Table
create table if not exists ai_memory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  memory text not null,
  importance_score numeric default 1,
  created_at timestamp default now()
);

-- Enable RLS for AI memory
alter table ai_memory enable row level security;

create policy "Users can perform CRUD actions on their own AI memory"
  on ai_memory for all using (auth.uid() = user_id);
