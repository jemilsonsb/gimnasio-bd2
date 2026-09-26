import { Navbar } from './Navbar.jsx';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
