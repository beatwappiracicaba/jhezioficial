drop table if exists public.admin_profiles cascade;
drop table if exists public.admin_accounts cascade;
drop table if exists public.videos cascade;
drop table if exists public.media_items cascade;
drop table if exists public.events cascade;
drop table if exists public.highlights cascade;
drop table if exists public.site_config cascade;

drop function if exists public.set_updated_at() cascade;

create table public.site_config (
  id integer primary key default 1,
  hero_eyebrow text,
  hero_title text,
  hero_lead text,
  hero_button_text text,
  hero_secondary_text text,
  about_title text,
  about_text text,
  contact_title text,
  contact_text text,
  contact_email text,
  whatsapp text,
  instagram text,
  youtube text,
  hero_image text,
  logo_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.highlights (
  id serial primary key,
  site_config_id integer not null default 1 references public.site_config(id) on delete cascade,
  content text not null,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id serial primary key,
  site_config_id integer not null default 1 references public.site_config(id) on delete cascade,
  event_date text,
  title text,
  place text,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_items (
  id serial primary key,
  site_config_id integer not null default 1 references public.site_config(id) on delete cascade,
  title text not null,
  description text,
  category text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.videos (
  id serial primary key,
  site_config_id integer not null default 1 references public.site_config(id) on delete cascade,
  title text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.admin_accounts (
  id serial primary key,
  email text unique not null,
  password text not null,
  role text not null default 'producer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.admin_accounts (email, password, role)
values ('alan@produtor.com', '@Aggtr4907', 'producer')
on conflict (email) do update set password = excluded.password, role = excluded.role;

insert into public.site_config (
  id,
  hero_eyebrow,
  hero_title,
  hero_lead,
  hero_button_text,
  hero_secondary_text,
  about_title,
  about_text,
  contact_title,
  contact_text,
  contact_email,
  whatsapp,
  instagram,
  youtube,
  hero_image,
  logo_image
)
values (
  1,
  'Jhezi - O Diferenciado do Forró',
  'Som que agita festas, eventos e noites inesquecíveis.',
  'Jhezi traz o melhor do forró, pisadinha e emoção para cada apresentação. Reservas abertas para eventos, casamentos e shows corporativos.',
  'Reservar agora',
  'Ver agenda',
  'Música que contagia multidões em todos os tipos de festa.',
  'Com mais de 10 anos na estrada, Jhezi combina repertório autoral e sucessos que fazem o público cantar junto do início ao fim. Traga energia e emoção para seu evento com uma performance inesquecível.',
  'Pronto para transformar seu evento em algo inesquecível?',
  'Fale com o produtor para verificar disponibilidade, valores e formatos de show. Estamos prontos para levar seu evento ao próximo nível.',
  'contato@jhezi.com',
  '33998485840',
  'https://www.instagram.com/jhezi_odiferenciado_doforro',
  'https://youtube.com/@jhezi_odiferenciado_doforro',
  '',
  ''
);

insert into public.highlights (site_config_id, content, position)
values
  (1, 'Performance intensa com presença de palco', 0),
  (1, 'Repertório cheio de forró, pisadinha e emoção', 1),
  (1, 'Atendimento personalizado para cada evento', 2);

insert into public.events (site_config_id, event_date, title, place, position)
values
  (1, '15/07', 'Festa Comemorativa', 'São Paulo', 0),
  (1, '22/07', 'Evento Privado', 'Campinas', 1),
  (1, '05/08', 'Show Aberto', 'Belo Horizonte', 2);

insert into public.media_items (site_config_id, title, description, category, image_url, position)
values
  (1, 'Último show', 'Momento de grande energia em palco.', 'show', '', 0),
  (1, 'Novo lançamento', 'Repertório novo para o público cantar.', 'release', '', 1);

insert into public.videos (site_config_id, title, url, position)
values
  (1, 'Show ao vivo', 'https://www.youtube.com/embed/ScMzIvxBSi4', 0);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_site_config_updated_at on public.site_config;
create trigger set_site_config_updated_at
before update on public.site_config
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_highlights_updated_at on public.highlights;
create trigger set_highlights_updated_at
before update on public.highlights
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_media_items_updated_at on public.media_items;
create trigger set_media_items_updated_at
before update on public.media_items
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_videos_updated_at on public.videos;
create trigger set_videos_updated_at
before update on public.videos
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_admin_accounts_updated_at on public.admin_accounts;
create trigger set_admin_accounts_updated_at
before update on public.admin_accounts
for each row
execute procedure public.set_updated_at();
