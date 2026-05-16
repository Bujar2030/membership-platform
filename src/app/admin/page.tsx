'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Building2, Users, CreditCard, Search, Globe } from 'lucide-react';
import type { Organization } from '@/types/database';

interface OrgWithStats extends Organization {
  member_count: number;
  active_count: number;
  paid_count: number;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  basic: 'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

export default function SuperAdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [orgs, setOrgs] = useState<OrgWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && profile?.role !== 'platform_super_admin') {
      router.replace('/dashboard/admin');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (profile?.role !== 'platform_super_admin') return;

    const fetchOrgs = async () => {
      const [orgsRes, membersRes, paymentsRes] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('id, organization_id, status'),
        supabase.from('payments').select('id, organization_id, status'),
      ]);

      const membersByOrg = new Map<string, { total: number; active: number }>();
      (membersRes.data ?? []).forEach((m) => {
        const cur = membersByOrg.get(m.organization_id) ?? { total: 0, active: 0 };
        membersByOrg.set(m.organization_id, {
          total: cur.total + 1,
          active: cur.active + (m.status === 'active' ? 1 : 0),
        });
      });

      const paidByOrg = new Map<string, number>();
      (paymentsRes.data ?? []).forEach((p) => {
        if (p.status === 'paid') {
          paidByOrg.set(p.organization_id, (paidByOrg.get(p.organization_id) ?? 0) + 1);
        }
      });

      const enriched: OrgWithStats[] = (orgsRes.data ?? []).map((org) => ({
        ...org,
        member_count: membersByOrg.get(org.id)?.total ?? 0,
        active_count: membersByOrg.get(org.id)?.active ?? 0,
        paid_count: paidByOrg.get(org.id) ?? 0,
      }));

      setOrgs(enriched);
      setLoading(false);
    };

    fetchOrgs();
  }, [profile?.role, supabase]);

  const filtered = orgs.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.short_name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = orgs.reduce((s, o) => s + o.member_count, 0);
  const totalActive = orgs.reduce((s, o) => s + o.active_count, 0);
  const totalPaid = orgs.reduce((s, o) => s + o.paid_count, 0);

  if (authLoading || profile?.role !== 'platform_super_admin') {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Super Admin Panel"
        description="Platform-wide overview of all organizations"
      />

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Organizations" value={orgs.length} icon={Building2} description="Total on platform" />
        <StatCard title="Total Members" value={totalMembers} icon={Users} description="All organizations" />
        <StatCard title="Active Members" value={totalActive} icon={Users} description="Current status" />
        <StatCard title="Paid This Year" value={totalPaid} icon={CreditCard} description="Payments recorded" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((org) => (
            <Card key={org.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: org.primary_color }}
                  >
                    {org.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="h-12 w-12 rounded-xl object-contain"
                      />
                    ) : (
                      org.short_name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{org.name}</p>
                          <StatusBadge status={org.status} />
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PLAN_COLORS[org.subscription_plan] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {org.subscription_plan}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="font-mono text-foreground/70">{org.short_name}</span>
                          <span>{org.email}</span>
                          {org.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {org.website.replace(/^https?:\/\//, '')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">{org.member_count}</span>
                        <span className="text-muted-foreground ml-1">members</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-green-600">{org.active_count}</span>
                        <span className="text-muted-foreground ml-1">active</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">{org.paid_count}</span>
                        <span className="text-muted-foreground ml-1">payments</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        EVP: {org.evp_required_hours}h / {org.evp_period_months}mo
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fee: {org.membership_fee} {org.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No organizations found
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}
