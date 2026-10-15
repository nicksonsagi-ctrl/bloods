import React, { useState } from 'react';
import { X, Send, Shield, AlertCircle, CheckCircle, Heart, LogIn } from 'lucide-react';
import { DonorSearchResult } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { authFetch } from '../services/api.js';

interface ContactDonorModalProps {
  donor: DonorSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPromptAuth?: () => void;
}

export const ContactDonorModal: React.FC<ContactDonorModalProps> = ({
  donor,
  isOpen,
  onClose,
  onSuccess,
  onPromptAuth
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState(
    'Urgent blood donation needed for a patient admitted in Jaffna. Would you be available to donate?'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !donor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onPromptAuth) onPromptAuth();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authFetch('/api/contact-requests', {
        method: 'POST',
        body: JSON.stringify({
          donorId: donor.id,
          message
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setError(data.error || 'Failed to send contact request.');
      } else {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch {
      setIsSubmitting(false);
      setError('Network error contacting donor.');
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
              <h3 className="text-sm font-bold text-neutral-900">Contact Voluntary Donor</h3>
              <p className="text-[11px] text-neutral-600">Privacy-Protected Request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">Contact Request Dispatched</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your request has been routed to donor <strong>{donor.displayName}</strong>. You will be notified immediately when they accept or decline in their dashboard.
              </p>
              <button
                onClick={() => { setIsSuccess(false); onClose(); }}
                className="px-4 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg hover:bg-[#B80020]"
              >
                Done
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

              {/* Donor Summary */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">{donor.displayName}</span>
                  <span className="text-neutral-500 text-[11px]">{donor.city}, {donor.district}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#DC0A20] bg-white px-2 py-0.5 rounded border border-[#DC0A20]/20 inline-block">
                    {donor.bloodGroup}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Verified Donor</span>
                </div>
              </div>

              {!user && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  You must be logged in as a registered Requester to message this donor.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Message to Donor
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain patient context, hospital, and donation urgency..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#DC0A20]/20"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <Shield className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>LifeLink protects donor anonymity until mutual consent is granted.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Contact Request'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
