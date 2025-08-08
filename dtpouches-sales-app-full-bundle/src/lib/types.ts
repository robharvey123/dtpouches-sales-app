export type StandardSalesRow = {
  invoice_date: string; // YYYY-MM-DD
  invoice_number?: string;
  customer_name: string;
  customer_code: string;
  brand: string;
  product_sku: string;
  product_name?: string;
  units: number;
  net_value: number;
  currency?: string;
  channel?: string;
  region?: string;
  sales_rep?: string;
  source_system?: string;
  notes?: string;
};

export const STANDARD_FIELDS: Array<keyof StandardSalesRow> = [
  'invoice_date','invoice_number','customer_name','customer_code','brand','product_sku','product_name','units','net_value','currency','channel','region','sales_rep','source_system','notes'
];
