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
import { Textarea } from '@/components/ui/textarea';
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
  GraduationCap,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { EVP_SOURCES } from '@/lib/constants';
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

export default function EVPPage() {
  const { profile, isAdmin } = useAuth();
  const supabase = createClient();
  const [records, setRecords] = useState<EVPRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRecord, setNewRecord] = useState({
    member_id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    source: 'external' as EVPSource,
    category: 'Other',
    hours: 1,
  });

  const fetchRecords = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data } = await supabase
      .from('evp_records')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('date', { ascending: false });
    setRecords(data || []);

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
    fetchRecords();
  }, [fetchRecords]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalHours = records.filter((r) => r.status === 'approved').reduce((s, r) => s + r.hours, 0);
  const submittedCount = records.filter((r) => r.status === 'submitted').length;
  const approvedCount = records.filter((r) => r.status === 'approved').length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;
    setSaving(true);

    const { error } = await supabase.from('evp_records').insert({
      organization_id: profile.organization_id,
      member_id: newRecord.member_id,
      title: newRecord.title,
      description: newRecord.description || null,
      date: newRecord.date,
      provider: newRecord.provider,
      source: newRecord.source,
      category: newRecord.category,
      hours: newRecord.hours,
      status: 'submitted',
    });

    if (!error) {
      setDialogOpen(false);
      setNewRecord({
        member_id: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        provider: '',
        source: 'external',
        category: 'Other',
        hours: 1,
      });
      fetchRecords();
    }
    setSaving(false);
  };

  const handleStatusChange = async (recordId: string, status: EVPStatus) => {
    await supabase
      .from('evp_records')
      .update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() })
      .eq('id', recordId);
    fetchRecords();
  };

  return (
    <AppLayout>
      <PageHeader
        title="EVP/CPD"
        description="Continuing Professional Development tracking"
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
                <DialogTitle>Add EVP/CPD Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <Select
                      value={newRecord.member_id}
                      onValueChange={(v) => setNewRecord({ ...newRecord, member_id: v })}
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
                )}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={newRecord.hours}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, hours: parseFloat(e.target.value) })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input
                    value={newRecord.provider}
                    onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select
                      value={newRecord.source}
                      onValueChange={(v) =>
                        setNewRecord({ ...newRecord, source: v as EVPSource })
                      }
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
                      value={newRecord.category}
                      onValueChange={(v) => setNewRecord({ ...newRecord, category: v })}
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
        <StatCard title="Approved Hours" value={totalHours} icon={CheckCircle} />
        <StatCard title="Pending" value={submittedCount} icon={Clock} />
        <StatCard title="Approved" value={approvedCount} icon={GraduationCap} />
      </div>

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
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No EVP records"
          description="Add your first EVP/CPD record"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{record.title}</p>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold">{record.hours}h</span>
                      <span>·</span>
                      <span>{record.provider}</span>
                      <span>·</span>
                      <span>{record.source}</span>
                      <span>·</span>
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isAdmin && record.status === 'submitted' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        onClick={() => handleStatusChange(record.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleStatusChange(record.id, 'rejected')}
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
