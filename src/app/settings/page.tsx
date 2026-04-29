'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import type { Organization } from '@/types/database';

export default function SettingsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchOrg = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();
    setOrg(data);
    setLoading(false);
  }, [profile?.organization_id, supabase]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    await supabase
      .from('organizations')
      .update({
        name: org.name,
        short_name: org.short_name,
        email: org.email,
        phone: org.phone,
        website: org.website,
        primary_color: org.primary_color,
        secondary_color: org.secondary_color,
        evp_required_hours: org.evp_required_hours,
        evp_period_months: org.evp_period_months,
        membership_fee: org.membership_fee,
        currency: org.currency,
      })
      .eq('id', org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!org) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">
          Organization not found
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        description="Manage your organization settings"
        action={
          <Button onClick={handleSave} disabled={saving} className="h-10">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="evp">EVP Rules</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Name</Label>
                  <Input
                    value={org.short_name}
                    onChange={(e) => setOrg({ ...org, short_name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={org.email}
                    onChange={(e) => setOrg({ ...org, email: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={org.phone || ''}
                    onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Website</Label>
                  <Input
                    value={org.website || ''}
                    onChange={(e) => setOrg({ ...org, website: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={org.primary_color}
                      onChange={(e) => setOrg({ ...org, primary_color: e.target.value })}
                      className="w-14 h-11 p-1 cursor-pointer"
                    />
                    <Input
                      value={org.primary_color}
                      onChange={(e) => setOrg({ ...org, primary_color: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={org.secondary_color}
                      onChange={(e) => setOrg({ ...org, secondary_color: e.target.value })}
                      className="w-14 h-11 p-1 cursor-pointer"
                    />
                    <Input
                      value={org.secondary_color}
                      onChange={(e) => setOrg({ ...org, secondary_color: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={org.logo_url || ''}
                  onChange={(e) => setOrg({ ...org, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="h-11"
                />
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">Preview</p>
                <div
                  className="h-12 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: org.primary_color }}
                >
                  {org.short_name}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evp">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">EVP/CPD Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Hours (per period)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={org.evp_required_hours}
                    onChange={(e) =>
                      setOrg({ ...org, evp_required_hours: parseInt(e.target.value) })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={org.evp_period_months}
                    onChange={(e) =>
                      setOrg({ ...org, evp_period_months: parseInt(e.target.value) })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Membership Fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Annual Fee</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={org.membership_fee}
                    onChange={(e) =>
                      setOrg({ ...org, membership_fee: parseFloat(e.target.value) })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={org.currency}
                    onChange={(e) => setOrg({ ...org, currency: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
