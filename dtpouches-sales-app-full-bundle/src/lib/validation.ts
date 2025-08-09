import { StandardSalesRow } from "./types";

export function validateRow(
  row: Partial<StandardSalesRow>
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // required
  if (!row.invoice_date) errors.push("invoice_date missing");
  if (!row.customer_code) errors.push("customer_code missing");
  if (!row.brand) errors.push("brand missing");
  if (!row.product_sku) errors.push("product_sku missing");

  // numeric checks where provided
  if (row.units != null && Number.isNaN(Number(row.units))) {
    errors.push("units must be a number");
  }
  if (row.net_value != null && Number.isNaN(Number(row.net_value))) {
    errors.push("net_value must be a number");
  }

  return { ok: errors.length === 0, errors };
}
