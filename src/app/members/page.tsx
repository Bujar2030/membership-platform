'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Search, ChevronRight, Loader2 } from 'lucide-react';
import { MEMBER_CATEGORIES, MEMBER_STATUSES } from '@/lib/constants';
import type { Member, MemberCategory, MemberStatus } from '@/types/database';

export default function MembersPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    category: 'associate' as MemberCategory,
    status: 'pending' as MemberStatus,
  });

  const fetchMembers = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });
    setMembers(data || []);
    setLoading(false);
  }, [profile?.organization_id, supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    let result = members;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.first_name.toLowerCase().includes(q) ||
          m.last_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.member_number.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }
    setFiltered(result);
  }, [members, search, statusFilter]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id) return;
    setSaving(true);

    const memberNumber = `MBR-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('members').insert({
      organization_id: profile.organization_id,
      member_number: memberNumber,
      first_name: newMember.first_name,
      last_name: newMember.last_name,
      email: newMember.email,
      phone: newMember.phone || null,
      category: newMember.category,
      status: newMember.status,
      registration_date: new Date().toISOString(),
    });

    if (!error) {
      setDialogOpen(false);
      setNewMember({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        category: 'associate',
        status: 'pending',
      });
      fetchMembers();
    }
    setSaving(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Members"
        description={`${members.length} total members`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10">
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={newMember.first_name}
                      onChange={(e) =>
                        setNewMember({ ...newMember, first_name: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={newMember.last_name}
                      onChange={(e) =>
                        setNewMember({ ...newMember, last_name: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newMember.phone}
                    onChange={(e) =>
                      setNewMember({ ...newMember, phone: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newMember.category}
                      onValueChange={(v) =>
                        setNewMember({ ...newMember, category: v as MemberCategory })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newMember.status}
                      onValueChange={(v) =>
                        setNewMember({ ...newMember, status: v as MemberStatus })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
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
            {MEMBER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members List - Card view for mobile */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members found"
          description={search ? 'Try a different search term' : 'Add your first member to get started'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {member.first_name} {member.last_name}
                      </p>
                      <StatusBadge status={member.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{member.member_number}</span>
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
