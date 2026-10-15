import React, { useState } from 'react';
import { X, AlertCircle, HeartPulse, Hospital, Calendar, Phone, CheckCircle, ShieldCheck } from 'lucide-react';
import { BLOOD_GROUPS, SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS, SRI_LANKA_HOSPITALS } from '../data/sriLankaData.js';
import { useAuth } from '../context/AuthContext.js';
import { authFetch } from '../services/api.js';

interface RequestBloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultHospital?: string;
}

export const RequestBloodModal: React.FC<RequestBloodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultHospital = ''
}) => {
  const { user } = useAuth();

  const [patientReference, setPatientReference] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [hospital, setHospital] = useState(defaultHospital || 'Teaching Hospital Jaffna');
  const [province, setProvince] = useState('Northern Province');
  const [district, setDistrict] = useState('Jaffna');
  const [city, setCity] = useState('Jaffna Town');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [urgency, setUrgency] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('URGENT');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+94 ');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          patientReference,
          requesterName: user?.fullName || 'Emergency Patient Relative',
          bloodGroup,
          unitsRequired: Number(unitsRequired),
          hospital,
          province,
          district,
          city,
          requiredDate,
          urgency,
          contactPhone,
          additionalNotes
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(data.error || 'Failed to submit blood request.');
      } else {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      setError('Network error submitting blood request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FFF0F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DC0A20] flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Request Blood Units</h3>
              <p className="text-xs text-neutral-600">Verified through Sri Lanka Hospital Records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900">Blood Request Submitted</h4>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Your request is saved as <strong>Pending Verification</strong>. Our administrative coordinator will verify medical details with <strong>{hospital}</strong>, after which matching voluntary donors will be notified.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg hover:bg-[#B80020] transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-[#DC0A20] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Urgency selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CRITICAL', 'URGENT', 'STANDARD'] as const).map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setUrgency(level)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        urgency === level
                          ? level === 'CRITICAL'
                            ? 'bg-red-600 text-white border-red-600'
                            : level === 'URGENT'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-neutral-800 text-white border-neutral-800'
                          : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Reference */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Patient Hospital Reference / Bed ID (Privacy-Preserved)
                </label>
                <input
                  type="text"
                  required
                  value={patientReference}
                  onChange={(e) => setPatientReference(e.target.value)}
                  placeholder="e.g. THJ-WARD-4-REF89"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#DC0A20]/20"
                />
              </div>

              {/* Blood Group & Units */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group Required</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Pints / Units Needed</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={unitsRequired}
                    onChange={(e) => setUnitsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Hospital */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Hospital / Medical Center</label>
                <select
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                >
                  {SRI_LANKA_HOSPITALS.map(h => (
                    <option key={h.id} value={h.name}>{h.name} ({h.district})</option>
                  ))}
                </select>
              </div>

              {/* District & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    {Object.keys(SRI_LANKA_DISTRICTS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaffna Town"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Required Date & Contact Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Required By Date</label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Requester Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Scheduled elective surgery or trauma emergency"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Blood Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
