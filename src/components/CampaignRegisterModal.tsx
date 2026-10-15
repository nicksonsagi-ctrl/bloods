import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { Campaign } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { authFetch } from '../services/api.js';
import { BLOOD_GROUPS } from '../data/sriLankaData.js';

interface CampaignRegisterModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignRegisterModal: React.FC<CampaignRegisterModalProps> = ({
  campaign,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+94 ');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authFetch(`/api/campaigns/${campaign.id}/register`, {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          bloodGroup
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(data.error || 'Failed to register for campaign.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setIsSubmitting(false);
      setError('Network error during registration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FFF0F2]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#DC0A20] fill-[#DC0A20]" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Campaign Registration</h3>
              <p className="text-[11px] text-neutral-600">Join Voluntary Blood Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">Registration Confirmed!</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Thank you for pledging to donate at <strong>{campaign.title}</strong> on{' '}
                {new Date(campaign.startDate).toLocaleDateString()}. An email acknowledgment has been queued.
              </p>
              <button
                onClick={() => { setIsSuccess(false); onClose(); }}
                className="px-4 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg hover:bg-[#B80020]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#DC0A20] shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                <span className="font-bold text-neutral-900 block">{campaign.title}</span>
                <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{campaign.location} ({campaign.district})</span>
                </div>
                <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. S. Arun"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.lk"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Confirm Camp Attendance'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
