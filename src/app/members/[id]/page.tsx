'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import type { Member, EVPRecord, Payment } from '@/types/database';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [member, setMember] = useState<Member | null>(null);
  const [evpRecords, setEvpRecords] = useState<EVPRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const memberId = params.id as string;

  const fetchMember = useCallback(async () => {
    const [memberRes, evpRes, paymentRes] = await Promise.all([
      supabase.from('members').select('*').eq('id', memberId).single(),
      supabase.from('evp_records').select('*').eq('member_id', memberId).order('date', { ascending: false }),
      supabase.from('payments').select('*').eq('member_id', memberId).order('year', { ascending: false }),
    ]);

    setMember(memberRes.data);
    setEvpRecords(evpRes.data || []);
    setPayments(paymentRes.data || []);
    setLoading(false);
  }, [memberId, supabase]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    await supabase.from('members').delete().eq('id', memberId);
    router.push('/members');
  };

  const evpEarned = evpRecords
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.hours, 0);
  const evpRequired = 40;
  const evpProgress = Math.min((evpEarned / evpRequired) * 100, 100);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Member not found</p>
          <Button variant="link" onClick={() => router.push('/members')}>
            Back to members
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/members')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        description={`${member.member_number} · ${member.category}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="evp">EVP</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{member.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <StatusBadge status={member.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{member.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{member.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registered</p>
                    <p className="font-medium">
                      {new Date(member.registration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EVP Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">EVP/CPD Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{evpEarned}h earned</span>
                    <span>{evpRequired}h required</span>
                  </div>
                  <Progress value={evpProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="membership">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Member Number</p>
                  <p className="font-medium">{member.member_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={member.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {member.membership_start
                      ? new Date(member.membership_start).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {member.membership_end
                      ? new Date(member.membership_end).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No payment records
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {payment.amount} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Year: {payment.year} ·{' '}
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : 'Not paid'}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evp">
          {evpRecords.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No EVP/CPD records
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {evpRecords.map((evp) => (
                <Card key={evp.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{evp.title}</p>
                      <StatusBadge status={evp.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{evp.hours}h</span>
                      <span>{evp.provider}</span>
                      <span>{new Date(evp.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
