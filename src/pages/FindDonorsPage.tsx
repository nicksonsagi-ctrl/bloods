import React, { useState, useEffect } from 'react';
import { Search, MapPin, Shield, Heart, Filter, UserCheck } from 'lucide-react';
import { BLOOD_GROUPS, SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS } from '../data/sriLankaData.js';
import { DonorSearchResult } from '../types/index.js';
import { ContactDonorModal } from '../components/ContactDonorModal.js';
import { useAuth } from '../context/AuthContext.js';

interface FindDonorsPageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const FindDonorsPage: React.FC<FindDonorsPageProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('Jaffna');
  const [city, setCity] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);

  const [donors, setDonors] = useState<DonorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDonor, setSelectedDonor] = useState<DonorSearchResult | null>(null);

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(bloodGroup ? { bloodGroup } : {}),
        ...(province ? { province } : {}),
        ...(district ? { district } : {}),
        ...(city ? { city } : {}),
        ...(availableOnly ? { availableOnly: 'true' } : {})
      });
      const res = await fetch(`/api/donors/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDonors(data.donors);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, province, district, city, availableOnly]);

  const availableCities = district ? SRI_LANKA_DISTRICTS[district]?.cities || [] : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#DC0A20] uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-[#DC0A20]" />
            <span>Sri Lanka Donor Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">Find Voluntary Blood Donors</h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mt-1">
            Search verified donors across Jaffna and island-wide districts. In compliance with privacy standards, only consenting donors appear with masked identity until you send a verified request.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium"
              >
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Province</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium"
              >
                <option value="">All Provinces</option>
                {SRI_LANKA_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium"
              >
                <option value="">All Districts</option>
                {Object.keys(SRI_LANKA_DISTRICTS).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Town</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium"
              >
                <option value="">All Towns</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="availOnly"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-neutral-300 text-[#DC0A20] focus:ring-[#DC0A20]"
              />
              <label htmlFor="availOnly" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                Available to donate now
              </label>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            Querying verified donor registry...
          </div>
        ) : donors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
            <UserCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-neutral-800">No Verified Donors Found for Selected Filter</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Pending donors must first be approved by medical administration before they appear in public search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div
                key={donor.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-[#DC0A20]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{donor.displayName}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {donor.city}, {donor.district}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-[#DC0A20] bg-[#FFF0F2] px-3 py-1 rounded-xl border border-[#DC0A20]/20">
                      {donor.bloodGroup}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Verification Status:</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Verified Donor
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Availability:</span>
                      <span className={donor.isAvailable ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                        {donor.isAvailable ? 'Ready to Donate' : 'Unavailable'}
                      </span>
                    </div>
                    {donor.lastDonationDate && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Last Donated:</span>
                        <span className="font-mono text-neutral-800">{donor.lastDonationDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      if (!user) onOpenAuth('login');
                      else setSelectedDonor(donor);
                    }}
                    className="w-full py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    Request Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactDonorModal
        donor={selectedDonor}
        isOpen={Boolean(selectedDonor)}
        onClose={() => setSelectedDonor(null)}
        onPromptAuth={() => onOpenAuth('login')}
      />
    </div>
  );
};
