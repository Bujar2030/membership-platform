-- ============================================
-- MemberHub - Multi-Tenant Membership Platform
-- Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0f172a',
  secondary_color TEXT NOT NULL DEFAULT '#3b82f6',
  country TEXT NOT NULL DEFAULT 'Kosovo',
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')),
  evp_required_hours INTEGER NOT NULL DEFAULT 40,
  evp_period_months INTEGER NOT NULL DEFAULT 12,
  membership_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER PROFILES (linked to auth.users)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN (
    'platform_super_admin', 'organization_owner', 'organization_admin',
    'membership_officer', 'evp_officer', 'finance_officer', 'member', 'student'
  )),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(auth_id)
);

-- ============================================
-- MEMBERS
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  member_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL DEFAULT 'associate' CHECK (category IN ('certified', 'licensed', 'associate', 'student', 'honorary')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'suspended', 'student')),
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  membership_start TIMESTAMPTZ,
  membership_end TIMESTAMPTZ,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVP / CPD RECORDS
-- ============================================
CREATE TABLE evp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'external' CHECK (source IN ('internal', 'external')),
  category TEXT NOT NULL DEFAULT 'Other',
  hours DECIMAL(5,1) NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  certificate_url TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL,
  method TEXT CHECK (method IN ('bank_transfer', 'cash', 'card', 'online')),
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'payment', 'evp', 'membership', 'system')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_all BOOLEAN NOT NULL DEFAULT true,
  target_category TEXT,
  target_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NOTIFICATION READS
-- ============================================
CREATE TABLE notification_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_profile_id)
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PUSH SUBSCRIPTIONS
-- ============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(endpoint)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_members_org ON members(organization_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_evp_records_member ON evp_records(member_id);
CREATE INDEX idx_evp_records_org ON evp_records(organization_id);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_push_subs_user ON push_subscriptions(user_profile_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM user_profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is platform super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE auth_id = auth.uid() AND role = 'platform_super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ORGANIZATIONS policies
CREATE POLICY "Super admins can see all orgs" ON organizations FOR SELECT USING (is_super_admin());
CREATE POLICY "Users can see own org" ON organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "Org admins can update own org" ON organizations FOR UPDATE USING (
  id = get_user_org_id() AND get_user_role() IN ('organization_owner', 'organization_admin', 'platform_super_admin')
);

-- USER_PROFILES policies
CREATE POLICY "Users can see own profile" ON user_profiles FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY "Users can see org profiles" ON user_profiles FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth_id = auth.uid());
CREATE POLICY "Admins can insert profiles" ON user_profiles FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() OR is_super_admin()
);

-- MEMBERS policies
CREATE POLICY "Users can see org members" ON members FOR SELECT USING (organization_id = get_user_org_id() OR is_super_admin());
CREATE POLICY "Admins can insert members" ON members FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Admins can update members" ON members FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Admins can delete members" ON members FOR DELETE USING (organization_id = get_user_org_id());

-- EVP_RECORDS policies
CREATE POLICY "Users can see org evp" ON evp_records FOR SELECT USING (organization_id = get_user_org_id() OR is_super_admin());
CREATE POLICY "Users can insert evp" ON evp_records FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Admins can update evp" ON evp_records FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Admins can delete evp" ON evp_records FOR DELETE USING (organization_id = get_user_org_id());

-- PAYMENTS policies
CREATE POLICY "Users can see org payments" ON payments FOR SELECT USING (organization_id = get_user_org_id() OR is_super_admin());
CREATE POLICY "Admins can insert payments" ON payments FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Admins can update payments" ON payments FOR UPDATE USING (organization_id = get_user_org_id());

-- NOTIFICATIONS policies
CREATE POLICY "Users can see org notifications" ON notifications FOR SELECT USING (organization_id = get_user_org_id() OR is_super_admin());
CREATE POLICY "Admins can insert notifications" ON notifications FOR INSERT WITH CHECK (organization_id = get_user_org_id());

-- NOTIFICATION_READS policies
CREATE POLICY "Users can see own reads" ON notification_reads FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY "Users can insert reads" ON notification_reads FOR INSERT WITH CHECK (user_profile_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

-- AUDIT_LOGS policies
CREATE POLICY "Admins can see org logs" ON audit_logs FOR SELECT USING (organization_id = get_user_org_id() OR is_super_admin());
CREATE POLICY "System can insert logs" ON audit_logs FOR INSERT WITH CHECK (organization_id = get_user_org_id());

-- PUSH_SUBSCRIPTIONS policies
CREATE POLICY "Users can see own subs" ON push_subscriptions FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY "Users can insert subs" ON push_subscriptions FOR INSERT WITH CHECK (user_profile_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));
CREATE POLICY "Users can delete subs" ON push_subscriptions FOR DELETE USING (user_profile_id IN (SELECT id FROM user_profiles WHERE auth_id = auth.uid()));

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get or create a default org (IKAF for demo)
  SELECT id INTO default_org_id FROM organizations WHERE short_name = 'IKAF' LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name, short_name, email, country)
    VALUES ('Institute of Certified Accountants of Kosovo', 'IKAF', 'info@ikaf-ks.org', 'Kosovo')
    RETURNING id INTO default_org_id;
  END IF;

  INSERT INTO user_profiles (auth_id, organization_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    default_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'member'
  );

  -- Create a member record linked to the user profile
  INSERT INTO members (organization_id, user_profile_id, member_number, first_name, last_name, email, status)
  VALUES (
    default_org_id,
    (SELECT id FROM user_profiles WHERE auth_id = NEW.id),
    'MBR-' || UPPER(SUBSTR(MD5(NEW.id::text), 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_evp_records_updated_at BEFORE UPDATE ON evp_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA (IKAF Demo Organization)
-- ============================================
INSERT INTO organizations (name, short_name, email, country, phone, website, primary_color, secondary_color, evp_required_hours, membership_fee)
VALUES (
  'Institute of Certified Accountants of Kosovo',
  'IKAF',
  'info@ikaf-ks.org',
  'Kosovo',
  '+383 38 123 456',
  'https://ikaf-ks.org',
  '#0f172a',
  '#3b82f6',
  40,
  150.00
) ON CONFLICT DO NOTHING;
