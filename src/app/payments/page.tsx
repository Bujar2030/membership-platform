'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Plus,
  Search,
  Loader2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { Payment, PaymentMethod, PaymentStatus, Member } from '@/types/database';

export default function PaymentsPage() {
  const { profile, isAdmin } = useAuth();
  const supabase = createClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newPayment, setNewPayment] = useState({
    member_id: '',
    year: new Date().getFullYear(),
    amount: 0,
    method: 'bank_transfer' as PaymentMethod,
    status: 'unpaid' as PaymentStatus,
  });

  const fetchPayments = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('year', { ascending: false });
    setPayments(data || []);

    if (isAdmin) {
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('organization_id', profile.organization_id);
      setMembers(memberData || []);
    }
    setLoading(false);
  }, [profile?.organization_id, isAdmin, supabase]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    const matchesSearch = !search || p.year.toString().includes(search);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const unpaidCount = payments.filter((p) => p.status === 'unpaid').length;
  const overdueCount = payments.filter((p) => p.status === 'overdue').length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;
    setSaving(true);

    const dueDate = new Date(newPayment.year, 11, 31).toISOString();

    const { error } = await supabase.from('payments').insert({
      organization_id: profile.organization_id,
      member_id: newPayment.member_id,
      year: newPayment.year,
      amount: newPayment.amount,
      currency: 'EUR',
      due_date: dueDate,
      method: newPayment.status === 'paid' ? newPayment.method : null,
      status: newPayment.status,
      payment_date: newPayment.status === 'paid' ? new Date().toISOString() : null,
    });

    if (!error) {
      if (newPayment.status === 'paid') {
        await supabase
          .from('members')
          .update({ status: 'active' })
          .eq('id', newPayment.member_id);
      }
      setDialogOpen(false);
      setNewPayment({
        member_id: '',
        year: new Date().getFullYear(),
        amount: 0,
        method: 'bank_transfer',
        status: 'unpaid',
      });
      fetchPayments();
    }
    setSaving(false);
  };

  const handleMarkPaid = async (paymentId: string, memberId: string) => {
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        method: 'bank_transfer',
      })
      .eq('id', paymentId);

    await supabase
      .from('members')
      .update({ status: 'active' })
      .eq('id', memberId);

    fetchPayments();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Payments"
        description="Annual membership fee tracking"
        action={
          isAdmin ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <Select
                      value={newPayment.member_id}
                      onValueChange={(v) => setNewPayment({ ...newPayment, member_id: v })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.first_name} {m.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={newPayment.year}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, year: parseInt(e.target.value) })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (EUR)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={newPayment.status}
                        onValueChange={(v) =>
                          setNewPayment({ ...newPayment, status: v as PaymentStatus })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select
                        value={newPayment.method}
                        onValueChange={(v) =>
                          setNewPayment({ ...newPayment, method: v as PaymentMethod })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Payment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard title="Total Paid" value={`€${totalPaid}`} icon={DollarSign} />
        <StatCard title="Unpaid" value={unpaidCount} icon={AlertTriangle} />
        <StatCard title="Overdue" value={overdueCount} icon={CreditCard} />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments"
          description="Record your first payment"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      €{payment.amount}
                    </p>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Year: {payment.year}</span>
                    {payment.payment_date && (
                      <>
                        <span>·</span>
                        <span>
                          Paid: {new Date(payment.payment_date).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {payment.method && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
                {isAdmin && payment.status !== 'paid' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 flex-shrink-0"
                    onClick={() => handleMarkPaid(payment.id, payment.member_id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Paid
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
