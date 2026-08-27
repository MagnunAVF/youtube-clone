import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './app-shell.css';

export function AppShell() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
