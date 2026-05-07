'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  GraduationCap,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { EVP_SOURCES } from '@/lib/constants';
import { toast } from 'sonner';
import type { EVPRecord, EVPSource, EVPStatus, Member } from '@/types/database';

const EVP_CATEGORIES = [
  'Audit & Assurance',
  'Tax & Compliance',
  'Financial Reporting',
  'Ethics & Governance',
  'Technology & Digital',
  'Management & Leadership',
  'Industry Specific',
  'Other',
];

const defaultForm = {
  member_id: '',
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  provider: '',
  source: 'external' as EVPSource,
  category: 'Other',
  hours: 1,
};

export default function EVPPage() {
  const { profile, isAdmin } = useAuth();
  const { organization } = useOrganization();
  const supabase = createClient();
  const [records, setRecords] = useState<EVPRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const requiredHours = organization?.evp_required_hours ?? 40;
  const periodMonths = organization?.evp_period_months ?? 12;

  const fetchRecords = useCallback(async () => {
    if (!profile?.organization_id) return;

    const [recordsRes, membersRes] = await Promise.all([
      supabase
        .from('evp_records')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('date', { ascending: false }),
      isAdmin
        ? supabase
            .from('members')
            .select('id, first_name, last_name')
            .eq('organization_id', profile.organization_id)
            .order('first_name')
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (recordsRes.error) {
      toast.error('Failed to load EVP records');
      setLoading(false);
      return;
    }

    setRecords(recordsRes.data ?? []);
    setMembers((membersRes.data as Member[]) ?? []);
    setLoading(false);
  }, [profile?.organization_id, isAdmin, supabase]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedHours = records
    .filter((r) => r.status === 'approved')
    .reduce((s, r) => s + r.hours, 0);
  const submittedCount = records.filter((r) => r.status === 'submitted').length;
  const approvedCount = records.filter((r) => r.status === 'approved').length;
  const compliancePercent = Math.min(100, Math.round((approvedHours / requiredHours) * 100));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;

    if (isAdmin && !form.member_id) {
      toast.error('Please select a member');
      return;
    }
    if (!form.title.trim() || !form.provider.trim()) {
      toast.error('Title and provider are required');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('evp_records').insert({
      organization_id: profile.organization_id,
      member_id: form.member_id || profile.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      date: form.date,
      provider: form.provider.trim(),
      source: form.source,
      category: form.category,
      hours: form.hours,
      status: 'submitted',
    });

    setSaving(false);

    if (error) {
      toast.error('Failed to submit EVP record. Please try again.');
      return;
    }

    toast.success(`EVP record "${form.title}" submitted for review`);
    setDialogOpen(false);
    setForm(defaultForm);
    fetchRecords();
  };

  const handleStatusChange = async (recordId: string, status: EVPStatus, title: string) => {
    const { error } = await supabase
      .from('evp_records')
      .update({
        status,
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success(
      status === 'approved'
        ? `"${title}" approved`
        : `"${title}" rejected`
    );
    fetchRecords();
  };

  return (
    <AppLayout>
      <PageHeader
        title="EVP/CPD"
        description={`Continuing Professional Development — ${requiredHours}h required per ${periodMonths} months`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10">
                <Plus className="h-4 w-4 mr-1" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit EVP/CPD Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Member *</Label>
                    <Select
                      value={form.member_id}
                      onValueChange={(v) => setForm({ ...form, member_id: v })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select member..." />
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
                )}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. IFRS Update Workshop"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Optional details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours *</Label>
                    <Input
                      type="number"
                      min={0.5}
                      max={200}
                      step={0.5}
                      value={form.hours}
                      onChange={(e) =>
                        setForm({ ...form, hours: parseFloat(e.target.value) || 0.5 })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Provider / Organizer *</Label>
                  <Input
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    required
                    placeholder="e.g. KPMG, CPA Kosovo"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select
                      value={form.source}
                      onValueChange={(v) => setForm({ ...form, source: v as EVPSource })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVP_SOURCES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVP_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard title="Approved Hours" value={approvedHours} icon={CheckCircle} />
        <StatCard title="Pending Review" value={submittedCount} icon={Clock} />
        <StatCard title="Total Approved" value={approvedCount} icon={GraduationCap} />
      </div>

      {/* Compliance Bar */}
      {!isAdmin && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">EVP Compliance Progress</p>
              <span className="text-sm font-semibold">
                {approvedHours} / {requiredHours}h ({compliancePercent}%)
              </span>
            </div>
            <Progress value={compliancePercent} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-2">
              {compliancePercent >= 100
                ? '✓ Compliant — target achieved'
                : `${requiredHours - approvedHours}h more needed to be compliant`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
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
            <SelectItem value="submitted">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No EVP records"
          description={search ? 'Try a different search term' : 'Submit your first EVP/CPD record'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{record.title}</p>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{record.hours}h</span>
                      <span>·</span>
                      <span>{record.provider}</span>
                      <span>·</span>
                      <span>{record.category}</span>
                      <span>·</span>
                      <span className="capitalize">{record.source}</span>
                      <span>·</span>
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    {record.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {record.description}
                      </p>
                    )}
                  </div>
                  {isAdmin && record.status === 'submitted' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Approve"
                        onClick={() => handleStatusChange(record.id, 'approved', record.title)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Reject"
                        onClick={() => handleStatusChange(record.id, 'rejected', record.title)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
