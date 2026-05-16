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
  LogOut,
  Shield,
  ClipboardList,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
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

export function Sidebar() {
  const pathname = usePathname();
  const { profile, isAdmin, signOut } = useAuth();
  const { organization } = useOrganization();

  const isSuperAdmin = profile?.role === 'platform_super_admin';
  const navItems = [
    ...(isSuperAdmin ? [{ href: '/admin', label: 'All Organizations', icon: Building2 }] : []),
    ...(isAdmin ? adminNavItems : memberNavItems),
  ];
  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`
    : '?';

  const orgInitials = organization?.short_name?.slice(0, 2).toUpperCase() ?? 'MH';

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo / Org Branding */}
        <div className="flex items-center gap-3 px-4 py-4 border-b">
          {organization?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="h-9 w-9 rounded-lg object-contain flex-shrink-0"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: organization?.primary_color ?? '#0f172a' }}
            >
              {organization ? orgInitials : <Shield className="h-5 w-5" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight truncate">
              {organization?.name ?? 'MemberHub'}
            </p>
            {organization && (
              <p className="text-xs text-muted-foreground truncate capitalize">
                {organization.subscription_plan} plan
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback
                className="text-xs text-white"
                style={{ backgroundColor: organization?.primary_color ?? '#0f172a' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {profile?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <Separator className="my-2" />
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
