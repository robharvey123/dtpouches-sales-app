import { StandardSalesRow } from './types';

export function validateRow(row: Partial<StandardSalesRow>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!row.invoice_date) errors.push('invoice_date missing');
  if (!row.customer_code) errors.push('customer_code missing');
  if (!row.brand) errors.push('brand missing');
  if (!row.product_sku) errors.push('product_sku missing');
  if (row.units == null || Number.isNaN(Number(row.units))) errors.push('units invalid');
  if (row.net_value == null || Number.isNaN(Number(row.net_value))) errors.push('net_value invalid');
  return { ok: errors.length === 0, errors };
}
