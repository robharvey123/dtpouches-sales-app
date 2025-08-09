export type StandardSalesRow = {
  // Dates & invoice
  invoice_date: string;            // YYYY-MM-DD
  invoice_number?: string;

  // Customer
  customer_name: string;
  customer_code: string;

  // Product / brand
  brand: string;
  product_sku: string;
  product_name?: string;

  // Metrics
  units: number;
  net_value: number;

  // Optional context
  currency?: string;
  channel?: string;
  region?: string;
  sales_rep?: string;
  notes?: string;

  // set automatically in actions.ts
  source_system?: string;
};

// 👇 add (or replace with) this exact export
export const STANDARD_FIELDS = [
  "invoice_date",
  "invoice_number",
  "customer_name",
  "customer_code",
  "brand",
  "product_sku",
  "product_name",
  "units",
  "net_value",
  "currency",
  "channel",
  "region",
  "sales_rep",
  "notes",
  "source_system"
] as const;

export type StandardField = typeof STANDARD_FIELDS[number];
