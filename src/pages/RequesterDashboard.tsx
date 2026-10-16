import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Droplets,
  FileText,
  MessageSquare,
  Calendar,
  Flag,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { authFetch } from '../services/api.js';
import { BloodRequest, DonorContactRequest, DonationAppointment, DonorSearchResult } from '../types/index.js';
import { RequestBloodModal } from '../components/RequestBloodModal.js';
import { ContactDonorModal } from '../components/ContactDonorModal.js';
import { BLOOD_GROUPS, SRI_LANKA_DISTRICTS, SRI_LANKA_HOSPITALS } from '../data/sriLankaData.js';

export const RequesterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'findDonors' | 'requestBlood' | 'myRequests' | 'donorResponses' | 'appointments' | 'campaigns' | 'notifications' | 'profile' | 'settings'
  >('overview');

  // Server data
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [contactRequests, setContactRequests] = useState<DonorContactRequest[]>([]);
  const [appointments, setAppointments] = useState<DonationAppointment[]>([]);

  // Search donors
  const [searchBloodGroup, setSearchBloodGroup] = useState('O+');
  const [searchDistrict, setSearchDistrict] = useState('Jaffna');
  const [searchDonors, setSearchDonors] = useState<DonorSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modals
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<DonorSearchResult | null>(null);

  // Propose appointment state
  const [selectedAcceptedDonorId, setSelectedAcceptedDonorId] = useState('');
  const [appointmentHospital, setAppointmentHospital] = useState('Teaching Hospital Jaffna');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentMsg, setAppointmentMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resR, resC, resA] = await Promise.all([
        authFetch('/api/requests').then(r => r.json()),
        authFetch('/api/contact-requests').then(r => r.json()),
        authFetch('/api/appointments').then(r => r.json())
      ]);

      if (resR.success) setMyRequests(resR.requests.filter((r: any) => r.requesterId === user?.id));
      if (resC.success) setContactRequests(resC.requests);
      if (resA.success) setAppointments(resA.appointments);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchDonors = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        bloodGroup: searchBloodGroup,
        district: searchDistrict,
        availableOnly: 'true'
      });
      const res = await authFetch(`/api/donors/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSearchDonors(data.donors);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleProposeAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentMsg(null);
    if (!selectedAcceptedDonorId || !appointmentDateTime) return;

    try {
      const res = await authFetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          donorId: selectedAcceptedDonorId,
          hospitalName: appointmentHospital,
          scheduledAt: appointmentDateTime,
          notes: appointmentNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAppointmentMsg('Donation appointment proposed successfully. Waiting for donor confirmation.');
        setAppointmentNotes('');
        loadData();
      } else {
        setAppointmentMsg(data.error || 'Failed to propose appointment.');
      }
    } catch {
      setAppointmentMsg('Network error proposing appointment.');
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const res = await authFetch(`/api/requests/${id}/cancel`, { method: 'PATCH' });
      if (res.ok) loadData();
    } catch {
      // ignore
    }
  };

  const pendingRequestsCount = myRequests.filter(r => r.status === 'PENDING_VERIFICATION').length;
  const activeRequestsCount = myRequests.filter(r => r.status === 'ACTIVE').length;
  const fulfilledRequestsCount = myRequests.filter(r => r.status === 'FULFILLED').length;
  const acceptedResponses = contactRequests.filter(c => c.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0 shadow-xl">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#DC0A20] text-white flex items-center justify-center font-bold">
            <Droplets className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">LifeLink</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Requester Desk</span>
          </div>
        </div>

        <div className="p-4 mx-3 my-3 rounded-xl bg-neutral-800/60 border border-neutral-700">
          <span className="text-xs font-bold text-white block truncate">{user?.fullName}</span>
          <span className="text-[11px] text-neutral-400 block mt-0.5">{user?.phone}</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto text-xs font-medium">
          {[
            { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
            { id: 'findDonors', label: '2. Find Donors', icon: Search },
            { id: 'requestBlood', label: '3. Request Blood', icon: Droplets },
            { id: 'myRequests', label: '4. My Blood Requests', icon: FileText, badge: myRequests.length },
            { id: 'donorResponses', label: '5. Donor Responses', icon: MessageSquare, badge: acceptedResponses.length },
            { id: 'appointments', label: '6. My Appointments', icon: Calendar, badge: appointments.length },
            { id: 'campaigns', label: '7. Campaigns', icon: Flag },
            { id: 'notifications', label: '8. Notifications', icon: Bell },
            { id: 'profile', label: '9. My Profile', icon: User },
            { id: 'settings', label: '10. Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'requestBlood') setIsBloodModalOpen(true);
                  else setActiveTab(item.id as any);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
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
            <span>11. Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900">Requester Overview</h1>
                <p className="text-xs text-neutral-500 mt-1">Manage urgent blood requirements and donor communications.</p>
              </div>

              <button
                onClick={() => setIsBloodModalOpen(true)}
                className="px-4 py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Blood Request</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Total Requests</span>
                <span className="text-2xl font-extrabold text-neutral-900 font-mono mt-1 block">
                  {myRequests.length}
                </span>
                <span className="text-[11px] text-neutral-400">All submitted records</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Pending Verification</span>
                <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
                  {pendingRequestsCount}
                </span>
                <span className="text-[11px] text-neutral-400">Being checked by admin</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Active Requests</span>
                <span className="text-2xl font-extrabold text-[#DC0A20] font-mono mt-1 block">
                  {activeRequestsCount}
                </span>
                <span className="text-[11px] text-neutral-400">Broadcasting to donors</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Accepted Donor Replies</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                  {acceptedResponses.length}
                </span>
                <span className="text-[11px] text-neutral-400">Ready for appointment</span>
              </div>
            </div>

            {/* Active Requests List */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900 mb-4">My Submitted Requests</h3>
              {myRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500">
                  You have not submitted any blood requests yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 text-xs">
                  {myRequests.map((req) => (
                    <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">{req.hospital}</span>
                          <span className="font-bold text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded">
                            {req.bloodGroup} &middot; {req.unitsRequired} Units
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            req.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-neutral-500 mt-1">Ref: {req.patientReference} &middot; District: {req.district}</p>
                      </div>

                      {['PENDING_VERIFICATION', 'ACTIVE'].includes(req.status) && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg font-semibold text-xs transition-colors self-start sm:self-auto"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FIND DONORS */}
        {activeTab === 'findDonors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Search Verified Donors</h2>
              <p className="text-xs text-neutral-500 mt-1">Contact available voluntary donors directly.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Blood Group</label>
                <select
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">District</label>
                <select
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  {Object.keys(SRI_LANKA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button
                onClick={handleSearchDonors}
                disabled={isSearching}
                className="px-4 py-2 bg-[#DC0A20] text-white rounded-lg font-semibold hover:bg-[#B80020] transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {hasSearched && searchDonors.length === 0 && !isSearching && (
              <div className="p-8 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#DC0A20] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">
                  No registered donors found for {searchBloodGroup} in {searchDistrict}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Try selecting another district or submit an urgent blood request to notify all emergency medical networks.
                </p>
                <button
                  onClick={() => setIsBloodModalOpen(true)}
                  className="px-4 py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Post Urgent Blood Request
                </button>
              </div>
            )}

            {searchDonors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span className="font-semibold">Found {searchDonors.length} matching donor(s)</span>
                  <span className="text-[11px] text-neutral-400">Available voluntary donors</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchDonors.map((d) => (
                    <div key={d.id} className="p-5 bg-white rounded-2xl border border-neutral-200 flex flex-col justify-between shadow-2xs hover:border-[#DC0A20]/40 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-neutral-900 text-sm block">{d.displayName}</span>
                            <span className="inline-block mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                              {d.isVerified ? 'Verified Donor' : 'Registered Donor'}
                            </span>
                          </div>
                          <span className="font-bold text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded text-xs font-mono">
                            {d.bloodGroup}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">{d.city}, {d.district}</p>
                      </div>

                      <button
                        onClick={() => setSelectedDonorForContact(d)}
                        className="mt-4 w-full py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                      >
                        Send Contact Request
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY BLOOD REQUESTS */}
        {activeTab === 'myRequests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">My Blood Requests</h2>
                <p className="text-xs text-neutral-500 mt-1">Review validation and fulfillment status.</p>
              </div>
              <button
                onClick={() => setIsBloodModalOpen(true)}
                className="px-4 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg"
              >
                New Request
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 p-4 text-xs">
              {myRequests.map((req) => (
                <div key={req.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-neutral-900 block">{req.hospital}</span>
                    <span className="text-neutral-500">
                      {req.bloodGroup} &middot; {req.unitsRequired} Units &middot; Status: <strong>{req.status}</strong>
                    </span>
                  </div>
                  {req.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DONOR RESPONSES & APPOINTMENT BOOKING */}
        {activeTab === 'donorResponses' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Donor Responses</h2>
              <p className="text-xs text-neutral-500 mt-1">Donors who accepted can now be booked for hospital donation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accepted Donors list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">Contact Request Responses</h3>
                {contactRequests.length === 0 ? (
                  <p className="text-xs text-neutral-500">No contact requests sent yet.</p>
                ) : (
                  contactRequests.map((cr) => (
                    <div key={cr.id} className="p-4 bg-white rounded-xl border border-neutral-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-neutral-800">Donor Request</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          cr.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {cr.status}
                        </span>
                      </div>
                      <p className="text-neutral-600 italic">"{cr.message}"</p>
                      {cr.responseNote && (
                        <p className="text-neutral-700 bg-neutral-50 p-2 rounded text-[11px]">
                          Donor Note: {cr.responseNote}
                        </p>
                      )}
                      {cr.status === 'ACCEPTED' && (
                        <button
                          onClick={() => setSelectedAcceptedDonorId(cr.donorId)}
                          className="mt-2 text-xs font-semibold text-[#DC0A20] hover:underline"
                        >
                          Select to Propose Appointment &rarr;
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Propose Appointment Form */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-900 mb-3">Propose Donation Appointment</h3>
                {appointmentMsg && (
                  <div className="mb-4 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-800 border border-neutral-200">
                    {appointmentMsg}
                  </div>
                )}
                <form onSubmit={handleProposeAppointment} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Select Accepted Donor</label>
                    <select
                      value={selectedAcceptedDonorId}
                      onChange={(e) => setSelectedAcceptedDonorId(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                      required
                    >
                      <option value="">-- Choose donor --</option>
                      {acceptedResponses.map((cr) => (
                        <option key={cr.id} value={cr.donorId}>
                          Donor {cr.donorId} (Accepted)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Certified Hospital</label>
                    <select
                      value={appointmentHospital}
                      onChange={(e) => setAppointmentHospital(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      {SRI_LANKA_HOSPITALS.map(h => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Appointment Date & Time (Asia/Colombo)</label>
                    <input
                      type="datetime-local"
                      required
                      value={appointmentDateTime}
                      onChange={(e) => setAppointmentDateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Notes for Donor</label>
                    <textarea
                      rows={2}
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      placeholder="Hospital blood bank reception directions..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#DC0A20] text-white font-semibold rounded-lg hover:bg-[#B80020]"
                  >
                    Send Appointment Proposal
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MY APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Scheduled Appointments</h2>
              <p className="text-xs text-neutral-500 mt-1">Confirmed and pending donation meetings.</p>
            </div>

            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="p-4 bg-white rounded-xl border border-neutral-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-neutral-900 block">{a.hospitalName}</span>
                    <span className="text-neutral-500 font-mono">Date: {new Date(a.scheduledAt).toLocaleString()}</span>
                  </div>
                  <span className={`font-bold px-2.5 py-1 rounded text-[11px] ${
                    a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    a.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <RequestBloodModal
        isOpen={isBloodModalOpen}
        onClose={() => setIsBloodModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <ContactDonorModal
        donor={selectedDonorForContact}
        isOpen={Boolean(selectedDonorForContact)}
        onClose={() => setSelectedDonorForContact(null)}
      />
    </div>
  );
};
