create table if not exists public.site_content (
  id integer primary key,
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_site_content_updated_at
before update on public.site_content
for each row
execute procedure public.set_updated_at();
