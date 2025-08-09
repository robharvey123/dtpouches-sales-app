'use client';
import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { STANDARD_FIELDS } from '../../lib/types';
import { getMapping, saveMapping, ingestRows } from './actions';

export default function UploadPage() {
  const [fileName, setFileName] = useState<string>('');
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [orgId, setOrgId] = useState<string>('');
  const [customerCode, setCustomerCode] = useState<string>('');
  const [log, setLog] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // TODO: Replace with real org id from session/user profile
  useEffect(() => { setOrgId('00000000-0000-0000-0000-000000000000'); }, []);

  const standardRemaining = useMemo(() => {
    const chosen = new Set(Object.values(mapping).filter(Boolean));
    return STANDARD_FIELDS.filter(f => !chosen.has(f));
  }, [mapping]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const data = (res.data as any[]).filter(Boolean);
        setRawRows(data);
        const cols = data.length ? Object.keys(data[0]) : [];
        setColumns(cols);
        setLog(`Parsed ${data.length} rows from ${file.name}`);
        if (orgId) {
          try {
            const saved = await getMapping({ organisation_id: orgId, customer_code: customerCode || undefined });
            if (saved?.mapping) setMapping(saved.mapping as Record<string,string>);
          } catch (err: any) {
            console.warn('No mapping found yet', err?.message);
          }
        }
      }
    });
  };

  const setSourceMap = (source: string, standard: string) => {
    setMapping(prev => ({ ...prev, [source]: standard }));
  };

  const handleSaveMapping = async () => {
    if (!orgId) return alert('No organisation_id set');
    setBusy(true);
    try {
      await saveMapping({ organisation_id: orgId, customer_code: customerCode || undefined, mapping });
      alert('Mapping saved');
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    } finally { setBusy(false); }
  };

  const handleIngest = async () => {
    if (!orgId) return alert('No organisation_id set');
    if (!rawRows.length) return alert('No rows to ingest');
    setBusy(true);
    try {
      const res = await ingestRows({ organisation_id: orgId, rows: rawRows, mapping });
      if (!res.ok) {
        setLog(`Validation errors on ${res.errors.length} rows. First issue: ${res.errors[0]?.issues.join(', ')}`);
      } else {
        setLog(`Inserted ${res.inserted} rows into sales.`);
      }
    } catch (e: any) {
      alert('Ingest failed: ' + e.message);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ background:'#fff', padding:24, borderRadius:12, border:'1px solid #e5e7eb' }}>
      <h2>Upload & Mapping Wizard</h2>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <input type="file" accept=".csv" onChange={onFile} />
        <input placeholder="Customer code (optional)" value={customerCode} onChange={e=>setCustomerCode(e.target.value)} style={{ padding:8, border:'1px solid #ccc', borderRadius:8 }} />
        <button onClick={handleSaveMapping} disabled={busy} style={{ padding:'8px 12px', borderRadius:8 }}>Save Mapping</button>
        <button onClick={handleIngest} disabled={busy} style={{ padding:'8px 12px', borderRadius:8 }}>Validate & Ingest</button>
      </div>
      <p style={{ marginTop:8, color:'#555' }}>{log}</p>

      {columns.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:12 }}>
          <div>
            <h3>Detected source columns</h3>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', borderBottom:'1px solid #eee', padding:6 }}>Source column</th>
                  <th style={{ textAlign:'left', borderBottom:'1px solid #eee', padding:6 }}>Map to</th>
                </tr>
              </thead>
              <tbody>
                {columns.map(src => (
                  <tr key={src}>
                    <td style={{ borderBottom:'1px solid #f0f0f0', padding:6 }}>{src}</td>
                    <td style={{ borderBottom:'1px solid #f0f0f0', padding:6 }}>
                      <select value={mapping[src] ?? ''} onChange={e => setSourceMap(src, e.target.value)}>
                        <option value="">— ignore —</option>
                        {STANDARD_FIELDS.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3>Unmapped standard fields</h3>
            {standardRemaining.length === 0 ? (
              <p>All standard fields are mapped or intentionally ignored.</p>
            ) : (
              <ul>
                {standardRemaining.map(f => <li key={f}>{f}</li>)}
              </ul>
            )}

            {rawRows.length > 0 && (
              <div style={{ marginTop:12, maxHeight: 360, overflow:'auto' }}>
                <h3>Preview (first 50 rows)</h3>
                <table style={{ borderCollapse:'collapse', width:'100%' }}>
                  <thead>
                    <tr>
                      {columns.map(c => <th key={c} style={{ border:'1px solid #ddd', padding:6, position:'sticky', top:0, background:'#fafafa' }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(0,50).map((r,i) => (
                      <tr key={i}>
                        {columns.map(c => <td key={c} style={{ border:'1px solid #eee', padding:6 }}>{String(r[c] ?? '')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
