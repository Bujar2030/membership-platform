export type OrganizationStatus = 'active' | 'inactive' | 'suspended';
export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';
export type MemberStatus = 'active' | 'pending' | 'expired' | 'suspended' | 'student';
export type MemberCategory = 'certified' | 'licensed' | 'associate' | 'student' | 'honorary';
export type EVPStatus = 'submitted' | 'approved' | 'rejected';
export type EVPSource = 'internal' | 'external';
export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant';
export type PaymentStatus = 'paid' | 'unpaid' | 'overdue';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'online';
export type NotificationType = 'general' | 'payment' | 'evp' | 'membership' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type UserRole = 'platform_super_admin' | 'organization_owner' | 'organization_admin' | 'membership_officer' | 'evp_officer' | 'finance_officer' | 'member' | 'student';

export interface Organization {
  id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme: string | null;
  country: string;
  email: string;
  phone: string | null;
  website: string | null;
  status: OrganizationStatus;
  subscription_plan: SubscriptionPlan;
  evp_required_hours: number;
  evp_period_months: number;
  membership_fee: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  auth_id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  organization_id: string;
  user_profile_id: string | null;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  category: MemberCategory;
  status: MemberStatus;
  registration_date: string;
  membership_start: string | null;
  membership_end: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EVPRecord {
  id: string;
  member_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  date: string;
  provider: string;
  source: EVPSource;
  category: string;
  hours: number;
  status: EVPStatus;
  certificate_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  organization_id: string;
  year: number;
  amount: number;
  currency: string;
  payment_date: string | null;
  due_date: string;
  method: PaymentMethod | null;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  sender_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  target_all: boolean;
  target_category: MemberCategory | null;
  target_status: MemberStatus | null;
  created_at: string;
}

export interface NotificationRead {
  id: string;
  notification_id: string;
  user_profile_id: string;
  read_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  user_email: string;
  action: string;
  module: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_profile_id: string;
  organization_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  expiredMembers: number;
  unpaidCount: number;
  evpNonCompliant: number;
  notificationsSent: number;
  recentPayments: number;
}

export interface MemberEVPSummary {
  required: number;
  earned: number;
  missing: number;
  compliance: ComplianceStatus;
}
