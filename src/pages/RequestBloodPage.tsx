import React, { useState, useEffect } from 'react';
import { Droplets, Plus, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { BloodRequest } from '../types/index.js';
import { RequestBloodModal } from '../components/RequestBloodModal.js';
import { useAuth } from '../context/AuthContext.js';

interface RequestBloodPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const RequestBloodPage: React.FC<RequestBloodPageProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DC0A20] uppercase tracking-wider">
              <Droplets className="w-4 h-4 fill-[#DC0A20]" />
              <span>Hospital Blood Requests</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">Verified Blood Inquiries</h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
              Real-time hospital requests verified through clinical confirmation in Jaffna and regional facilities.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Blood Request</span>
          </button>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            Loading active hospital requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
            <Droplets className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-neutral-800">No Active Blood Requests at Present</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Any newly submitted emergency requirements will appear here once verified by administrative staff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      req.urgency === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : req.urgency === 'URGENT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {req.urgency} URGENCY
                    </span>
                    <span className="text-xl font-extrabold text-[#DC0A20] bg-[#FFF0F2] px-3 py-0.5 rounded-lg border border-[#DC0A20]/20">
                      {req.bloodGroup}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{req.hospital}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {req.city}, {req.district}
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Units Needed:</span>
                      <span className="font-bold text-neutral-900 font-mono">{req.unitsRequired} Pints</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Required Date:</span>
                      <span className="font-medium text-neutral-800">{new Date(req.requiredDate).toLocaleDateString()}</span>
                    </div>
                    {req.additionalNotes && (
                      <p className="text-neutral-600 text-[11px] pt-1 border-t border-neutral-200 italic">
                        "{req.additionalNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      if (!user) onOpenAuth('login');
                      else window.location.href = '/donor/dashboard';
                    }}
                    className="w-full py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Respond & Help Patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RequestBloodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchRequests()}
      />
    </div>
  );
};
