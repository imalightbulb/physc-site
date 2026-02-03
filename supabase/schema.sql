-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text unique,
  student_id text unique,
  role text check (role in ('student', 'admin')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- News Table (Admin announcements)
create table news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references profiles(id) not null
);

alter table news enable row level security;

create policy "News is viewable by everyone." on news
  for select using (true);

create policy "Only admins can insert news." on news
  for insert with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Forum Categories / Subforums
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text
);

alter table categories enable row level security;
create policy "Categories are viewable by everyone" on categories for select using (true);
-- Seed categories (Can be done manually or via migration)

-- Posts Table
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null, -- Markdown/LaTeX
  category_id uuid references categories(id) not null,
  author_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Posts are viewable by everyone." on posts
  for select using (true);

create policy "Authenticated users can create posts." on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own posts." on posts
  for update using (auth.uid() = author_id);

-- Comments Table
create table comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone." on comments
  for select using (true);

create policy "Authenticated users can create comments." on comments
  for insert with check (auth.role() = 'authenticated');

-- Resources Table
create table resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null,
  tags text[], -- Array of strings for tags
  uploader_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table resources enable row level security;

create policy "Resources are viewable by authenticated users." on resources
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can upload resources." on resources
  for insert with check (auth.role() = 'authenticated');
