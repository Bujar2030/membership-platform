'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
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
import { Bell, Loader2, Send, Megaphone } from 'lucide-react';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES, MEMBER_CATEGORIES, MEMBER_STATUSES } from '@/lib/constants';
import type { Notification, NotificationType, NotificationPriority } from '@/types/database';

export default function NotificationsPage() {
  const { profile, isAdmin } = useAuth();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newNotif, setNewNotif] = useState({
    title: '',
    message: '',
    type: 'general' as NotificationType,
    priority: 'normal' as NotificationPriority,
    target_all: true,
    target_category: '' as string,
    target_status: '' as string,
  });

  const fetchNotifications = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }, [profile?.organization_id, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id || !profile?.id) return;
    setSaving(true);

    const { error } = await supabase.from('notifications').insert({
      organization_id: profile.organization_id,
      sender_id: profile.id,
      title: newNotif.title,
      message: newNotif.message,
      type: newNotif.type,
      priority: newNotif.priority,
      target_all: newNotif.target_all,
      target_category: newNotif.target_all ? null : newNotif.target_category || null,
      target_status: newNotif.target_all ? null : newNotif.target_status || null,
    });

    if (!error) {
      setDialogOpen(false);
      setNewNotif({
        title: '',
        message: '',
        type: 'general',
        priority: 'normal',
        target_all: true,
        target_category: '',
        target_status: '',
      });
      fetchNotifications();
    }
    setSaving(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        description={isAdmin ? 'Send and manage notifications' : 'Your notifications'}
        action={
          isAdmin ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10">
                  <Send className="h-4 w-4 mr-1" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newNotif.title}
                      onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={newNotif.message}
                      onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newNotif.type}
                        onValueChange={(v) =>
                          setNewNotif({ ...newNotif, type: v as NotificationType })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTIFICATION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newNotif.priority}
                        onValueChange={(v) =>
                          setNewNotif({ ...newNotif, priority: v as NotificationPriority })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTIFICATION_PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Target Audience</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newNotif.target_all ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewNotif({ ...newNotif, target_all: true })}
                      >
                        All Members
                      </Button>
                      <Button
                        type="button"
                        variant={!newNotif.target_all ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewNotif({ ...newNotif, target_all: false })}
                      >
                        Targeted
                      </Button>
                    </div>
                    {!newNotif.target_all && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">By Category</Label>
                          <Select
                            value={newNotif.target_category}
                            onValueChange={(v) =>
                              setNewNotif({ ...newNotif, target_category: v })
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {MEMBER_CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">By Status</Label>
                          <Select
                            value={newNotif.target_status}
                            onValueChange={(v) =>
                              setNewNotif({ ...newNotif, target_status: v })
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {MEMBER_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Notification
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={isAdmin ? 'Send your first notification' : 'No notifications yet'}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="font-medium text-sm">{notif.title}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <StatusBadge status={notif.type} />
                    <StatusBadge status={notif.priority} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 ml-6">
                  {notif.message}
                </p>
                <div className="flex items-center gap-2 mt-2 ml-6 text-xs text-muted-foreground">
                  <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>
                    {notif.target_all
                      ? 'All members'
                      : `${notif.target_category || ''} ${notif.target_status || ''}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
