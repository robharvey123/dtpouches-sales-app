-- DT Pouches sales app schema (Postgres/Supabase)
create table if not exists organisation (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists app_user (
  id uuid primary key default auth.uid(),
  organisation_id uuid not null references organisation(id),
  full_name text,
  email text unique
);

create table if not exists customer (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id),
  customer_code text not null,
  customer_name text not null,
  account_type text,
  channel text,
  region text,
  billing_country text,
  billing_postcode text,
  email text,
  phone text,
  zoho_account_id text,
  status text default 'Active',
  unique (organisation_id, customer_code)
);

create table if not exists product (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id),
  product_sku text not null,
  product_name text,
  brand text not null,
  unique (organisation_id, product_sku)
);

create table if not exists sales (
  id bigserial primary key,
  organisation_id uuid not null references organisation(id),
  invoice_date date not null,
  invoice_number text,
  customer_id uuid not null references customer(id),
  product_id uuid not null references product(id),
  units integer not null check (units >= 0),
  net_value numeric(14,2) not null default 0,
  currency text default 'GBP',
  channel text,
  region text,
  sales_rep text,
  source_system text,
  notes text,
  source_file_id uuid,
  created_at timestamptz default now()
);

create table if not exists source_file (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisation(id),
  uploaded_by uuid references app_user(id),
  filename text,
  uploaded_at timestamptz default now(),
  row_count integer,
  sha256 text
);

-- Enable Row Level Security
alter table organisation enable row level security;
alter table app_user enable row level security;
alter table customer enable row level security;
alter table product enable row level security;
alter table sales enable row level security;
alter table source_file enable row level security;

-- Basic RLS: users can see rows for their organisation only
create policy org_rw on organisation for all using (true) with check (true);
create policy app_user_self on app_user for select using (id = auth.uid());
create policy app_user_org on app_user for all using (organisation_id in (select organisation_id from app_user where id = auth.uid())) with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
create policy customer_org on customer for all using (organisation_id in (select organisation_id from app_user where id = auth.uid())) with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
create policy product_org on product for all using (organisation_id in (select organisation_id from app_user where id = auth.uid())) with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
create policy sales_org on sales for all using (organisation_id in (select organisation_id from app_user where id = auth.uid())) with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
create policy source_file_org on source_file for all using (organisation_id in (select organisation_id from app_user where id = auth.uid())) with check (organisation_id in (select organisation_id from app_user where id = auth.uid()));
