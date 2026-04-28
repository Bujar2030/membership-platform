import type { UserRole, MemberCategory, MemberStatus, EVPSource, PaymentMethod, NotificationType, NotificationPriority } from '@/types/database';

export const ROLES: { value: UserRole; label: string }[] = [
  { value: 'platform_super_admin', label: 'Platform Super Admin' },
  { value: 'organization_owner', label: 'Organization Owner' },
  { value: 'organization_admin', label: 'Organization Admin' },
  { value: 'membership_officer', label: 'Membership Officer' },
  { value: 'evp_officer', label: 'EVP Officer' },
  { value: 'finance_officer', label: 'Finance Officer' },
  { value: 'member', label: 'Member' },
  { value: 'student', label: 'Student' },
];

export const ADMIN_ROLES: UserRole[] = [
  'platform_super_admin',
  'organization_owner',
  'organization_admin',
  'membership_officer',
  'evp_officer',
  'finance_officer',
];

export const MEMBER_CATEGORIES: { value: MemberCategory; label: string }[] = [
  { value: 'certified', label: 'Certified' },
  { value: 'licensed', label: 'Licensed' },
  { value: 'associate', label: 'Associate' },
  { value: 'student', label: 'Student' },
  { value: 'honorary', label: 'Honorary' },
];

export const MEMBER_STATUSES: { value: MemberStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'student', label: 'Student' },
];

export const EVP_SOURCES: { value: EVPSource; label: string }[] = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'online', label: 'Online' },
];

export const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'payment', label: 'Payment' },
  { value: 'evp', label: 'EVP/CPD' },
  { value: 'membership', label: 'Membership' },
  { value: 'system', label: 'System' },
];

export const NOTIFICATION_PRIORITIES: { value: NotificationPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-gray-800',
  student: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  compliant: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  'non-compliant': 'bg-red-100 text-red-800',
};
