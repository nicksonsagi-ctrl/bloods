import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Droplets,
  MessageSquare,
  Calendar,
  Mail,
  Flag,
  History,
  Building2,
  Bell,
  BarChart3,
  Terminal,
  FileSpreadsheet,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { authFetch } from '../services/api.js';
import {
  SystemStats,
  User,
  BloodRequest,
  DonationAppointment,
  ContactMessage,
  Campaign,
  NotificationOutbox,
  AutomationDeliveryLog,
  AuditLog,
  DonationHistory
} from '../types/index.js';
import { SRI_LANKA_HOSPITALS, SRI_LANKA_DISTRICTS } from '../data/sriLankaData.js';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'donors' | 'users' | 'requests' | 'contacts' | 'appointments' | 'messages' | 'campaigns' | 'history' | 'hospitals' | 'notifications' | 'reports' | 'automation' | 'audit' | 'settings'
  >('overview');

  // Admin Data
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<BloodRequest[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<DonationAppointment[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [historyList, setHistoryList] = useState<DonationHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [outbox, setOutbox] = useState<NotificationOutbox[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<AutomationDeliveryLog[]>([]);

  // System Settings state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('lifelink-secret-key-jaffna');
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerResult, setWorkerResult] = useState<any>(null);

  // New Campaign state
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampLoc, setNewCampLoc] = useState('');
  const [newCampDist, setNewCampDist] = useState('Jaffna');
  const [newCampDate, setNewCampDate] = useState('2026-11-20T09:00:00');
  const [newCampTarget, setNewCampTarget] = useState(150);

  const loadAllAdminData = async () => {
    try {
      const [resStats, resUsers, resReq, resApt, resMsg, resCamp, resHist, resAud, resAuto] = await Promise.all([
        authFetch('/api/stats').then(r => r.json()),
        authFetch('/api/admin/users').then(r => r.json()),
        authFetch('/api/requests').then(r => r.json()),
        authFetch('/api/appointments').then(r => r.json()),
        authFetch('/api/contact-messages').then(r => r.json()),
        authFetch('/api/campaigns').then(r => r.json()),
        authFetch('/api/donation-history').then(r => r.json()),
        authFetch('/api/admin/audit-logs').then(r => r.json()),
        authFetch('/api/admin/automation-logs').then(r => r.json())
      ]);

      if (resStats.success) setStats(resStats);
      if (resUsers.success) setUsersList(resUsers.users);
      if (resReq.success) setRequestsList(resReq.requests);
      if (resApt.success) setAppointmentsList(resApt.appointments);
      if (resMsg.success) setMessagesList(resMsg.messages);
      if (resCamp.success) setCampaignsList(resCamp.campaigns);
      if (resHist.success) setHistoryList(resHist.history);
      if (resAud.success) setAuditLogs(resAud.logs);
      if (resAuto.success) {
        setOutbox(resAuto.outbox);
        setDeliveryLogs(resAuto.deliveryLogs);
        if (resAuto.settings) {
          setWebhookUrl(resAuto.settings.N8N_WEBHOOK_URL || '');
          setAutomationEnabled(resAuto.settings.AUTOMATION_ENABLED === 'true');
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleVerifyDonor = async (userId: string, isVerified: boolean) => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/verify-donor`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified })
      });
      if (res.ok) loadAllAdminData();
    } catch {
      // ignore
    }
  };

  const handleToggleUserStatus = async (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) loadAllAdminData();
    } catch {
      // ignore
    }
  };

  const handleVerifyBloodRequest = async (requestId: string, status: 'ACTIVE' | 'REJECTED' | 'FULFILLED') => {
    try {
      const res = await authFetch(`/api/admin/requests/${requestId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) loadAllAdminData();
    } catch {
      // ignore
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const res = await authFetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'COMPLETED',
          completedNotes: 'Medically confirmed blood donation procedure'
        })
      });
      if (res.ok) loadAllAdminData();
    } catch {
      // ignore
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    try {
      const res = await authFetch('/api/admin/system-settings', {
        method: 'POST',
        body: JSON.stringify({
          N8N_WEBHOOK_URL: webhookUrl,
          N8N_WEBHOOK_SECRET: webhookSecret,
          AUTOMATION_ENABLED: String(automationEnabled)
        })
      });
      if (res.ok) {
        setSettingsStatus('Settings updated successfully.');
      }
    } catch {
      setSettingsStatus('Failed to update system settings.');
    }
  };

  const handleTriggerAutomationWorker = async () => {
    setWorkerRunning(true);
    setWorkerResult(null);
    try {
      const res = await authFetch('/api/admin/automation/trigger-worker', {
        method: 'POST'
      });
      const data = await res.json();
      setWorkerResult(data);
      loadAllAdminData();
    } catch {
      setWorkerResult({ error: 'Worker dispatch error' });
    } finally {
      setWorkerRunning(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: newCampTitle,
          description: newCampDesc,
          location: newCampLoc,
          district: newCampDist,
          startDate: new Date(newCampDate).toISOString(),
          targetUnits: Number(newCampTarget)
        })
      });
      if (res.ok) {
        setNewCampTitle('');
        setNewCampDesc('');
        setNewCampLoc('');
        loadAllAdminData();
        setActiveTab('campaigns');
      }
    } catch {
      // ignore
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const donorsOnly = usersList.filter(u => u.role === 'DONOR');
  const pendingDonors = donorsOnly.filter(u => !u.isVerified);
  const pendingRequests = requestsList.filter(r => r.status === 'PENDING_VERIFICATION');

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex">
      
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#111827] text-white flex flex-col shrink-0 shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#DC0A20] text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">LifeLink</span>
            <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Central Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto text-xs font-medium">
          {[
            { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
            { id: 'donors', label: '2. Donor Management', icon: UserCheck, badge: pendingDonors.length },
            { id: 'users', label: '3. User Management', icon: Users },
            { id: 'requests', label: '4. Blood Requests', icon: Droplets, badge: pendingRequests.length },
            { id: 'appointments', label: '6. Appointments', icon: Calendar },
            { id: 'messages', label: '7. Contact Messages', icon: Mail, badge: messagesList.filter(m => !m.isRead).length },
            { id: 'campaigns', label: '8. Campaign Management', icon: Flag },
            { id: 'history', label: '9. Donation History', icon: History },
            { id: 'hospitals', label: '10. Hospitals & Locations', icon: Building2 },
            { id: 'reports', label: '12. Reports & Analytics', icon: BarChart3 },
            { id: 'automation', label: '13. Automation Logs', icon: Terminal, badge: outbox.filter(o => o.status === 'QUEUED').length },
            { id: 'audit', label: '14. Audit Logs', icon: FileSpreadsheet },
            { id: 'settings', label: '15. System Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#DC0A20] text-white font-bold'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white text-neutral-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>16. Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900">Administrative Overview</h1>
              <p className="text-xs text-neutral-500 mt-1">Real-time system health and clinical verification status.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Total Registered Users</span>
                <span className="text-3xl font-extrabold text-neutral-900 font-mono mt-1 block">
                  {stats ? stats.totalUsers : 0}
                </span>
                <span className="text-[11px] text-neutral-400">All authenticated roles</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Verified Active Donors</span>
                <span className="text-3xl font-extrabold text-emerald-700 font-mono mt-1 block">
                  {stats ? stats.verifiedDonors : 0}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {pendingDonors.length} pending verification
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Pending Blood Requests</span>
                <span className="text-3xl font-extrabold text-amber-600 font-mono mt-1 block">
                  {stats ? stats.pendingRequests : 0}
                </span>
                <span className="text-[11px] text-neutral-400">Awaiting hospital check</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Notification Outbox</span>
                <span className="text-3xl font-extrabold text-[#DC0A20] font-mono mt-1 block">
                  {outbox.filter(o => o.status === 'QUEUED').length}
                </span>
                <span className="text-[11px] text-neutral-400">Ready for worker dispatch</span>
              </div>
            </div>

            {/* Priority Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pending Donors Review */}
              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-neutral-900">Pending Donor Verifications</h3>
                  <span className="text-xs text-amber-700 font-bold font-mono">{pendingDonors.length} Pending</span>
                </div>

                {pendingDonors.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">All registered donors have been verified.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingDonors.slice(0, 4).map((d) => (
                      <div key={d.id} className="p-3.5 bg-neutral-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-neutral-900 block">{d.fullName}</span>
                          <span className="text-neutral-500">{d.email} &middot; {d.donorProfile?.bloodGroup} &middot; {d.donorProfile?.district}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyDonor(d.id, true)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 text-xs"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Requests Review */}
              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-neutral-900">Pending Blood Requests</h3>
                  <span className="text-xs text-[#DC0A20] font-bold font-mono">{pendingRequests.length} Pending</span>
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">No blood requests waiting for verification.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 4).map((req) => (
                      <div key={req.id} className="p-3.5 bg-neutral-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-neutral-900 block">{req.hospital} ({req.district})</span>
                          <span className="text-neutral-500">
                            Ref: {req.patientReference} &middot; {req.unitsRequired} units {req.bloodGroup} &middot; {req.urgency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyBloodRequest(req.id, 'ACTIVE')}
                            className="px-3 py-1 bg-[#DC0A20] text-white rounded-lg font-semibold hover:bg-[#B80020] text-xs"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleVerifyBloodRequest(req.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DONOR MANAGEMENT */}
        {activeTab === 'donors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Donor Management</h2>
                <p className="text-xs text-neutral-500 mt-1">Review, approve, or suspend voluntary blood donor records.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Donor Name</th>
                    <th className="py-3 px-4 font-semibold">Email & Phone</th>
                    <th className="py-3 px-4 font-semibold">Blood Group</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {donorsOnly.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-bold text-neutral-900">{d.fullName}</td>
                      <td className="py-3 px-4 text-neutral-600">{d.email}<br/><span className="font-mono text-[11px]">{d.phone}</span></td>
                      <td className="py-3 px-4 font-bold text-[#DC0A20]">{d.donorProfile?.bloodGroup}</td>
                      <td className="py-3 px-4 text-neutral-600">{d.donorProfile?.city}, {d.donorProfile?.district}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          d.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifyDonor(d.id, !d.isVerified)}
                          className="px-2.5 py-1 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-medium"
                        >
                          {d.isVerified ? 'Revoke' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(d.id, d.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          className={`px-2.5 py-1 rounded font-medium ${
                            d.status === 'ACTIVE'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {d.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BLOOD REQUEST MANAGEMENT */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Blood Request Management</h2>
              <p className="text-xs text-neutral-500 mt-1">Verify hospital authenticity and update fulfillment statuses.</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Hospital & District</th>
                    <th className="py-3 px-4 font-semibold">Blood Group & Units</th>
                    <th className="py-3 px-4 font-semibold">Patient Ref</th>
                    <th className="py-3 px-4 font-semibold">Urgency</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {requestsList.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-bold text-neutral-900">{req.hospital}<br/><span className="text-neutral-500 font-normal">{req.district}</span></td>
                      <td className="py-3 px-4 font-bold text-[#DC0A20] font-mono">{req.bloodGroup} &middot; {req.unitsRequired} Units</td>
                      <td className="py-3 px-4 text-neutral-600 font-mono">{req.patientReference}</td>
                      <td className="py-3 px-4 font-semibold">{req.urgency}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          req.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'FULFILLED' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'PENDING_VERIFICATION' && (
                          <button
                            onClick={() => handleVerifyBloodRequest(req.id, 'ACTIVE')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium"
                          >
                            Approve
                          </button>
                        )}
                        {req.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleVerifyBloodRequest(req.id, 'FULFILLED')}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded font-medium"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Donation Appointments</h2>
              <p className="text-xs text-neutral-500 mt-1">Review appointments and certify completed hospital donations.</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 p-4 text-xs">
              {appointmentsList.map((a) => (
                <div key={a.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-neutral-900 block">{a.hospitalName}</span>
                    <span className="text-neutral-500 font-mono">
                      Scheduled: {new Date(a.scheduledAt).toLocaleString()} &middot; Status: <strong>{a.status}</strong>
                    </span>
                  </div>
                  {a.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleCompleteAppointment(a.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                    >
                      Certify Hospital Donation Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CAMPAIGN MANAGEMENT */}
        {activeTab === 'campaigns' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Campaign Management</h2>
              <p className="text-xs text-neutral-500 mt-1">Create and schedule regional community blood drives.</p>
            </div>

            {/* Create Campaign Form */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 max-w-2xl">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">Create New Blood Drive Campaign</h3>
              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={newCampTitle}
                    onChange={(e) => setNewCampTitle(e.target.value)}
                    placeholder="e.g. Tellippalai Community Blood Drive"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">District</label>
                    <select
                      value={newCampDist}
                      onChange={(e) => setNewCampDist(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      {Object.keys(SRI_LANKA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Target Units</label>
                    <input
                      type="number"
                      required
                      value={newCampTarget}
                      onChange={(e) => setNewCampTarget(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Location Details</label>
                  <input
                    type="text"
                    required
                    value={newCampLoc}
                    onChange={(e) => setNewCampLoc(e.target.value)}
                    placeholder="e.g. Tellippalai Base Hospital Grounds"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newCampDate}
                    onChange={(e) => setNewCampDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newCampDesc}
                    onChange={(e) => setNewCampDesc(e.target.value)}
                    placeholder="Campaign medical requirements and organizers..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#DC0A20] text-white font-semibold rounded-lg hover:bg-[#B80020]"
                >
                  Publish Campaign
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 12: REPORTS & ANALYTICS (CSV EXPORT) */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Reports and Data Export</h2>
              <p className="text-xs text-neutral-500 mt-1">Export database records directly to CSV for administrative filing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Donors Registry Report</h3>
                <p className="text-xs text-neutral-500">Full audit list of registered voluntary blood donors, blood groups, and verification status.</p>
                <button
                  onClick={() => exportCSV(donorsOnly, 'lifelink_donors_report')}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Donors CSV</span>
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Blood Requests Report</h3>
                <p className="text-xs text-neutral-500">Historical log of all hospital requests, units required, urgency, and fulfillment dates.</p>
                <button
                  onClick={() => exportCSV(requestsList, 'lifelink_blood_requests_report')}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Requests CSV</span>
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Certified Donations Report</h3>
                <p className="text-xs text-neutral-500">Official hospital certificates issued for completed blood transfusions.</p>
                <button
                  onClick={() => exportCSV(historyList, 'lifelink_donation_certificates_report')}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export History CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: AUTOMATION LOGS (OUTBOX & N8N DISPATCH) */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Automation & Notification Outbox</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Server-side notification queue and secure n8n webhook delivery logs.
                </p>
              </div>

              <button
                onClick={handleTriggerAutomationWorker}
                disabled={workerRunning}
                className="px-4 py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{workerRunning ? 'Processing Outbox...' : 'Trigger Automation Worker'}</span>
              </button>
            </div>

            {workerResult && (
              <div className="p-4 bg-white rounded-xl border border-neutral-200 text-xs font-mono">
                <span className="font-bold block mb-1 text-neutral-800">Worker Execution Result:</span>
                <pre>{JSON.stringify(workerResult, null, 2)}</pre>
              </div>
            )}

            {/* Outbox Queue */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">Outbox Queue ({outbox.length} Events)</h3>
              {outbox.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">Outbox is empty.</p>
              ) : (
                <div className="divide-y divide-neutral-100 text-xs">
                  {outbox.slice(0, 10).map((item) => (
                    <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-neutral-900 block">{item.eventType} &rarr; {item.recipientEmail}</span>
                        <span className="text-neutral-500 text-[11px] font-mono">{item.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          item.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'QUEUED' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status} (Retries: {item.retries})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 14: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Audit Logs</h2>
              <p className="text-xs text-neutral-500 mt-1">Immutable chronological records of all administrative and clinical actions.</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Actor Email</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Target</th>
                    <th className="py-3 px-4 font-semibold">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  {auditLogs.slice(0, 25).map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-4 text-neutral-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-4 font-medium text-neutral-800">{log.actorEmail}</td>
                      <td className="py-2.5 px-4 font-bold text-[#DC0A20]">{log.action}</td>
                      <td className="py-2.5 px-4 text-neutral-600">{log.targetType}:{log.targetId}</td>
                      <td className="py-2.5 px-4 text-neutral-500 truncate max-w-xs">{log.metadata}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 15: SYSTEM SETTINGS (n8n CONFIGURATION) */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">System & Automation Settings</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Configure backend-to-n8n webhook triggers and SMTP provider credentials.
              </p>
            </div>

            {settingsStatus && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingsStatus}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  n8n Webhook URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="http://localhost:5678/webhook/lifelink-events"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  Backend worker dispatches JSON payloads to this endpoint. The frontend NEVER calls n8n directly.
                </span>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Webhook Secret Header (X-LifeLink-Secret)
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoToggle"
                  checked={automationEnabled}
                  onChange={(e) => setAutomationEnabled(e.target.checked)}
                  className="rounded border-neutral-300 text-[#DC0A20] focus:ring-[#DC0A20]"
                />
                <label htmlFor="autoToggle" className="font-semibold text-neutral-800 cursor-pointer">
                  Enable Backend-to-n8n Outbox Worker
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg font-semibold transition-colors"
              >
                Save System Settings
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
