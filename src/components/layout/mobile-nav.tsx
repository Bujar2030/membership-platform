'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const adminNavItems = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/evp', label: 'EVP/CPD', icon: GraduationCap },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/audit-log', label: 'Audit Log', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const memberNavItems = [
  { href: '/dashboard/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/evp', label: 'My EVP', icon: GraduationCap },
  { href: '/payments', label: 'My Payments', icon: CreditCard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const bottomNavAdmin = [
  { href: '/dashboard/admin', label: 'Home', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/evp', label: 'EVP', icon: GraduationCap },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

const bottomNavMember = [
  { href: '/dashboard/member', label: 'Home', icon: LayoutDashboard },
  { href: '/evp', label: 'EVP', icon: GraduationCap },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();
  const { profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : memberNavItems;
  const bottomNav = isAdmin ? bottomNavAdmin : bottomNavMember;

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`
    : '?';

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">MemberHub</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative p-2">
            <Bell className="h-5 w-5" />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <Separator className="mb-2" />
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <Separator className="my-2" />
                <button
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 flex-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
