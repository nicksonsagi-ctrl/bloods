import React, { useEffect, useState } from 'react';
import { SRI_LANKA_HOSPITALS, HospitalRecord } from '../data/sriLankaData.js';
import { MapPin, Phone, Building2 } from 'lucide-react';

interface SriLankaMapProps {
  onSelectHospital?: (hospital: HospitalRecord) => void;
}

export const SriLankaMap: React.FC<SriLankaMapProps> = ({ onSelectHospital }) => {
  const [selectedHospital, setSelectedHospital] = useState<HospitalRecord>(SRI_LANKA_HOSPITALS[0]);
  const [filterDistrict, setFilterDistrict] = useState<string>('All');

  const filteredHospitals = filterDistrict === 'All'
    ? SRI_LANKA_HOSPITALS
    : SRI_LANKA_HOSPITALS.filter(h => h.district === filterDistrict);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF0F2]/30">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#DC0A20]" />
            Sri Lanka Blood Bank & Hospital Network
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Initial focus: Jaffna District healthcare facilities & national referral centers
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600">Filter Region:</label>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-hidden"
          >
            <option value="All">All Regions</option>
            <option value="Jaffna">Jaffna District</option>
            <option value="Kilinochchi">Kilinochchi</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
            <option value="Galle">Galle</option>
            <option value="Batticaloa">Eastern Province</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Hospital Directory List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-neutral-100 border-r border-neutral-100 p-2">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              onClick={() => {
                setSelectedHospital(hosp);
                if (onSelectHospital) onSelectHospital(hosp);
              }}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                selectedHospital.id === hosp.id
                  ? 'bg-[#FFF0F2] border border-[#DC0A20]/20'
                  : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-neutral-900 leading-snug">{hosp.name}</span>
                <span className="text-[10px] font-semibold text-[#DC0A20] bg-white px-2 py-0.5 rounded border border-[#DC0A20]/30 shrink-0">
                  {hosp.district}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                {hosp.province} &middot; {hosp.type}
              </p>
              <p className="text-[11px] text-neutral-600 mt-1 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                {hosp.phone}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Hospital Showcase & Visual Geo Card */}
        <div className="lg:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-neutral-50 to-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Verified Hospital Facility</span>
              <span className="text-xs text-neutral-500 font-mono">Geo: {selectedHospital.lat.toFixed(4)}° N, {selectedHospital.lng.toFixed(4)}° E</span>
            </div>

            <h4 className="text-xl font-bold text-neutral-900">{selectedHospital.name}</h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-neutral-500 block text-[11px]">District</span>
                <span className="font-semibold text-neutral-900">{selectedHospital.district}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-neutral-500 block text-[11px]">Blood Bank Unit</span>
                <span className="font-semibold text-emerald-700">Active 24/7</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-neutral-500 block text-[11px]">Direct Line</span>
                <span className="font-semibold font-mono text-neutral-900">{selectedHospital.phone}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
              Equipped with refrigerated whole-blood, packed red cells, fresh frozen plasma, and platelet storage adhering strictly to Sri Lanka National Blood Transfusion Service standards.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-neutral-500">
              National Emergency Blood Hotline: <strong className="text-neutral-900">1923</strong>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedHospital.lat},${selectedHospital.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#DC0A20] hover:bg-[#B80020] rounded-lg transition-colors shadow-xs"
            >
              Open in Maps & Direction
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
