export type UserRole = 'ADMIN' | 'DONOR' | 'REQUESTER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  isVerified: boolean;
  donorProfile?: DonorProfile | null;
  requesterProfile?: RequesterProfile | null;
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
  patientReference?: string;
  requesterId?: string;
  requesterName?: string;
  contactPhone?: string;
  bloodGroup: string;
  unitsRequired: number;
  hospital: string;
  province: string;
  district: string;
  city: string;
  requiredDate: string;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  additionalNotes?: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'FULFILLED' | 'REJECTED' | 'CANCELLED';
  verifiedAt?: string;
  createdAt: string;
}

export interface DonorSearchResult {
  id: string;
  displayName: string;
  bloodGroup: string;
  province: string;
  district: string;
  city: string;
  isAvailable: boolean;
  isVerified: boolean;
  lastDonationDate: string | null;
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

export interface SystemStats {
  totalUsers: number;
  registeredDonors: number;
  verifiedDonors: number;
  availableDonors: number;
  totalRequests: number;
  activeRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  totalAppointments: number;
  pendingAppointments: number;
  activeCampaigns: number;
  unreadMessages: number;
}
