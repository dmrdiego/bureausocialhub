-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Activity Logs Table
create table if not exists activity_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    action_type text not null,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Assemblies Table
create table if not exists assemblies (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    date timestamp with time zone not null,
    status text check (status in ('scheduled', 'open_for_voting', 'closed', 'completed')) default 'scheduled',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Assembly Items Table
create table if not exists assembly_items (
    id uuid default uuid_generate_v4() primary key,
    assembly_id uuid references assemblies(id) on delete cascade,
    title text not null,
    description text,
    type text check (type in ('discussion', 'voting_simple', 'election')),
    order_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Votes Table Updates (Adding columns for assembly voting)
-- Note: Check if 'votes' table exists for projects first. If not, create it.
create table if not exists votes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    project_id uuid, -- Optional: used only for project voting
    assembly_item_id uuid references assembly_items(id), -- Optional: used for assembly voting
    vote_option text check (vote_option in ('approve', 'reject', 'abstain')),
    weight integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4.1 Projects Table
create table if not exists projects (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    votes integer default 0,
    goal integer default 100,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'votes' and column_name = 'assembly_item_id') then
        alter table votes add column assembly_item_id uuid references assembly_items(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'votes' and column_name = 'vote_option') then
        alter table votes add column vote_option text check (vote_option in ('approve', 'reject', 'abstain'));
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'votes' and column_name = 'weight') then
        alter table votes add column weight integer default 1;
    end if;
end $$;

-- 5. Profiles Table Updates
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'receive_notifications') then
        alter table profiles add column receive_notifications boolean default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'member_number') then
        alter table profiles add column member_number text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'member_category') then
        alter table profiles add column member_category text;
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'quota_status') then
        alter table profiles add column quota_status text default 'inactive';
    end if;
end $$;

-- 6. RLS Policies (Basic examples - refine as needed)
alter table activity_logs enable row level security;
alter table assemblies enable row level security;
alter table assembly_items enable row level security;
alter table votes enable row level security;

-- Policy: Admin can view all logs, users can view their own (or none)
create policy "Admins can view all logs" on activity_logs for select using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- Policy: Assemblies are readable by authenticated users
create policy "Assemblies are viewable by everyone" on assemblies for select using ( true );
create policy "Admins can insert/update assemblies" on assemblies for all using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- Policy: Items readable by auth users
create policy "Items are viewable by everyone" on assembly_items for select using ( true );

-- Policy: Votes
create policy "Users can vote" on votes for insert with check ( auth.uid() = user_id );
create policy "Users can view their own votes" on votes for select using ( auth.uid() = user_id );

-- 7. Candidaturas Table Updates
create table if not exists candidaturas (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    status text default 'pending',
    form_data jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'candidaturas' and column_name = 'type') then
        alter table candidaturas add column type text default 'moradia';
    end if;
end $$;

-- 8. CMS Content Table
create table if not exists cms_content (
    id uuid default uuid_generate_v4() primary key,
    section_key text unique not null,
    content jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by uuid references auth.users(id)
);

-- 8.1 Email Templates Table
create table if not exists email_templates (
    id text primary key, -- template key e.g. 'candidature_approved'
    subject text not null,
    body_markdown text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8.2 Contact Messages Table
create table if not exists contact_messages (
    id uuid default uuid_generate_v4() primary key,
    user_id text, -- can be anonymous or uuid
    subject text not null,
    message text not null,
    status text default 'open',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Enable RLS for cms_content
alter table cms_content enable row level security;

-- Policies for CMS
create policy "Public read access" on cms_content for select using ( true );
create policy "Admin write access" on cms_content for all using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- 9. Assembly Attendances Table (Sprint 4 - Quorum)
create table if not exists assembly_attendances (
    id uuid default uuid_generate_v4() primary key,
    assembly_id uuid references assemblies(id) on delete cascade,
    user_id uuid references auth.users(id),
    checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
    checked_in_by uuid references auth.users(id), -- Admin who checked them in (for manual)
    can_vote boolean default true, -- Admin can revoke voting rights
    unique(assembly_id, user_id)
);

alter table assembly_attendances enable row level security;
create policy "Users can view their attendance" on assembly_attendances for select using ( auth.uid() = user_id );
create policy "Admins can manage attendance" on assembly_attendances for all using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- 10. Events Table
create table if not exists events (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    date timestamp with time zone not null,
    end_date timestamp with time zone,
    location text,
    category text default 'social',
    image_url text,
    max_attendees integer,
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table events enable row level security;
create policy "Events are public" on events for select using ( true );
create policy "Admins can manage events" on events for all using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);


-- 11. Profile Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'pending');
    return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to allow re-running
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
