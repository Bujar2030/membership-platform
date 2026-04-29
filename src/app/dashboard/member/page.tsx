'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  UserCheck,
  GraduationCap,
  CreditCard,
  Bell,
  Calendar,
} from 'lucide-react';
import type { Member, EVPRecord, Payment, Notification } from '@/types/database';

export default function MemberDashboard() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [member, setMember] = useState<Member | null>(null);
  const [evpRecords, setEvpRecords] = useState<EVPRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      // First fetch the member record to get the member ID
      const memberRes = await supabase
        .from('members')
        .select('*')
        .eq('user_profile_id', profile.id)
        .single();

      setMember(memberRes.data);

      if (memberRes.data) {
        // Fetch member-specific EVP records and payments
        const [evpRes, paymentsRes, notifRes] = await Promise.all([
          supabase
            .from('evp_records')
            .select('*')
            .eq('member_id', memberRes.data.id)
            .order('date', { ascending: false })
            .limit(5),
          supabase
            .from('payments')
            .select('*')
            .eq('member_id', memberRes.data.id)
            .order('year', { ascending: false })
            .limit(5),
          supabase
            .from('notifications')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        setEvpRecords(evpRes.data || []);
        setPayments(paymentsRes.data || []);
        setNotifications(notifRes.data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile, supabase]);

  const evpEarned = evpRecords
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.hours, 0);
  const evpRequired = 40;
  const evpProgress = Math.min((evpEarned / evpRequired) * 100, 100);

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome, ${profile?.first_name ?? 'Member'}`}
        description="Your membership overview"
      />

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="Membership"
          value={member?.status ?? '...'}
          icon={UserCheck}
        />
        <StatCard
          title="EVP Hours"
          value={loading ? '...' : `${evpEarned}/${evpRequired}`}
          icon={GraduationCap}
        />
        <StatCard
          title="Payments"
          value={loading ? '...' : payments.filter((p) => p.status === 'paid').length}
          icon={CreditCard}
          description="Paid this year"
        />
        <StatCard
          title="Notifications"
          value={loading ? '...' : notifications.length}
          icon={Bell}
        />
      </div>

      {/* EVP Progress */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">EVP/CPD Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{evpEarned} hours earned</span>
              <span>{evpRequired} hours required</span>
            </div>
            <Progress value={evpProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {evpEarned >= evpRequired
                ? 'You are compliant!'
                : `${evpRequired - evpEarned} more hours needed`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Membership Info */}
      {member && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Membership Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Member #</p>
                <p className="font-medium">{member.member_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{member.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {member.membership_start
                    ? new Date(member.membership_start).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {member.membership_end
                    ? new Date(member.membership_end).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-base">Recent Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-4">No notifications</p>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div key={notif.id} className="px-6 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <StatusBadge status={notif.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
