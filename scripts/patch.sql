-- Extras: column mapping + staging tables
create table if not exists column_mapping (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id),
  customer_code text, -- optional mapping specific to a customer
  mapping jsonb not null, -- { sourceColumn: standardField }
  created_by uuid references app_user(id),
  created_at timestamptz default now(),
  unique (organisation_id, customer_code)
);

create table if not exists staging_sales (
  id bigserial primary key,
  organisation_id uuid not null references organisation(id),
  source_file_id uuid references source_file(id),
  raw jsonb not null,
  created_at timestamptz default now()
);

alter table column_mapping enable row level security;
alter table staging_sales enable row level security;

create policy cm_org on column_mapping for all
  using (organisation_id in (select organisation_id from app_user where id = auth.uid()))
  with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));

create policy stg_org on staging_sales for all
  using (organisation_id in (select organisation_id from app_user where id = auth.uid()))
  with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
