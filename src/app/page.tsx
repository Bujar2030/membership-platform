'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Users,
  GraduationCap,
  CreditCard,
  Bell,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Track and manage all members with detailed profiles, categories, and statuses.',
  },
  {
    icon: GraduationCap,
    title: 'EVP/CPD Tracking',
    description: 'Monitor continuing professional development hours and compliance.',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Annual fee management with automatic status updates.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'In-app and push notifications targeted by member category or status.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant',
    description: 'Each organization has its own data, admins, and branding.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First PWA',
    description: 'Install as an app on any device. Works offline.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MemberHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 md:py-24 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Membership Management
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          A modern platform for professional organizations to manage members,
          track EVP/CPD compliance, handle payments, and send targeted notifications.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto h-12 text-base px-8">
              Start Free
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 text-base px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Set up your organization in minutes.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="w-full h-12 text-base">
              Create Your Organization
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MemberHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
