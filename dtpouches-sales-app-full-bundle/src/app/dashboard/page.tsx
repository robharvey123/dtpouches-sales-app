import { KPI } from '../../components/KPI';

export default function DashboardPage() {
  return (
    <div>
      <h2>Executive Overview</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
        <KPI label="Units (MTD)" value="—" />
        <KPI label="Net Sales (MTD)" value="—" />
        <KPI label="MoM Change" value="—" />
        <KPI label="Target %" value="—" />
      </div>
      <div style={{ marginTop:16, background:'#fff', padding:16, borderRadius:12, border:'1px solid #e5e7eb' }}>
        <p>Once you ingest data, we will render 12‑month trends and top movers here.</p>
      </div>
    </div>
  );
}
