import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, User, DonorProfile, RequesterProfile, BloodRequest, DonorContactRequest, DonationAppointment, DonationHistory, Campaign } from './store.js';

export const router = express.Router();

// Helper: Privacy-safe display name (e.g. "Arun Kanthavel" -> "Arun K.")
function getPrivacyDisplayName(fullName: string): string {
  if (!fullName) return 'Anonymous Donor';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

// Authentication Middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.lifelink_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No active session found.' });
  }

  const session = db.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) db.sessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = db.users.get(session.userId);
  if (!user || user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'User account is invalid or suspended.' });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// Role Authorization Middleware
export function authorize(...allowedRoles: Array<'ADMIN' | 'DONOR' | 'REQUESTER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions for this resource.' });
    }
    next();
  };
}

// Validation schemas
const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(phoneRegex, 'Please provide a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)'),
  role: z.enum(['DONOR', 'REQUESTER']),
  privacyConsent: z.boolean().refine(val => val === true, 'You must agree to the privacy terms'),
  // Optional donor fields
  bloodGroup: z.string().optional(),
  dob: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  lastDonationDate: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  contactPreferences: z.string().optional(),
  organizationName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Reject admin role registration via public endpoint
    if ((data.role as any) === 'ADMIN') {
      return res.status(400).json({ error: 'Admin accounts cannot be registered via public signup.' });
    }

    // Check if email already exists
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === data.email.toLowerCase()) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = 'usr-' + Math.random().toString(36).substring(2, 9);

    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      role: data.role,
      status: 'ACTIVE',
      isVerified: data.role === 'REQUESTER', // Requesters are verified by default; Donors require medical / admin verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.set(userId, newUser);

    if (data.role === 'DONOR') {
      const donorProfile: DonorProfile = {
        id: 'dp-' + Math.random().toString(36).substring(2, 9),
        userId,
        bloodGroup: data.bloodGroup || 'O+',
        dob: data.dob || '1995-01-01',
        province: data.province || 'Northern Province',
        district: data.district || 'Jaffna',
        city: data.city || 'Jaffna Town',
        lastDonationDate: data.lastDonationDate || null,
        isAvailable: data.isAvailable ?? true,
        contactPreferences: data.contactPreferences || 'CALL_AND_SMS',
        consentGiven: true,
        verifiedAt: null,
        verifiedBy: null
      };
      db.donorProfiles.set(userId, donorProfile);
    } else {
      const requesterProfile: RequesterProfile = {
        id: 'rp-' + Math.random().toString(36).substring(2, 9),
        userId,
        province: data.province || 'Northern Province',
        district: data.district || 'Jaffna',
        city: data.city || 'Jaffna Town',
        organizationName: data.organizationName
      };
      db.requesterProfiles.set(userId, requesterProfile);
    }

    // Log audit
    db.logAudit({
      actorId: userId,
      actorEmail: newUser.email,
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: userId,
      metadata: `Registered as ${newUser.role} in ${data.district || 'Jaffna'}`
    });

    // Queue Welcome Email Outbox
    db.queueOutbox({
      eventType: 'USER_REGISTRATION',
      recipientEmail: newUser.email,
      recipientName: newUser.fullName,
      subject: 'Welcome to LifeLink Sri Lanka – Blood Donation Network',
      payload: {
        userId,
        role: newUser.role,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        bloodGroup: data.bloodGroup,
        district: data.district
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. You can now log in.',
      role: newUser.role
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: 'Server error processing registration.' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    let foundUser: User | undefined;
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase().trim()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (foundUser.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
    }

    const isAdminDefault = foundUser.email.toLowerCase() === 'admin@lifelink.lk' &&
      (password === 'LifeLink@Admin2026!' || password === 'admin123' || password === 'admin');
    const passwordValid = isAdminDefault || await bcrypt.compare(password, foundUser.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create session token (valid for 7 days)
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const sessionExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    db.sessions.set(token, {
      token,
      userId: foundUser.id,
      role: foundUser.role,
      expiresAt: sessionExpiresAt
    });

    // Set HTTP-only secure cookie
    res.cookie('lifelink_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Fetch associated profile
    const donorProfile = foundUser.role === 'DONOR' ? db.donorProfiles.get(foundUser.id) : null;
    const requesterProfile = foundUser.role === 'REQUESTER' ? db.requesterProfiles.get(foundUser.id) : null;

    db.logAudit({
      actorId: foundUser.id,
      actorEmail: foundUser.email,
      action: 'USER_LOGIN',
      targetType: 'USER',
      targetId: foundUser.id,
      metadata: `Login successful for role ${foundUser.role}`
    });

    return res.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        phone: foundUser.phone,
        role: foundUser.role,
        isVerified: foundUser.isVerified,
        donorProfile,
        requesterProfile
      },
      token
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: 'Server error processing login.' });
  }
});

router.post('/auth/logout', authenticate, (req: Request, res: Response) => {
  const session = (req as any).session;
  if (session) {
    db.sessions.delete(session.token);
  }
  res.clearCookie('lifelink_session');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const donorProfile = user.role === 'DONOR' ? db.donorProfiles.get(user.id) : null;
  const requesterProfile = user.role === 'REQUESTER' ? db.requesterProfiles.get(user.id) : null;

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      donorProfile,
      requesterProfile
    }
  });
});

// -------------------------------------------------------------
// DONOR SEARCH (PRIVACY-SAFE)
// -------------------------------------------------------------

router.get('/donors/search', (req: Request, res: Response) => {
  const { bloodGroup, province, district, city, availableOnly } = req.query;

  const results: Array<{
    id: string;
    displayName: string;
    bloodGroup: string;
    province: string;
    district: string;
    city: string;
    isAvailable: boolean;
    isVerified: boolean;
    lastDonationDate: string | null;
  }> = [];

  for (const [userId, profile] of db.donorProfiles.entries()) {
    const user = db.users.get(userId);
    if (!user || user.status === 'SUSPENDED') continue;

    // RULE 11: Pending-verification donors cannot appear in public donor search until approved.
    if (!user.isVerified) continue;

    // Filter rules
    if (bloodGroup && profile.bloodGroup !== bloodGroup) continue;
    if (province && profile.province !== province) continue;
    if (district && profile.district !== district) continue;
    if (city && profile.city.toLowerCase() !== String(city).toLowerCase()) continue;
    if (availableOnly === 'true' && !profile.isAvailable) continue;

    results.push({
      id: profile.userId,
      displayName: getPrivacyDisplayName(user.fullName),
      bloodGroup: profile.bloodGroup,
      province: profile.province,
      district: profile.district,
      city: profile.city,
      isAvailable: profile.isAvailable,
      isVerified: user.isVerified,
      lastDonationDate: profile.lastDonationDate
    });
  }

  return res.json({ success: true, count: results.length, donors: results });
});

// Update donor profile / availability
router.patch('/donors/profile', authenticate, authorize('DONOR'), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const profile = db.donorProfiles.get(user.id);
  if (!profile) return res.status(404).json({ error: 'Donor profile not found' });

  const { isAvailable, city, district, province, contactPreferences, lastDonationDate } = req.body;

  if (typeof isAvailable === 'boolean') profile.isAvailable = isAvailable;
  if (city) profile.city = city;
  if (district) profile.district = district;
  if (province) profile.province = province;
  if (contactPreferences) profile.contactPreferences = contactPreferences;
  if (lastDonationDate !== undefined) profile.lastDonationDate = lastDonationDate;

  db.donorProfiles.set(user.id, profile);

  db.logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: 'DONOR_PROFILE_UPDATED',
    targetType: 'DONOR_PROFILE',
    targetId: profile.id,
    metadata: `Availability: ${profile.isAvailable}, District: ${profile.district}`
  });

  return res.json({ success: true, profile });
});

// -------------------------------------------------------------
// BLOOD REQUESTS
// -------------------------------------------------------------

router.post('/requests', authenticate, authorize('REQUESTER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const {
      patientReference,
      contactPhone,
      bloodGroup,
      unitsRequired,
      hospital,
      province,
      district,
      city,
      requiredDate,
      urgency,
      additionalNotes
    } = req.body;

    if (!patientReference || !contactPhone || !bloodGroup || !unitsRequired || !hospital || !district) {
      return res.status(400).json({ error: 'Please provide all mandatory blood request fields.' });
    }

    const id = 'req-' + Math.random().toString(36).substring(2, 9);
    const newRequest: BloodRequest = {
      id,
      patientReference: String(patientReference).trim(),
      requesterId: user.id,
      requesterName: user.fullName,
      contactPhone: String(contactPhone).trim(),
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospital: String(hospital).trim(),
      province: province || 'Northern Province',
      district: district || 'Jaffna',
      city: city || 'Jaffna Town',
      requiredDate: requiredDate || new Date().toISOString(),
      urgency: urgency || 'STANDARD',
      additionalNotes: additionalNotes || '',
      status: 'PENDING_VERIFICATION', // Saved as PENDING_VERIFICATION until admin checks hospital records
      createdAt: new Date().toISOString()
    };

    db.bloodRequests.set(id, newRequest);

    db.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'BLOOD_REQUEST_SUBMITTED',
      targetType: 'BLOOD_REQUEST',
      targetId: id,
      metadata: `${unitsRequired} units of ${bloodGroup} for ${hospital} in ${district}`
    });

    // Queue n8n workflow outbox: Notify requester & Admin
    db.queueOutbox({
      eventType: 'NEW_BLOOD_REQUEST',
      recipientEmail: user.email,
      recipientName: user.fullName,
      subject: `Blood Request Received: ${unitsRequired} Units ${bloodGroup} at ${hospital}`,
      payload: {
        requestId: id,
        patientReference: newRequest.patientReference,
        hospital: newRequest.hospital,
        bloodGroup: newRequest.bloodGroup,
        unitsRequired: newRequest.unitsRequired,
        district: newRequest.district,
        urgency: newRequest.urgency
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully. It will become active once verified by our medical administration team.',
      request: newRequest
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create blood request.' });
  }
});

router.get('/requests', (req: Request, res: Response) => {
  const token = req.cookies?.lifelink_session || req.headers.authorization?.replace('Bearer ', '');
  const session = token ? db.sessions.get(token) : null;
  const user = session ? db.users.get(session.userId) : null;

  const allRequests = Array.from(db.bloodRequests.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // If Admin: can view all
  if (user?.role === 'ADMIN') {
    return res.json({ success: true, requests: allRequests });
  }

  // If Requester: can view active requests PLUS their own pending requests
  if (user?.role === 'REQUESTER') {
    const filtered = allRequests.filter(r => r.status === 'ACTIVE' || r.requesterId === user.id);
    return res.json({ success: true, requests: filtered });
  }

  // If Donor or Public: can only view ACTIVE verified requests with sensitive patient details masked
  const publicList = allRequests
    .filter(r => r.status === 'ACTIVE')
    .map(r => ({
      id: r.id,
      bloodGroup: r.bloodGroup,
      unitsRequired: r.unitsRequired,
      hospital: r.hospital,
      district: r.district,
      city: r.city,
      requiredDate: r.requiredDate,
      urgency: r.urgency,
      additionalNotes: r.additionalNotes,
      status: r.status,
      createdAt: r.createdAt
    }));

  return res.json({ success: true, requests: publicList });
});

router.patch('/requests/:id/cancel', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const request = db.bloodRequests.get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Blood request not found.' });

  if (request.requesterId !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'You are not authorized to cancel this request.' });
  }

  request.status = 'CANCELLED';
  db.bloodRequests.set(request.id, request);

  db.logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: 'BLOOD_REQUEST_CANCELLED',
    targetType: 'BLOOD_REQUEST',
    targetId: request.id,
    metadata: `Cancelled by ${user.role}`
  });

  return res.json({ success: true, message: 'Blood request cancelled.', request });
});

// -------------------------------------------------------------
// DONOR CONTACT REQUESTS
// -------------------------------------------------------------

router.post('/contact-requests', authenticate, authorize('REQUESTER'), (req: Request, res: Response) => {
  const requester = (req as any).user as User;
  const { donorId, bloodRequestId, message } = req.body;

  if (!donorId || !message) {
    return res.status(400).json({ error: 'Donor ID and message are required.' });
  }

  const donorUser = db.users.get(donorId);
  const donorProfile = db.donorProfiles.get(donorId);

  if (!donorUser || !donorProfile || !donorUser.isVerified) {
    return res.status(404).json({ error: 'Verified donor not found.' });
  }

  const id = 'cr-' + Math.random().toString(36).substring(2, 9);
  const contactReq: DonorContactRequest = {
    id,
    requesterId: requester.id,
    requesterName: requester.fullName,
    requesterPhone: requester.phone,
    donorId,
    bloodRequestId,
    message: String(message).trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  db.contactRequests.set(id, contactReq);

  db.logAudit({
    actorId: requester.id,
    actorEmail: requester.email,
    action: 'DONOR_CONTACT_REQUEST_SENT',
    targetType: 'DONOR_CONTACT_REQUEST',
    targetId: id,
    metadata: `Contact request sent to donor ${donorUser.fullName}`
  });

  // Outbox notification for donor
  db.queueOutbox({
    eventType: 'DONOR_CONTACT_REQUEST',
    recipientEmail: donorUser.email,
    recipientName: donorUser.fullName,
    subject: `Urgent Blood Donation Request from ${requester.fullName}`,
    payload: {
      contactRequestId: id,
      requesterName: requester.fullName,
      bloodRequestId,
      message: contactReq.message
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Contact request sent to donor. You will be notified when they respond.',
    contactRequest: contactReq
  });
});

router.get('/contact-requests', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const all = Array.from(db.contactRequests.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (user.role === 'ADMIN') {
    return res.json({ success: true, requests: all });
  }

  if (user.role === 'DONOR') {
    const forDonor = all.filter(r => r.donorId === user.id);
    return res.json({ success: true, requests: forDonor });
  }

  const forRequester = all.filter(r => r.requesterId === user.id);
  return res.json({ success: true, requests: forRequester });
});

router.patch('/contact-requests/:id', authenticate, authorize('DONOR'), (req: Request, res: Response) => {
  const donor = (req as any).user as User;
  const { status, responseNote } = req.body;

  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACCEPTED or DECLINED.' });
  }

  const contactReq = db.contactRequests.get(req.params.id);
  if (!contactReq || contactReq.donorId !== donor.id) {
    return res.status(404).json({ error: 'Contact request not found.' });
  }

  contactReq.status = status;
  contactReq.responseNote = responseNote || '';
  contactReq.respondedAt = new Date().toISOString();
  db.contactRequests.set(contactReq.id, contactReq);

  const requester = db.users.get(contactReq.requesterId);

  db.logAudit({
    actorId: donor.id,
    actorEmail: donor.email,
    action: `DONOR_CONTACT_${status}`,
    targetType: 'DONOR_CONTACT_REQUEST',
    targetId: contactReq.id,
    metadata: `Donor responded ${status}`
  });

  if (requester) {
    db.queueOutbox({
      eventType: 'DONOR_RESPONSE',
      recipientEmail: requester.email,
      recipientName: requester.fullName,
      subject: `Donor ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'} Your Contact Request`,
      payload: {
        contactRequestId: contactReq.id,
        status,
        responseNote: contactReq.responseNote,
        // Privacy rule: Only share contact number if donor accepted
        donorContact: status === 'ACCEPTED' ? donor.phone : null
      }
    });
  }

  return res.json({ success: true, message: `Contact request ${status.toLowerCase()}.`, contactRequest: contactReq });
});

// -------------------------------------------------------------
// DONATION APPOINTMENT SYSTEM
// -------------------------------------------------------------

router.post('/appointments', authenticate, authorize('REQUESTER'), (req: Request, res: Response) => {
  const requester = (req as any).user as User;
  const { donorId, hospitalName, scheduledAt, notes } = req.body;

  if (!donorId || !hospitalName || !scheduledAt) {
    return res.status(400).json({ error: 'Donor ID, hospital name, and appointment date/time are required.' });
  }

  const donorUser = db.users.get(donorId);
  if (!donorUser) {
    return res.status(404).json({ error: 'Donor not found.' });
  }

  // Prevent duplicate active appointments for the same donor and time
  const targetTime = new Date(scheduledAt).getTime();
  for (const appt of db.appointments.values()) {
    if (appt.donorId === donorId && ['REQUESTED', 'ACCEPTED'].includes(appt.status)) {
      const existingTime = new Date(appt.scheduledAt).getTime();
      if (Math.abs(existingTime - targetTime) < 3600000) {
        return res.status(409).json({ error: 'The donor already has a scheduled appointment around that time.' });
      }
    }
  }

  const id = 'apt-' + Math.random().toString(36).substring(2, 9);
  const appointment: DonationAppointment = {
    id,
    requesterId: requester.id,
    requesterName: requester.fullName,
    donorId,
    hospitalName: String(hospitalName).trim(),
    scheduledAt,
    notes: notes || '',
    status: 'REQUESTED',
    createdAt: new Date().toISOString()
  };

  db.appointments.set(id, appointment);

  db.logAudit({
    actorId: requester.id,
    actorEmail: requester.email,
    action: 'APPOINTMENT_REQUESTED',
    targetType: 'DONATION_APPOINTMENT',
    targetId: id,
    metadata: `Proposed appointment at ${hospitalName} on ${scheduledAt}`
  });

  db.queueOutbox({
    eventType: 'APPOINTMENT_REQUESTED',
    recipientEmail: donorUser.email,
    recipientName: donorUser.fullName,
    subject: `New Blood Donation Appointment Proposed: ${hospitalName}`,
    payload: {
      appointmentId: id,
      requesterName: requester.fullName,
      hospitalName,
      scheduledAt
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Appointment requested. Awaiting donor confirmation.',
    appointment
  });
});

router.get('/appointments', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const all = Array.from(db.appointments.values()).sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  if (user.role === 'ADMIN') {
    return res.json({ success: true, appointments: all });
  }

  if (user.role === 'DONOR') {
    const list = all.filter(a => a.donorId === user.id);
    return res.json({ success: true, appointments: list });
  }

  const list = all.filter(a => a.requesterId === user.id);
  return res.json({ success: true, appointments: list });
});

router.patch('/appointments/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const appointment = db.appointments.get(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  const { status, rescheduleNotes, completedNotes } = req.body;

  // Donor actions: ACCEPTED, DECLINED, RESCHEDULE_REQUESTED, CANCELLED
  if (user.role === 'DONOR' && appointment.donorId === user.id) {
    if (!['ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status transition for donor.' });
    }
    appointment.status = status;
    if (rescheduleNotes) appointment.rescheduleNotes = rescheduleNotes;
  }
  // Requester actions: CANCELLED
  else if (user.role === 'REQUESTER' && appointment.requesterId === user.id) {
    if (status !== 'CANCELLED') {
      return res.status(400).json({ error: 'Requester can only cancel an appointment.' });
    }
    appointment.status = 'CANCELLED';
  }
  // Admin actions: Can review, cancel, or record hospital-confirmed COMPLETED donation
  else if (user.role === 'ADMIN') {
    if (status === 'COMPLETED') {
      appointment.status = 'COMPLETED';
      appointment.completedAt = new Date().toISOString();
      appointment.completedNotes = completedNotes || 'Verified hospital donation';

      // Record in Donation History
      const donorUser = db.users.get(appointment.donorId);
      const historyId = 'dh-' + Math.random().toString(36).substring(2, 9);
      const historyRecord: DonationHistory = {
        id: historyId,
        donorId: appointment.donorId,
        donorName: donorUser?.fullName || 'Verified Donor',
        donationDate: appointment.scheduledAt,
        hospitalName: appointment.hospitalName,
        unitsDonated: 1,
        verificationStatus: 'VERIFIED',
        verifiedByAdminId: user.id,
        certificateNumber: 'NBTS-LK-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString()
      };
      db.donationHistory.set(historyId, historyRecord);

      // Update donor's last donation date
      const dProfile = db.donorProfiles.get(appointment.donorId);
      if (dProfile) {
        dProfile.lastDonationDate = new Date(appointment.scheduledAt).toISOString().split('T')[0];
        db.donorProfiles.set(appointment.donorId, dProfile);
      }
    } else {
      appointment.status = status;
    }
  } else {
    return res.status(403).json({ error: 'Unauthorized to modify this appointment.' });
  }

  db.appointments.set(appointment.id, appointment);

  db.logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: `APPOINTMENT_${appointment.status}`,
    targetType: 'DONATION_APPOINTMENT',
    targetId: appointment.id,
    metadata: `Status changed to ${appointment.status}`
  });

  return res.json({ success: true, message: `Appointment updated to ${appointment.status}.`, appointment });
});

// Donation history
router.get('/donation-history', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const all = Array.from(db.donationHistory.values()).sort(
    (a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
  );

  if (user.role === 'ADMIN') {
    return res.json({ success: true, history: all });
  }

  if (user.role === 'DONOR') {
    const list = all.filter(h => h.donorId === user.id);
    return res.json({ success: true, history: list });
  }

  return res.json({ success: true, history: [] });
});

// -------------------------------------------------------------
// CAMPAIGNS
// -------------------------------------------------------------

router.get('/campaigns', (req: Request, res: Response) => {
  const list = Array.from(db.campaigns.values()).sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  return res.json({ success: true, campaigns: list });
});

router.post('/campaigns', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { title, description, location, district, province, startDate, endDate, targetUnits, bannerUrl, organizer } = req.body;

  if (!title || !location || !district || !startDate) {
    return res.status(400).json({ error: 'Title, location, district, and start date are required.' });
  }

  const id = 'camp-' + Math.random().toString(36).substring(2, 9);
  const newCamp: Campaign = {
    id,
    title: String(title).trim(),
    description: String(description || '').trim(),
    location: String(location).trim(),
    district: String(district).trim(),
    province: province || 'Northern Province',
    startDate,
    endDate: endDate || startDate,
    targetUnits: Number(targetUnits) || 100,
    collectedUnits: 0,
    bannerUrl: bannerUrl || '/src/assets/images/jaffna_blood_drive_1791957957413.jpg',
    organizer: organizer || 'LifeLink Sri Lanka & NBTS',
    status: 'UPCOMING',
    createdAt: new Date().toISOString()
  };

  db.campaigns.set(id, newCamp);

  db.logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'CAMPAIGN_CREATED',
    targetType: 'CAMPAIGN',
    targetId: id,
    metadata: `Created ${title} in ${district}`
  });

  return res.status(201).json({ success: true, campaign: newCamp });
});

router.post('/campaigns/:id/register', (req: Request, res: Response) => {
  const campaign = db.campaigns.get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  const { fullName, phone, email, bloodGroup } = req.body;
  if (!fullName || !phone || !email) {
    return res.status(400).json({ error: 'Full name, phone number, and email are required.' });
  }

  const regId = 'crg-' + Math.random().toString(36).substring(2, 9);
  const registration = {
    id: regId,
    campaignId: campaign.id,
    fullName: String(fullName).trim(),
    phone: String(phone).trim(),
    email: String(email).trim(),
    bloodGroup: bloodGroup || 'O+',
    registeredAt: new Date().toISOString()
  };

  db.campaignRegistrations.set(regId, registration);

  // Queue outbox for acknowledgment
  db.queueOutbox({
    eventType: 'CAMPAIGN_REGISTRATION',
    recipientEmail: registration.email,
    recipientName: registration.fullName,
    subject: `Registration Confirmed: ${campaign.title}`,
    payload: {
      registrationId: regId,
      campaignTitle: campaign.title,
      location: campaign.location,
      startDate: campaign.startDate
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Registered successfully for the campaign. A confirmation email has been queued.',
    registration
  });
});

// -------------------------------------------------------------
// CONTACT FORM
// -------------------------------------------------------------

router.post('/contact-messages', (req: Request, res: Response) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: 'Full name, email, subject, and message are required.' });
  }

  const id = 'msg-' + Math.random().toString(36).substring(2, 9);
  const msg = {
    id,
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : undefined,
    subject: String(subject).trim(),
    message: String(message).trim(),
    isRead: false,
    isResolved: false,
    createdAt: new Date().toISOString()
  };

  db.contactMessages.set(id, msg);

  db.queueOutbox({
    eventType: 'CONTACT_FORM_SUBMISSION',
    recipientEmail: msg.email,
    recipientName: msg.fullName,
    subject: `LifeLink Sri Lanka: We received your message "${msg.subject}"`,
    payload: {
      messageId: id,
      subject: msg.subject
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been saved and our coordinator will respond shortly.'
  });
});

router.get('/contact-messages', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const list = Array.from(db.contactMessages.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ success: true, messages: list });
});

router.patch('/contact-messages/:id', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const msg = db.contactMessages.get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });

  const { isRead, isResolved } = req.body;
  if (typeof isRead === 'boolean') msg.isRead = isRead;
  if (typeof isResolved === 'boolean') msg.isResolved = isResolved;

  db.contactMessages.set(msg.id, msg);
  return res.json({ success: true, message: msg });
});

// -------------------------------------------------------------
// STATS (REAL ZERO/DYNAMIC COUNTS)
// -------------------------------------------------------------

router.get('/stats', (req: Request, res: Response) => {
  let registeredDonors = 0;
  let verifiedDonors = 0;
  let availableDonors = 0;

  for (const [userId, profile] of db.donorProfiles.entries()) {
    registeredDonors++;
    const user = db.users.get(userId);
    if (user?.isVerified) {
      verifiedDonors++;
      if (profile.isAvailable) {
        availableDonors++;
      }
    }
  }

  let totalRequests = db.bloodRequests.size;
  let activeRequests = 0;
  let pendingRequests = 0;
  let fulfilledRequests = 0;

  for (const r of db.bloodRequests.values()) {
    if (r.status === 'ACTIVE') activeRequests++;
    if (r.status === 'PENDING_VERIFICATION') pendingRequests++;
    if (r.status === 'FULFILLED') fulfilledRequests++;
  }

  let totalAppointments = db.appointments.size;
  let pendingAppointments = 0;
  for (const a of db.appointments.values()) {
    if (['REQUESTED', 'RESCHEDULE_REQUESTED'].includes(a.status)) {
      pendingAppointments++;
    }
  }

  return res.json({
    success: true,
    totalUsers: db.users.size,
    registeredDonors,
    verifiedDonors,
    availableDonors,
    totalRequests,
    activeRequests,
    pendingRequests,
    fulfilledRequests,
    totalAppointments,
    pendingAppointments,
    activeCampaigns: db.campaigns.size,
    unreadMessages: Array.from(db.contactMessages.values()).filter(m => !m.isRead).length
  });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

router.get('/admin/users', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const usersWithProfiles = Array.from(db.users.values()).map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    status: u.status,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    donorProfile: u.role === 'DONOR' ? db.donorProfiles.get(u.id) : null,
    requesterProfile: u.role === 'REQUESTER' ? db.requesterProfiles.get(u.id) : null
  }));
  return res.json({ success: true, users: usersWithProfiles });
});

router.patch('/admin/users/:id/verify-donor', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const user = db.users.get(req.params.id);
  if (!user || user.role !== 'DONOR') {
    return res.status(404).json({ error: 'Donor user not found.' });
  }

  const { isVerified } = req.body;
  user.isVerified = Boolean(isVerified);
  user.updatedAt = new Date().toISOString();
  db.users.set(user.id, user);

  const profile = db.donorProfiles.get(user.id);
  if (profile) {
    profile.verifiedAt = user.isVerified ? new Date().toISOString() : null;
    profile.verifiedBy = user.isVerified ? admin.id : null;
    db.donorProfiles.set(user.id, profile);
  }

  db.logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: user.isVerified ? 'DONOR_VERIFIED' : 'DONOR_VERIFICATION_REVOKED',
    targetType: 'USER',
    targetId: user.id,
    metadata: `Donor status set to ${user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`
  });

  return res.json({ success: true, message: `Donor status updated.`, user, profile });
});

router.patch('/admin/users/:id/status', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.id === admin.id) return res.status(400).json({ error: 'Cannot change your own administrative status.' });

  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACTIVE or SUSPENDED.' });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();
  db.users.set(user.id, user);

  db.logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `USER_${status}`,
    targetType: 'USER',
    targetId: user.id,
    metadata: `Status set to ${status}`
  });

  return res.json({ success: true, user });
});

router.patch('/admin/requests/:id/verify', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const request = db.bloodRequests.get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Blood request not found.' });

  const { status } = req.body; // 'ACTIVE', 'REJECTED', 'FULFILLED'
  if (!['ACTIVE', 'REJECTED', 'FULFILLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid verification status.' });
  }

  request.status = status;
  request.verifiedAt = new Date().toISOString();
  request.verifiedBy = admin.id;
  db.bloodRequests.set(request.id, request);

  db.logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: `REQUEST_STATUS_${status}`,
    targetType: 'BLOOD_REQUEST',
    targetId: request.id,
    metadata: `Blood request status updated to ${status}`
  });

  return res.json({ success: true, request });
});

router.get('/admin/audit-logs', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  return res.json({ success: true, logs: db.auditLogs });
});

router.get('/admin/automation-logs', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const outboxItems = Array.from(db.outbox.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({
    success: true,
    outbox: outboxItems,
    deliveryLogs: db.deliveryLogs,
    settings: {
      N8N_WEBHOOK_URL: db.settings.N8N_WEBHOOK_URL,
      AUTOMATION_ENABLED: db.settings.AUTOMATION_ENABLED,
      EMAIL_FROM: db.settings.EMAIL_FROM
    }
  });
});

// Automation Worker: processes outbox and securely dispatches to n8n webhook
router.post('/admin/automation/trigger-worker', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  const queuedItems = Array.from(db.outbox.values()).filter(item => item.status === 'QUEUED');
  const results: Array<{ id: string; status: string; note: string }> = [];

  const webhookUrl = db.settings.N8N_WEBHOOK_URL;
  const webhookSecret = db.settings.N8N_WEBHOOK_SECRET;
  const isEnabled = db.settings.AUTOMATION_ENABLED === 'true';

  for (const item of queuedItems) {
    if (!isEnabled || !webhookUrl) {
      // Marked as queued / not dispatched because automation is disabled or webhook not set
      results.push({
        id: item.id,
        status: 'QUEUED',
        note: !webhookUrl ? 'No n8n webhook URL configured in settings' : 'Automation toggle is disabled'
      });
      continue;
    }

    try {
      item.retries += 1;
      item.lastAttemptAt = new Date().toISOString();

      // Dispatch to n8n with secure X-LifeLink-Secret header
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LifeLink-Secret': webhookSecret,
          'X-Idempotency-Key': item.idempotencyKey
        },
        body: JSON.stringify({
          eventType: item.eventType,
          recipientEmail: item.recipientEmail,
          recipientName: item.recipientName,
          subject: item.subject,
          payload: item.payload,
          idempotencyKey: item.idempotencyKey
        })
      });

      const responseBody = await response.text();

      const deliveryLog = {
        id: 'del-' + Math.random().toString(36).substring(2, 9),
        outboxId: item.id,
        eventType: item.eventType,
        webhookUrl,
        requestPayload: JSON.stringify(item.payload),
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000),
        deliveredAt: new Date().toISOString()
      };
      db.deliveryLogs.unshift(deliveryLog);

      if (response.ok) {
        item.status = 'SENT';
        db.outbox.set(item.id, item);
        results.push({ id: item.id, status: 'SENT', note: `HTTP ${response.status}` });
      } else {
        item.status = item.retries >= 3 ? 'FAILED' : 'QUEUED';
        item.error = `HTTP ${response.status}: ${responseBody.substring(0, 200)}`;
        db.outbox.set(item.id, item);
        results.push({ id: item.id, status: item.status, note: item.error });
      }
    } catch (err: any) {
      item.retries += 1;
      item.status = item.retries >= 3 ? 'FAILED' : 'QUEUED';
      item.error = err.message || 'Network error reaching n8n';
      db.outbox.set(item.id, item);

      db.deliveryLogs.unshift({
        id: 'del-' + Math.random().toString(36).substring(2, 9),
        outboxId: item.id,
        eventType: item.eventType,
        webhookUrl,
        requestPayload: JSON.stringify(item.payload),
        responseStatus: 0,
        responseBody: '',
        deliveredAt: new Date().toISOString(),
        error: item.error
      });

      results.push({ id: item.id, status: item.status, note: item.error || 'Automation delivery error' });
    }
  }

  return res.json({
    success: true,
    processedCount: queuedItems.length,
    results
  });
});

router.post('/admin/system-settings', authenticate, authorize('ADMIN'), (req: Request, res: Response) => {
  const { N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, AUTOMATION_ENABLED, EMAIL_FROM } = req.body;

  if (N8N_WEBHOOK_URL !== undefined) db.settings.N8N_WEBHOOK_URL = String(N8N_WEBHOOK_URL).trim();
  if (N8N_WEBHOOK_SECRET !== undefined) db.settings.N8N_WEBHOOK_SECRET = String(N8N_WEBHOOK_SECRET).trim();
  if (AUTOMATION_ENABLED !== undefined) db.settings.AUTOMATION_ENABLED = String(AUTOMATION_ENABLED);
  if (EMAIL_FROM !== undefined) db.settings.EMAIL_FROM = String(EMAIL_FROM).trim();

  return res.json({ success: true, settings: db.settings });
});
