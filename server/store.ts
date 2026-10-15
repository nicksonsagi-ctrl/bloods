import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: 'ADMIN' | 'DONOR' | 'REQUESTER';
  status: 'ACTIVE' | 'SUSPENDED';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: string;
  dob: string;
  province: string;
  district: string;
  city: string;
  lastDonationDate: string | null;
  isAvailable: boolean;
  contactPreferences: string;
  consentGiven: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export interface RequesterProfile {
  id: string;
  userId: string;
  province: string;
  district: string;
  city: string;
  organizationName?: string;
}

export interface BloodRequest {
  id: string;
  patientReference: string;
  requesterId: string;
  requesterName: string;
  contactPhone: string;
  bloodGroup: string;
  unitsRequired: number;
  hospital: string;
  province: string;
  district: string;
  city: string;
  requiredDate: string;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  additionalNotes: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'FULFILLED' | 'REJECTED' | 'CANCELLED';
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface DonorContactRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  donorId: string;
  bloodRequestId?: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  responseNote?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface DonationAppointment {
  id: string;
  requesterId: string;
  requesterName: string;
  donorId: string;
  hospitalName: string;
  scheduledAt: string;
  notes: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'RESCHEDULE_REQUESTED' | 'CANCELLED' | 'COMPLETED';
  rescheduleNotes?: string;
  completedAt?: string;
  completedNotes?: string;
  createdAt: string;
}

export interface DonationHistory {
  id: string;
  donorId: string;
  donorName: string;
  donationDate: string;
  hospitalName: string;
  unitsDonated: number;
  verificationStatus: 'VERIFIED' | 'PENDING';
  verifiedByAdminId?: string;
  certificateNumber?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  province: string;
  startDate: string;
  endDate: string;
  targetUnits: number;
  collectedUnits: number;
  bannerUrl: string;
  organizer: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface CampaignRegistration {
  id: string;
  campaignId: string;
  userId?: string;
  fullName: string;
  phone: string;
  bloodGroup: string;
  email: string;
  registeredAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationOutbox {
  id: string;
  eventType: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  payload: Record<string, any>;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  retries: number;
  idempotencyKey: string;
  lastAttemptAt?: string;
  error?: string;
  createdAt: string;
}

export interface AutomationDeliveryLog {
  id: string;
  outboxId: string;
  eventType: string;
  webhookUrl: string;
  requestPayload: string;
  responseStatus: number;
  responseBody: string;
  deliveredAt: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  role: 'ADMIN' | 'DONOR' | 'REQUESTER';
  expiresAt: number;
}

// In-Memory Database Engine with seed state
class DatabaseStore {
  users: Map<string, User> = new Map();
  donorProfiles: Map<string, DonorProfile> = new Map();
  requesterProfiles: Map<string, RequesterProfile> = new Map();
  bloodRequests: Map<string, BloodRequest> = new Map();
  contactRequests: Map<string, DonorContactRequest> = new Map();
  appointments: Map<string, DonationAppointment> = new Map();
  donationHistory: Map<string, DonationHistory> = new Map();
  campaigns: Map<string, Campaign> = new Map();
  campaignRegistrations: Map<string, CampaignRegistration> = new Map();
  contactMessages: Map<string, ContactMessage> = new Map();
  notifications: Map<string, Notification> = new Map();
  outbox: Map<string, NotificationOutbox> = new Map();
  deliveryLogs: AutomationDeliveryLog[] = [];
  auditLogs: AuditLog[] = [];
  sessions: Map<string, Session> = new Map();
  settings: Record<string, string> = {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || '',
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET || 'lifelink-secret-key-jaffna',
    AUTOMATION_ENABLED: process.env.AUTOMATION_ENABLED || 'false',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    SMTP_PORT: process.env.SMTP_PORT || '2525',
    EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@lifelink.lk'
  };

  private initialized = false;

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    if (this.initialized) return;
    this.initialized = true;

    // Secure default Administrator account (accepts LifeLink@Admin2026! or admin123)
    const adminPasswordHash = bcrypt.hashSync('LifeLink@Admin2026!', 10);
    const adminUser: User = {
      id: 'usr-admin-01',
      email: 'admin@lifelink.lk',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator (Jaffna Central)',
      phone: '+94 77 123 4567',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(adminUser.id, adminUser);

    // Default Verified Donor account
    const donorPasswordHash = bcrypt.hashSync('donor123', 10);
    const donorUser: User = {
      id: 'usr-donor-01',
      email: 'donor@lifelink.lk',
      passwordHash: donorPasswordHash,
      fullName: 'Kandeeban Shanmugam',
      phone: '+94 77 987 6543',
      role: 'DONOR',
      status: 'ACTIVE',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(donorUser.id, donorUser);

    const donorProfile1: DonorProfile = {
      id: 'dp-donor-01',
      userId: donorUser.id,
      bloodGroup: 'O+',
      dob: '1996-08-14',
      province: 'Northern Province',
      district: 'Jaffna',
      city: 'Nallur',
      lastDonationDate: '2026-06-10',
      isAvailable: true,
      contactPreferences: 'CALL_AND_SMS',
      consentGiven: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'usr-admin-01'
    };
    this.donorProfiles.set(donorUser.id, donorProfile1);

    // Second Verified Donor in Jaffna
    const donor2: User = {
      id: 'usr-donor-02',
      email: 'priya.donor@lifelink.lk',
      passwordHash: bcrypt.hashSync('donor123', 10),
      fullName: 'Priya Thurairajah',
      phone: '+94 71 234 5678',
      role: 'DONOR',
      status: 'ACTIVE',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(donor2.id, donor2);

    const donorProfile2: DonorProfile = {
      id: 'dp-donor-02',
      userId: donor2.id,
      bloodGroup: 'A+',
      dob: '1998-03-22',
      province: 'Northern Province',
      district: 'Jaffna',
      city: 'Jaffna Town',
      lastDonationDate: '2026-05-18',
      isAvailable: true,
      contactPreferences: 'CALL_AND_SMS',
      consentGiven: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'usr-admin-01'
    };
    this.donorProfiles.set(donor2.id, donorProfile2);

    // Default Requester account
    const requesterPasswordHash = bcrypt.hashSync('requester123', 10);
    const requesterUser: User = {
      id: 'usr-req-01',
      email: 'requester@lifelink.lk',
      passwordHash: requesterPasswordHash,
      fullName: 'Dr. S. Sivanesan (Jaffna Teaching Hospital)',
      phone: '+94 77 456 7890',
      role: 'REQUESTER',
      status: 'ACTIVE',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(requesterUser.id, requesterUser);

    const requesterProfile: RequesterProfile = {
      id: 'rp-req-01',
      userId: requesterUser.id,
      province: 'Northern Province',
      district: 'Jaffna',
      city: 'Jaffna Town',
      organizationName: 'Teaching Hospital Jaffna – Pediatric Surgical Ward'
    };
    this.requesterProfiles.set(requesterUser.id, requesterProfile);

    // Seed active verified blood requests
    const r1: BloodRequest = {
      id: 'req-jfn-01',
      patientReference: 'REF-THJ-2026-88',
      requesterId: requesterUser.id,
      requesterName: requesterUser.fullName,
      contactPhone: '+94 77 456 7890',
      bloodGroup: 'O+',
      unitsRequired: 3,
      hospital: 'Teaching Hospital Jaffna',
      province: 'Northern Province',
      district: 'Jaffna',
      city: 'Jaffna Town',
      requiredDate: '2026-10-18T10:00:00.000Z',
      urgency: 'CRITICAL',
      additionalNotes: 'Urgent requirement for scheduled cardiac surgery at Main Theater.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const r2: BloodRequest = {
      id: 'req-jfn-02',
      patientReference: 'REF-JGH-2026-14',
      requesterId: requesterUser.id,
      requesterName: requesterUser.fullName,
      contactPhone: '+94 77 456 7890',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospital: 'Chavakachcheri Base Hospital',
      province: 'Northern Province',
      district: 'Jaffna',
      city: 'Chavakachcheri',
      requiredDate: '2026-10-20T08:00:00.000Z',
      urgency: 'URGENT',
      additionalNotes: 'Post-delivery maternal transfusion support.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.bloodRequests.set(r1.id, r1);
    this.bloodRequests.set(r2.id, r2);

    // Initial campaigns in Jaffna
    const c1: Campaign = {
      id: 'camp-jaffna-01',
      title: 'Jaffna Youth Community Blood Drive',
      description: 'Organized with Teaching Hospital Jaffna Blood Bank. Safe donation beds, medical screening, and refreshment provided for all voluntary donors.',
      location: 'Kandarmadam Community Hall, Jaffna',
      district: 'Jaffna',
      province: 'Northern Province',
      startDate: '2026-11-15T09:00:00.000Z',
      endDate: '2026-11-15T16:00:00.000Z',
      targetUnits: 150,
      collectedUnits: 42,
      bannerUrl: '/src/assets/images/jaffna_blood_drive_1791957957413.jpg',
      organizer: 'Jaffna Medical Students Association & NBTS',
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    };

    const c2: Campaign = {
      id: 'camp-colombo-01',
      title: 'Narahenpita National Blood Center Camp',
      description: 'Support pediatric and surgical units across Sri Lanka with urgent O- and B+ blood replenishment drives.',
      location: 'NBTS National Blood Center, Narahenpita',
      district: 'Colombo',
      province: 'Western Province',
      startDate: '2026-11-20T08:30:00.000Z',
      endDate: '2026-11-20T17:00:00.000Z',
      targetUnits: 250,
      collectedUnits: 0,
      bannerUrl: '/src/assets/images/donor_safe_donation_1791957957842.jpg',
      organizer: 'National Blood Transfusion Service Sri Lanka',
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    };

    this.campaigns.set(c1.id, c1);
    this.campaigns.set(c2.id, c2);

    // Audit initial setup
    this.logAudit({
      actorId: 'usr-admin-01',
      actorEmail: 'admin@lifelink.lk',
      action: 'SYSTEM_BOOTSTRAP',
      targetType: 'SYSTEM',
      targetId: 'INITIAL_SETUP',
      metadata: 'System bootstrapped with default Sri Lanka administrative schema and secure admin account.'
    });
  }

  logAudit(data: Omit<AuditLog, 'id' | 'createdAt'>) {
    const log: AuditLog = {
      ...data,
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  queueOutbox(data: {
    eventType: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    payload: Record<string, any>;
  }) {
    const idempotencyKey = `${data.eventType}_${data.recipientEmail}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const outboxItem: NotificationOutbox = {
      id: 'obx-' + Math.random().toString(36).substring(2, 9),
      eventType: data.eventType,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      payload: data.payload,
      status: 'QUEUED',
      retries: 0,
      idempotencyKey,
      createdAt: new Date().toISOString()
    };
    this.outbox.set(outboxItem.id, outboxItem);
    return outboxItem;
  }
}

export const db = new DatabaseStore();
