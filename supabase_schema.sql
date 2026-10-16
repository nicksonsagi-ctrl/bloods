-- ====================================================================
-- LifeLink Sri Lanka - Supabase Database Schema
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'DONOR', 'REQUESTER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Donor Profiles Table
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  dob TEXT,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  last_donation_date TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  contact_preferences TEXT DEFAULT 'CALL_AND_SMS',
  consent_given BOOLEAN NOT NULL DEFAULT true,
  verified_at TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Requester Profiles Table
CREATE TABLE IF NOT EXISTS public.requester_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Blood Requests Table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id TEXT PRIMARY KEY,
  patient_reference TEXT,
  requester_id TEXT,
  requester_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_required INTEGER NOT NULL DEFAULT 1,
  hospital TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  required_date TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'URGENT' CHECK (urgency IN ('CRITICAL', 'URGENT', 'STANDARD')),
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING_VERIFICATION', 'ACTIVE', 'FULFILLED', 'REJECTED', 'CANCELLED')),
  verified_at TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. Donor Contact Requests
CREATE TABLE IF NOT EXISTS public.donor_contact_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  donor_id TEXT NOT NULL,
  blood_request_id TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  response_note TEXT,
  responded_at TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Donation Appointments
CREATE TABLE IF NOT EXISTS public.donation_appointments (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  donor_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED', 'CANCELLED', 'COMPLETED')),
  reschedule_notes TEXT,
  completed_at TEXT,
  completed_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  target_units INTEGER NOT NULL DEFAULT 100,
  collected_units INTEGER NOT NULL DEFAULT 0,
  banner_url TEXT,
  organizer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. Campaign Registrations Table
CREATE TABLE IF NOT EXISTS public.campaign_registrations (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  email TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_donor_blood_group ON public.donor_profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_donor_district ON public.donor_profiles(district);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_district ON public.blood_requests(district);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requester_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for API access (protected at server layer with bcrypt & session tokens)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to users') THEN
    CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to donor_profiles') THEN
    CREATE POLICY "Allow all access to donor_profiles" ON public.donor_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to requester_profiles') THEN
    CREATE POLICY "Allow all access to requester_profiles" ON public.requester_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to blood_requests') THEN
    CREATE POLICY "Allow all access to blood_requests" ON public.blood_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to donor_contact_requests') THEN
    CREATE POLICY "Allow all access to donor_contact_requests" ON public.donor_contact_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to donation_appointments') THEN
    CREATE POLICY "Allow all access to donation_appointments" ON public.donation_appointments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to campaigns') THEN
    CREATE POLICY "Allow all access to campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to campaign_registrations') THEN
    CREATE POLICY "Allow all access to campaign_registrations" ON public.campaign_registrations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to contact_messages') THEN
    CREATE POLICY "Allow all access to contact_messages" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to audit_logs') THEN
    CREATE POLICY "Allow all access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
