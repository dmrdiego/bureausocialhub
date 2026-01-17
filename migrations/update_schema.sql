-- 1. Governance System Tables
CREATE TABLE IF NOT EXISTS public.assemblies (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text default 'Sede Virtual',
  meeting_link text,
  status text default 'scheduled' check (status in ('scheduled', 'open_for_voting', 'closed', 'completed')),
  minutes_status text default 'draft' check (minutes_status in ('draft', 'published')),
  minutes_content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view assemblies" ON assemblies FOR SELECT USING ( true );
CREATE POLICY "Admins can manage assemblies" ON assemblies FOR ALL USING ( auth.uid() in (select id from profiles where role = 'admin') );

CREATE TABLE IF NOT EXISTS public.assembly_items (
  id uuid default uuid_generate_v4() primary key,
  assembly_id uuid references public.assemblies(id) on delete cascade not null,
  order_index integer default 0,
  title text not null,
  description text,
  type text default 'voting_simple' check (type in ('discussion', 'voting_simple', 'election')),
  voting_results jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.assembly_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view assembly items" ON assembly_items FOR SELECT USING ( true );
CREATE POLICY "Admins can manage assembly items" ON assembly_items FOR ALL USING ( auth.uid() in (select id from profiles where role = 'admin') );

CREATE TABLE IF NOT EXISTS public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  assembly_item_id uuid references public.assembly_items(id) on delete cascade not null,
  vote_option text not null check (vote_option in ('approve', 'reject', 'abstain')),
  weight integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, assembly_item_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their votes" ON votes FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can vote" ON votes FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Admins can view all votes" ON votes FOR SELECT USING ( auth.uid() in (select id from profiles where role = 'admin') );

-- 2. Email System Tables
CREATE TABLE IF NOT EXISTS public.email_templates (
  id text primary key,
  subject text not null,
  body_markdown text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage templates" ON email_templates FOR ALL USING ( auth.uid() in (select id from profiles where role = 'admin') );

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  template_id text references public.email_templates(id),
  status text default 'pending',
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs" ON email_logs FOR SELECT USING ( auth.uid() in (select id from profiles where role = 'admin') );
CREATE POLICY "Users can insert logs" ON email_logs FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- 3. Seed Data
INSERT INTO public.email_templates (id, subject, body_markdown)
VALUES 
('onboarding_welcome', 'Bem-vindo ao Bureau Social!', E'Olá {{name}},\n\nObrigado por se tornar um Associado Voluntário do Bureau Social.\n\nConfirmamos o recebimento do seu cadastro e o aceite dos termos de isenção de anuidade.\n\nVocê já pode acessar o Portal do Associado para consultar documentos e participar das atividades.\n\nCom os melhores cumprimentos,\nEquipe Bureau Social'),
('candidatura_received', 'Candidatura Recebida', E'Olá {{name}},\n\nRecebemos a sua candidatura para o Programa Moradia.\n\nIremos analisar os documentos e entraremos em contato em breve.\n\nObrigado,\nBureau Social.')
ON CONFLICT (id) DO NOTHING;
