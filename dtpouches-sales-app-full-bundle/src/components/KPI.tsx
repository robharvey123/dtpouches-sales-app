export function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background:'#fff', padding:16, borderRadius:12, border:'1px solid #e5e7eb', textAlign:'center' }}>
      <div style={{ fontSize:12, color:'#666' }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700 }}>{value}</div>
    </div>
  );
}
