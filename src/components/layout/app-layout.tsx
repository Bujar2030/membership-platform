'use client';

import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
