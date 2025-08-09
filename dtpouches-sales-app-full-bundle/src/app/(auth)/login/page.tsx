'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg(error.message);
    else setMsg('Check your email for a magic link.');
  };

  return (
    <div style={{ background:'#fff', padding:24, borderRadius:12, border:'1px solid #e5e7eb' }}>
      <h2>Login</h2>
      <form onSubmit={handleMagicLink}>
        <label>Email<br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" style={{ padding:8, width:'100%', border:'1px solid #ccc', borderRadius:8 }}/>
        </label>
        <div style={{ marginTop:12 }}>
          <button type="submit" style={{ padding:'8px 12px', borderRadius:8 }}>Send magic link</button>
        </div>
      </form>
      {msg && <p style={{ marginTop:12 }}>{msg}</p>}
    </div>
  );
}
