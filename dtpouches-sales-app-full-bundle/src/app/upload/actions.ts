'use server';

import { createClient } from '@supabase/supabase-js';
import { STANDARD_FIELDS, StandardSalesRow } from '@/src/lib/types';
import { validateRow } from '@/src/lib/validation';

function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveMapping(params: { organisation_id: string; customer_code?: string; mapping: Record<string,string> }) {
  const sb = supabaseServer();
  const { data, error } = await sb.from('column_mapping').upsert({
    organisation_id: params.organisation_id,
    customer_code: params.customer_code ?? null,
    mapping: params.mapping,
  }, { onConflict: 'organisation_id,customer_code' }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMapping(params: { organisation_id: string; customer_code?: string }) {
  const sb = supabaseServer();
  let { data, error } = await sb.from('column_mapping').select('*').eq('organisation_id', params.organisation_id).eq('customer_code', params.customer_code ?? '').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const res = await sb.from('column_mapping').select('*').eq('organisation_id', params.organisation_id).is('customer_code', null).maybeSingle();
    if (res.error) throw new Error(res.error.message);
    data = res.data as any;
  }
  return data as { id: string; mapping: Record<string,string> } | null;
}

export async function ingestRows(params: {
  organisation_id: string;
  rows: Record<string, any>[];
  mapping: Record<string,string>;
}) {
  const sb = supabaseServer();

  const normalised: StandardSalesRow[] = [];
  const errors: Array<{ index:number; issues:string[] }> = [];

  for (let i = 0; i < params.rows.length; i++) {
    const raw = params.rows[i];
    const mapped: any = {};
    for (const [source, standard] of Object.entries(params.mapping)) {
      if (!standard) continue;
      mapped[standard] = raw[source];
    }
    if (mapped.invoice_date) {
      const d = new Date(mapped.invoice_date);
      if (!isNaN(d.getTime())) mapped.invoice_date = d.toISOString().slice(0,10);
    }
    mapped.units = Number(mapped.units ?? 0);
    mapped.net_value = Number(mapped.net_value ?? 0);
    if (!mapped.currency) mapped.currency = 'GBP';

    const v = validateRow(mapped);
    if (!v.ok) errors.push({ index: i, issues: v.errors });
    else normalised.push(mapped as StandardSalesRow);
  }

  if (errors.length) {
    return { ok: false, inserted: 0, errors };
  }

  const customers = Array.from(new Set(normalised.map(r => `${r.customer_code}||${r.customer_name}`)))
    .map(s => ({ code: s.split('||')[0], name: s.split('||')[1] }));
  const products = Array.from(new Set(normalised.map(r => `${r.product_sku}||${r.product_name ?? ''}||${r.brand}`)))
    .map(s => { const [sku,name,brand] = s.split('||'); return { sku, name, brand }; });

  if (customers.length) {
    const { error } = await sb.from('customer').upsert(customers.map(c => ({
      organisation_id: params.organisation_id,
      customer_code: c.code,
      customer_name: c.name,
    })), { onConflict: 'organisation_id,customer_code' });
    if (error) throw new Error('Customer upsert failed: ' + error.message);
  }

  if (products.length) {
    const { error } = await sb.from('product').upsert(products.map(p => ({
      organisation_id: params.organisation_id,
      product_sku: p.sku,
      product_name: p.name || null,
      brand: p.brand,
    })), { onConflict: 'organisation_id,product_sku' });
    if (error) throw new Error('Product upsert failed: ' + error.message);
  }

  const { data: custRows, error: custErr } = await sb.from('customer').select('id, customer_code').eq('organisation_id', params.organisation_id);
  if (custErr) throw new Error(custErr.message);
  const { data: prodRows, error: prodErr } = await sb.from('product').select('id, product_sku').eq('organisation_id', params.organisation_id);
  if (prodErr) throw new Error(prodErr.message);
  const custMap = new Map(custRows.map(r => [r.customer_code, r.id] as const));
  const prodMap = new Map(prodRows.map(r => [r.product_sku, r.id] as const));

  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < normalised.length; i += chunkSize) {
    const slice = normalised.slice(i, i + chunkSize);
    const payload = slice.map(r => ({
      organisation_id: params.organisation_id,
      invoice_date: r.invoice_date,
      invoice_number: r.invoice_number ?? null,
      customer_id: custMap.get(r.customer_code)!,
      product_id: prodMap.get(r.product_sku)!,
      units: r.units,
      net_value: r.net_value,
      currency: r.currency ?? 'GBP',
      channel: r.channel ?? null,
      region: r.region ?? null,
      sales_rep: r.sales_rep ?? null,
      source_system: r.source_system ?? 'Upload',
      notes: r.notes ?? null,
    }));
    const { error } = await sb.from('sales').insert(payload);
    if (error) throw new Error('Sales insert failed: ' + error.message);
    inserted += payload.length;
  }

  return { ok: true, inserted, errors: [] };
}
