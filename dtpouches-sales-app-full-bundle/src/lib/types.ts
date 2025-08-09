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

  // 👇 add this line
  source_system?: string;
};
