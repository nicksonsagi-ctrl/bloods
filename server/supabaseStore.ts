import { getSupabaseClient, isSupabaseConfigured, checkSupabaseConfig } from './supabase.js';
import { db, User, DonorProfile, RequesterProfile, BloodRequest, DonorContactRequest, DonationAppointment, Campaign, CampaignRegistration, ContactMessage, AuditLog } from './store.js';

export async function initSupabaseData() {
  const config = checkSupabaseConfig();
  if (!config.isConfigured) {
    console.log(`[Supabase Info] ${config.message} Operating in-memory store mode.`);
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    console.log('[Supabase Info] Verifying Supabase connection and tables...');
    const { data: users, error: userError } = await supabase.from('users').select('*');

    if (userError) {
      if (userError.message?.toLowerCase().includes('api key') || userError.code === 'PGRST301') {
        console.log(`[Supabase Info] API key validation notice: ${userError.message}. Using resilient memory mode.`);
      } else if (userError.code === '42P01' || userError.message?.toLowerCase().includes('relation') || userError.code === 'PGRST204') {
        console.log('[Supabase Info] Supabase tables not yet initialized. Run supabase_schema.sql in Supabase SQL Editor if desired.');
      } else {
        console.log('[Supabase Info] Table status:', userError.message);
      }
      return;
    }

    if (users && users.length > 0) {
      console.log(`[Supabase] Loaded ${users.length} users from Supabase into memory cache.`);
      for (const u of users) {
        db.users.set(u.id, {
          id: u.id,
          email: u.email,
          passwordHash: u.password_hash,
          fullName: u.full_name,
          phone: u.phone,
          role: u.role,
          status: u.status,
          isVerified: u.is_verified,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
        });
      }

      // Fetch donor profiles
      const { data: donors } = await supabase.from('donor_profiles').select('*');
      if (donors) {
        for (const d of donors) {
          db.donorProfiles.set(d.user_id, {
            id: d.id,
            userId: d.user_id,
            bloodGroup: d.blood_group,
            dob: d.dob,
            province: d.province,
            district: d.district,
            city: d.city,
            lastDonationDate: d.last_donation_date,
            isAvailable: d.is_available,
            contactPreferences: d.contact_preferences,
            consentGiven: d.consent_given,
            verifiedAt: d.verified_at,
            verifiedBy: d.verified_by,
          });
        }
      }

      // Fetch requester profiles
      const { data: requesters } = await supabase.from('requester_profiles').select('*');
      if (requesters) {
        for (const r of requesters) {
          db.requesterProfiles.set(r.user_id, {
            id: r.id,
            userId: r.user_id,
            province: r.province,
            district: r.district,
            city: r.city,
            organizationName: r.organization_name,
          });
        }
      }

      // Auto-backfill missing profiles in Supabase for existing users
      for (const u of db.users.values()) {
        if (u.role === 'REQUESTER' && !db.requesterProfiles.has(u.id)) {
          const rp: RequesterProfile = {
            id: 'rp-' + u.id,
            userId: u.id,
            province: 'Northern Province',
            district: 'Jaffna',
            city: 'Jaffna Town',
            organizationName: ''
          };
          db.requesterProfiles.set(u.id, rp);
          await saveRequesterProfileToSupabase(rp);
          console.log(`[Supabase] Auto-synced missing requester profile for user: ${u.email}`);
        }
        if (u.role === 'DONOR' && !db.donorProfiles.has(u.id)) {
          const dp: DonorProfile = {
            id: 'dp-' + u.id,
            userId: u.id,
            bloodGroup: 'O+',
            dob: '1995-01-01',
            province: 'Northern Province',
            district: 'Jaffna',
            city: 'Jaffna Town',
            lastDonationDate: null,
            isAvailable: true,
            contactPreferences: 'CALL_AND_SMS',
            consentGiven: true,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'system'
          };
          db.donorProfiles.set(u.id, dp);
          await saveDonorProfileToSupabase(dp);
          console.log(`[Supabase] Auto-synced missing donor profile for user: ${u.email}`);
        }
      }

      // Fetch blood requests
      const { data: requests } = await supabase.from('blood_requests').select('*');
      if (requests) {
        for (const req of requests) {
          db.bloodRequests.set(req.id, {
            id: req.id,
            patientReference: req.patient_reference,
            requesterId: req.requester_id,
            requesterName: req.requester_name,
            contactPhone: req.contact_phone,
            bloodGroup: req.blood_group,
            unitsRequired: req.units_required,
            hospital: req.hospital,
            province: req.province,
            district: req.district,
            city: req.city,
            requiredDate: req.required_date,
            urgency: req.urgency,
            additionalNotes: req.additional_notes,
            status: req.status,
            verifiedAt: req.verified_at,
            verifiedBy: req.verified_by,
            createdAt: req.created_at,
          });
        }
      }

      // Fetch appointments
      const { data: appointments } = await supabase.from('donation_appointments').select('*');
      if (appointments) {
        for (const a of appointments) {
          db.appointments.set(a.id, {
            id: a.id,
            requesterId: a.requester_id,
            requesterName: a.requester_name,
            donorId: a.donor_id,
            hospitalName: a.hospital_name,
            scheduledAt: a.scheduled_at,
            notes: a.notes,
            status: a.status,
            rescheduleNotes: a.reschedule_notes,
            completedAt: a.completed_at,
            completedNotes: a.completed_notes,
            createdAt: a.created_at,
          });
        }
      }

      // Fetch contact requests
      const { data: contactReqs } = await supabase.from('donor_contact_requests').select('*');
      if (contactReqs) {
        for (const cr of contactReqs) {
          db.contactRequests.set(cr.id, {
            id: cr.id,
            requesterId: cr.requester_id,
            requesterName: cr.requester_name,
            requesterPhone: cr.requester_phone,
            donorId: cr.donor_id,
            bloodRequestId: cr.blood_request_id,
            message: cr.message,
            status: cr.status,
            responseNote: cr.response_note,
            respondedAt: cr.responded_at,
            createdAt: cr.created_at,
          });
        }
      }

      // Fetch campaigns
      const { data: camps } = await supabase.from('campaigns').select('*');
      if (camps && camps.length > 0) {
        for (const c of camps) {
          db.campaigns.set(c.id, {
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.location,
            district: c.district,
            province: c.province,
            startDate: c.start_date,
            endDate: c.end_date,
            targetUnits: c.target_units,
            collectedUnits: c.collected_units,
            bannerUrl: c.banner_url,
            organizer: c.organizer,
            status: c.status,
            createdAt: c.created_at,
          });
        }
      }
    } else {
      // Supabase is empty: bootstrap seed data to Supabase!
      console.log('[Supabase] Database is empty. Bootstrapping initial accounts and seed data into Supabase...');
      for (const u of db.users.values()) {
        await saveUserToSupabase(u);
      }
      for (const d of db.donorProfiles.values()) {
        await saveDonorProfileToSupabase(d);
      }
      for (const r of db.requesterProfiles.values()) {
        await saveRequesterProfileToSupabase(r);
      }
      for (const br of db.bloodRequests.values()) {
        await saveBloodRequestToSupabase(br);
      }
      for (const camp of db.campaigns.values()) {
        await saveCampaignToSupabase(camp);
      }
      console.log('[Supabase] Initial bootstrap to Supabase completed successfully!');
    }
  } catch (err: any) {
    console.error('[Supabase] Synchronization error:', err.message);
  }
}

// Save User
export async function saveUserToSupabase(user: User) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      is_verified: user.isVerified,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveUser error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveUser exception:', e.message);
  }
}

// Save Donor Profile
export async function saveDonorProfileToSupabase(profile: DonorProfile) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('donor_profiles').upsert({
      id: profile.id,
      user_id: profile.userId,
      blood_group: profile.bloodGroup,
      dob: profile.dob,
      province: profile.province,
      district: profile.district,
      city: profile.city,
      last_donation_date: profile.lastDonationDate,
      is_available: profile.isAvailable,
      contact_preferences: profile.contactPreferences,
      consent_given: profile.consentGiven,
      verified_at: profile.verifiedAt,
      verified_by: profile.verifiedBy,
    }, { onConflict: 'user_id' });
    if (error) console.error('[Supabase] saveDonorProfile error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveDonorProfile exception:', e.message);
  }
}

// Save Requester Profile
export async function saveRequesterProfileToSupabase(profile: RequesterProfile) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('requester_profiles').upsert({
      id: profile.id,
      user_id: profile.userId,
      province: profile.province,
      district: profile.district,
      city: profile.city,
      organization_name: profile.organizationName || null,
    }, { onConflict: 'user_id' });
    if (error) console.error('[Supabase] saveRequesterProfile error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveRequesterProfile exception:', e.message);
  }
}

// Save Blood Request
export async function saveBloodRequestToSupabase(request: BloodRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('blood_requests').upsert({
      id: request.id,
      patient_reference: request.patientReference,
      requester_id: request.requesterId,
      requester_name: request.requesterName,
      contact_phone: request.contactPhone,
      blood_group: request.bloodGroup,
      units_required: request.unitsRequired,
      hospital: request.hospital,
      province: request.province,
      district: request.district,
      city: request.city,
      required_date: request.requiredDate,
      urgency: request.urgency,
      additional_notes: request.additionalNotes,
      status: request.status,
      verified_at: request.verifiedAt,
      verified_by: request.verifiedBy,
      created_at: request.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveBloodRequest error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveBloodRequest exception:', e.message);
  }
}

// Save Donor Contact Request
export async function saveContactRequestToSupabase(contact: DonorContactRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('donor_contact_requests').upsert({
      id: contact.id,
      requester_id: contact.requesterId,
      requester_name: contact.requesterName,
      requester_phone: contact.requesterPhone,
      donor_id: contact.donorId,
      blood_request_id: contact.bloodRequestId,
      message: contact.message,
      status: contact.status,
      response_note: contact.responseNote,
      responded_at: contact.respondedAt,
      created_at: contact.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveContactRequest error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveContactRequest exception:', e.message);
  }
}

// Save Donation Appointment
export async function saveAppointmentToSupabase(apt: DonationAppointment) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('donation_appointments').upsert({
      id: apt.id,
      requester_id: apt.requesterId,
      requester_name: apt.requesterName,
      donor_id: apt.donorId,
      hospital_name: apt.hospitalName,
      scheduled_at: apt.scheduledAt,
      notes: apt.notes,
      status: apt.status,
      reschedule_notes: apt.rescheduleNotes,
      completed_at: apt.completedAt,
      completed_notes: apt.completedNotes,
      created_at: apt.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveAppointment error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveAppointment exception:', e.message);
  }
}

// Save Campaign
export async function saveCampaignToSupabase(c: Campaign) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('campaigns').upsert({
      id: c.id,
      title: c.title,
      description: c.description,
      location: c.location,
      district: c.district,
      province: c.province,
      start_date: c.startDate,
      end_date: c.endDate,
      target_units: c.targetUnits,
      collected_units: c.collectedUnits,
      banner_url: c.bannerUrl,
      organizer: c.organizer,
      status: c.status,
      created_at: c.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveCampaign error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveCampaign exception:', e.message);
  }
}

// Save Campaign Registration
export async function saveCampaignRegistrationToSupabase(reg: CampaignRegistration) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('campaign_registrations').upsert({
      id: reg.id,
      campaign_id: reg.campaignId,
      user_id: reg.userId,
      full_name: reg.fullName,
      phone: reg.phone,
      blood_group: reg.bloodGroup,
      email: reg.email,
      registered_at: reg.registeredAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveCampaignRegistration error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveCampaignRegistration exception:', e.message);
  }
}

// Save Contact Message
export async function saveContactMessageToSupabase(msg: ContactMessage) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('contact_messages').upsert({
      id: msg.id,
      full_name: msg.fullName,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      is_read: msg.isRead,
      is_resolved: msg.isResolved,
      created_at: msg.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveContactMessage error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveContactMessage exception:', e.message);
  }
}

// Save Audit Log
export async function saveAuditLogToSupabase(log: AuditLog) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from('audit_logs').upsert({
      id: log.id,
      actor_id: log.actorId,
      actor_email: log.actorEmail,
      action: log.action,
      target_type: log.targetType,
      target_id: log.targetId,
      metadata: log.metadata,
      ip_address: log.ipAddress,
      created_at: log.createdAt,
    }, { onConflict: 'id' });
    if (error) console.error('[Supabase] saveAuditLog error:', error.message);
  } catch (e: any) {
    console.error('[Supabase] saveAuditLog exception:', e.message);
  }
}
