-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  nif text,
  phone text,
  role text default 'member' check (role in ('admin', 'member', 'pending', 'staff')),
  
  -- Membership Status & Category
  quota_status text default 'pending' check (quota_status in ('active', 'late', 'pending')),
  quota_next_due timestamp with time zone,
  member_category text default 'contribuinte' check (member_category in ('fundador', 'efetivo', 'contribuinte', 'voluntario', 'profissional', 'benemerito', 'patrocinador', 'institucional')),
  member_number serial, -- Auto-incrementing member number
  admission_date timestamp with time zone default timezone('utc'::text, now()),
  
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Admins can update everyone"
  on profiles for update
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

-- 2. CANDIDATURAS Table (Housing Program Applications)
create table public.candidaturas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text default 'submitted' check (status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected')),
  step_completed integer default 1,
  
  -- JSONB for flexible form data storage
  form_data jsonb not null default '{}'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Candidaturas
alter table public.candidaturas enable row level security;

create policy "Users can view own candidaturas."
  on candidaturas for select
  using ( auth.uid() = user_id );

-- Admins can view all candidaturas
create policy "Admins can view all candidaturas"
  on candidaturas for select
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

create policy "Users can insert own candidaturas."
  on candidaturas for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own candidaturas."
  on candidaturas for update
  using ( auth.uid() = user_id );

-- Admins can update candidaturas (status)
create policy "Admins can update candidaturas"
  on candidaturas for update
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

-- 3. GOVERNANCE SYSTEM (Assemblies & Voting)

-- 3.1 Assemblies (Reuniões)
create table public.assemblies (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text default 'Sede Virtual',
  meeting_link text,
  status text default 'scheduled' check (status in ('scheduled', 'open_for_voting', 'closed', 'completed')),
  minutes_status text default 'draft' check (minutes_status in ('draft', 'published')),
  minutes_content text, -- Markdown content of the Minutes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assemblies enable row level security;

create policy "Everyone can view assemblies"
  on assemblies for select
  using ( true );

create policy "Admins can manage assemblies"
  on assemblies for all
  using ( auth.uid() in (select id from profiles where role = 'admin') );

-- 3.2 Assembly Items (Pauta)
create table public.assembly_items (
  id uuid default uuid_generate_v4() primary key,
  assembly_id uuid references public.assemblies(id) on delete cascade not null,
  order_index integer default 0,
  title text not null,
  description text, -- Markdown
  type text default 'voting_simple' check (type in ('discussion', 'voting_simple', 'election')),
  voting_results jsonb default '{}'::jsonb, -- Snapshot of results
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assembly_items enable row level security;

create policy "Everyone can view assembly items"
  on assembly_items for select
  using ( true );

create policy "Admins can manage assembly items"
  on assembly_items for all
  using ( auth.uid() in (select id from profiles where role = 'admin') );

-- 3.3 Votes (Votos)
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  assembly_item_id uuid references public.assembly_items(id) on delete cascade not null,
  vote_option text not null check (vote_option in ('approve', 'reject', 'abstain')),
  weight integer default 1, -- Can be adjusted based on member_category
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one vote per user per item
  unique(user_id, assembly_item_id)
);

alter table public.votes enable row level security;

create policy "Users can view their votes"
  on votes for select
  using ( auth.uid() = user_id );

create policy "Users can vote"
  on votes for insert
  with check ( 
    auth.uid() = user_id 
    and exists (
      select 1 from assembly_items ai
      join assemblies a on a.id = ai.assembly_id
      where ai.id = assembly_item_id
      and a.status = 'open_for_voting'
    )
  );
  
-- Admins can view all votes (for counting/minutes)
create policy "Admins can view all votes"
  on votes for select
  using ( auth.uid() in (select id from profiles where role = 'admin') );

-- 4. EMAIL SYSTEM
create table public.email_templates (
  id text primary key, -- onboarding_welcome, candidatura_received
  subject text not null,
  body_markdown text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.email_templates enable row level security;

-- Admins can manage templates
create policy "Admins can manage templates"
  on email_templates for all
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

create table public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  template_id text references public.email_templates(id),
  status text default 'pending', -- pending, sent, failed
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.email_logs enable row level security;

-- Admins can view logs, Users can insert logs (trigger email)
create policy "Admins can view logs"
  on email_logs for select
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

create policy "Users can insert logs"
  on email_logs for insert
  with check ( auth.uid() = user_id );

-- 5. Triggers
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'pending');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. SEED DATA (Templates)
insert into public.email_templates (id, subject, body_markdown)
values 
('onboarding_welcome', 'Bem-vindo ao Bureau Social!', E'Olá {{name}},\n\nObrigado por se tornar um Associado Voluntário do Bureau Social.\n\nConfirmamos o recebimento do seu cadastro e o aceite dos termos de isenção de anuidade.\n\nVocê já pode acessar o Portal do Associado para consultar documentos e participar das atividades.\n\nCom os melhores cumprimentos,\nEquipe Bureau Social'),
('candidatura_received', 'Candidatura Recebida', E'Olá {{name}},\n\nRecebemos a sua candidatura para o Programa Moradia.\n\nIremos analisar os documentos e entraremos em contato em breve.\n\nObrigado,\nBureau Social.')
on conflict (id) do nothing;

-- 7. STORAGE (Candidatura Documents)
insert into storage.buckets (id, name, public)
values ('candidatura-docs', 'candidatura-docs', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access to Candidatura Docs"
  on storage.objects for select
  using ( bucket_id = 'candidatura-docs' );

create policy "Authenticated Users can Upload Docs"
  on storage.objects for insert
  with check ( bucket_id = 'candidatura-docs' and auth.role() = 'authenticated' );
