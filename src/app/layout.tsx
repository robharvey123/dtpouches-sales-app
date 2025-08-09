export const metadata = {
  title: 'DT Pouches Sales App',
  description: 'Upload, analyse, and visualise sales data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif', background:'#f7f7f8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <header style={{ padding: '16px 0', textAlign: 'center' }}>
            <h1 style={{ margin:0 }}>DT Pouches Sales App</h1>
          </header>
          <nav style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:8 }}>
            <a href="/login">Login</a>
            <a href="/upload">Upload</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
          <main style={{ padding:16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
