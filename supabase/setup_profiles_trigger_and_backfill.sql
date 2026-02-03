-- 1. Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, student_id)
  values (
    new.id,
    new.email,
    -- Extract student ID from email if possible (e.g. PHY1234567@xmu.edu.my -> 1234567)
    -- This is a simple regex extraction, might need adjustment based on exact format
    substring(new.email from 'PHY([0-9]+)')
  );
  return new;
end;
$$;

-- 2. Create the trigger
-- Drop if exists to ensure clean state
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill missing profiles for existing users
insert into public.profiles (id, email, student_id)
select 
  id, 
  email, 
  substring(email from 'PHY([0-9]+)')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
