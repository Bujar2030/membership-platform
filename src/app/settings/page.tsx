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
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { THEMES, getTheme, applyTheme } from '@/lib/themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Organization } from '@/types/database';
import type { ThemeId } from '@/lib/themes';

export default function SettingsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('corporate-light');

  const fetchOrg = useCallback(async () => {
    if (!profile?.organization_id) return;
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();
    if (error) {
      toast.error('Failed to load organization settings');
      return;
    }
    setOrg(data);
    setSelectedTheme((data.theme as ThemeId) ?? 'corporate-light');
    setLoading(false);
  }, [profile?.organization_id, supabase]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const handleThemePreview = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    const theme = getTheme(themeId);
    applyTheme(theme.vars);
  };

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);

    const { error } = await supabase
      .from('organizations')
      .update({
        name: org.name,
        short_name: org.short_name,
        email: org.email,
        phone: org.phone,
        website: org.website,
        primary_color: org.primary_color,
        secondary_color: org.secondary_color,
        logo_url: org.logo_url,
        theme: selectedTheme,
        evp_required_hours: org.evp_required_hours,
        evp_period_months: org.evp_period_months,
        membership_fee: org.membership_fee,
        currency: org.currency,
      })
      .eq('id', org.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save settings. Please try again.');
      return;
    }

    setOrg({ ...org, theme: selectedTheme });
    toast.success('Settings saved successfully!');
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
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding & Theme</TabsTrigger>
          <TabsTrigger value="evp">EVP Rules</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
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
                  <Label>Short Name / Acronym</Label>
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
                    placeholder="https://example.com"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING & THEME TAB */}
        <TabsContent value="branding" className="space-y-4">
          {/* Theme Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Zgjidhni temën vizuale të platformës. Ndryshimi aplikohet menjëherë për të gjithë anëtarët.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemePreview(theme.id)}
                      className={cn(
                        'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                        isSelected
                          ? 'border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-border hover:border-muted-foreground/30'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}

                      {/* Mini Preview */}
                      <div
                        className="rounded-lg overflow-hidden mb-3 h-20 relative"
                        style={{ backgroundColor: theme.preview.bg, border: `1px solid ${theme.preview.border}` }}
                      >
                        {/* Fake Sidebar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-8 flex flex-col gap-1 p-1"
                          style={{ backgroundColor: theme.preview.primary }}
                        >
                          <div className="h-1.5 rounded-sm bg-white/30 w-full mt-1" />
                          <div className="h-1 rounded-sm bg-white/20 w-full" />
                          <div className="h-1 rounded-sm bg-white/20 w-full" />
                          <div className="h-1 rounded-sm bg-white/20 w-full" />
                        </div>
                        {/* Fake Content */}
                        <div className="ml-10 p-2 space-y-1.5">
                          <div
                            className="h-2 rounded-sm w-3/4"
                            style={{ backgroundColor: theme.preview.text, opacity: 0.7 }}
                          />
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-7 flex-1 rounded"
                                style={{ backgroundColor: theme.preview.secondary }}
                              />
                            ))}
                          </div>
                          <div
                            className="h-1.5 rounded-sm w-1/2"
                            style={{ backgroundColor: theme.preview.text, opacity: 0.3 }}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-sm">{theme.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                      </div>

                      {/* Color Dots */}
                      <div className="flex gap-1.5 mt-2">
                        <div
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: theme.preview.primary }}
                          title="Primary"
                        />
                        <div
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: theme.preview.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: theme.preview.bg }}
                          title="Background"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ngjyrat e brand-it tuaj — përdoren në raporte dhe dokumente eksportuese.
              </p>
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
                      className="h-11 font-mono"
                      maxLength={7}
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
                      className="h-11 font-mono"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: org.primary_color }}
                >
                  {org.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={org.logo_url}
                      alt="Logo"
                      className="h-16 w-16 rounded-xl object-contain"
                    />
                  ) : (
                    org.short_name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={org.logo_url || ''}
                    onChange={(e) => setOrg({ ...org, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, SVG ose WebP. Rekomandohet 200×200px ose më e madhe.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVP TAB */}
        <TabsContent value="evp">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">EVP/CPD Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Këto rregulla aplikohen automatikisht kur llogaritet compliance-i i anëtarëve.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Hours (per period)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={org.evp_required_hours}
                    onChange={(e) =>
                      setOrg({ ...org, evp_required_hours: parseInt(e.target.value) || 0 })
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Orët minimale CPD të nevojshme
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Period (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={org.evp_period_months}
                    onChange={(e) =>
                      setOrg({ ...org, evp_period_months: parseInt(e.target.value) || 12 })
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Periudha e vlerësimit (zakonisht 12 muaj)
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">Rregulla aktuale:</p>
                <p className="text-muted-foreground">
                  Anëtarët duhet të plotësojnë{' '}
                  <span className="font-semibold text-foreground">{org.evp_required_hours} orë</span>{' '}
                  CPD çdo{' '}
                  <span className="font-semibold text-foreground">{org.evp_period_months} muaj</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
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
                      setOrg({ ...org, membership_fee: parseFloat(e.target.value) || 0 })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={org.currency}
                    onChange={(e) => setOrg({ ...org, currency: e.target.value.toUpperCase() })}
                    className="h-11"
                    maxLength={3}
                    placeholder="EUR"
                  />
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">Tarifa aktuale:</p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground text-lg">
                    {org.membership_fee} {org.currency}
                  </span>{' '}
                  / vit për anëtar
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
