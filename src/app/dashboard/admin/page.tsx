'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  GraduationCap,
  Bell,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { DashboardStats, Member, Payment } from '@/types/database';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    expiredMembers: 0,
    unpaidCount: 0,
    evpNonCompliant: 0,
    notificationsSent: 0,
    recentPayments: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.organization_id) return;
    const orgId = profile.organization_id;

    const fetchStats = async () => {
      const [members, payments, notifications] = await Promise.all([
        supabase.from('members').select('*').eq('organization_id', orgId),
        supabase.from('payments').select('*').eq('organization_id', orgId),
        supabase.from('notifications').select('id').eq('organization_id', orgId),
      ]);

      const membersList = members.data || [];
      const paymentsList = payments.data || [];

      setStats({
        totalMembers: membersList.length,
        activeMembers: membersList.filter((m) => m.status === 'active').length,
        pendingMembers: membersList.filter((m) => m.status === 'pending').length,
        expiredMembers: membersList.filter((m) => m.status === 'expired').length,
        unpaidCount: paymentsList.filter((p) => p.status === 'unpaid' || p.status === 'overdue').length,
        evpNonCompliant: 0,
        notificationsSent: notifications.data?.length || 0,
        recentPayments: paymentsList.filter((p) => p.status === 'paid').length,
      });

      setRecentMembers(membersList.slice(-5).reverse());
      setRecentPayments(paymentsList.slice(-5).reverse());
      setLoading(false);
    };

    fetchStats();
  }, [profile?.organization_id, supabase]);

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${profile?.first_name ?? 'Admin'}`}
        description="Here's what's happening with your organization"
      />

      {/* Stats Grid - 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Total Members"
          value={loading ? '...' : stats.totalMembers}
          icon={Users}
          description="All registered"
        />
        <StatCard
          title="Active Members"
          value={loading ? '...' : stats.activeMembers}
          icon={UserCheck}
          description="Current year"
        />
        <StatCard
          title="Unpaid"
          value={loading ? '...' : stats.unpaidCount}
          icon={CreditCard}
          description="Pending payments"
        />
        <StatCard
          title="Notifications"
          value={loading ? '...' : stats.notificationsSent}
          icon={Bell}
          description="Total sent"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="Pending"
          value={loading ? '...' : stats.pendingMembers}
          icon={Clock}
        />
        <StatCard
          title="Expired"
          value={loading ? '...' : stats.expiredMembers}
          icon={UserX}
        />
        <StatCard
          title="EVP Issues"
          value={loading ? '...' : stats.evpNonCompliant}
          icon={GraduationCap}
        />
        <StatCard
          title="Payments"
          value={loading ? '...' : stats.recentPayments}
          icon={TrendingUp}
          description="Paid this year"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-4">No members yet</p>
            ) : (
              <div className="divide-y">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-4">No payments yet</p>
            ) : (
              <div className="divide-y">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-6 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {payment.amount} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Year: {payment.year}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
