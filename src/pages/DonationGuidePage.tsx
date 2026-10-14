import React, { useState } from 'react';
import { ShieldCheck, Heart, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, BloodGroup } from '../data/sriLankaData.js';

export const DonationGuidePage: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<BloodGroup>('O+');

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#DC0A20] uppercase tracking-wider mb-2">
            <Heart className="w-4 h-4 fill-[#DC0A20]" />
            <span>Sri Lanka NBTS Medical Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">Blood Donation Guidelines</h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
            Essential criteria, medical steps, and compatibility tables following the National Blood Transfusion Service Sri Lanka protocols.
          </p>
        </div>

        {/* 4 Steps */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">The 4-Step Donation Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200">
              <span className="text-xs font-bold font-mono text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded">01</span>
              <h3 className="text-sm font-bold text-neutral-900 mt-3">Donor Registration</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                National Identity Card (NIC) verification and medical questionnaire regarding recent health and travel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200">
              <span className="text-xs font-bold font-mono text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded">02</span>
              <h3 className="text-sm font-bold text-neutral-900 mt-3">Medical Screening</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                A registered medical officer checks blood pressure, pulse, weight, and takes a fingerprick hemoglobin test.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200">
              <span className="text-xs font-bold font-mono text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded">03</span>
              <h3 className="text-sm font-bold text-neutral-900 mt-3">Blood Collection</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Comfortable 8–10 minute collection of approximately 450 ml of whole blood using sterile single-use kits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200">
              <span className="text-xs font-bold font-mono text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded">04</span>
              <h3 className="text-sm font-bold text-neutral-900 mt-3">Rest & Refreshment</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                15 minutes of recovery with complimentary high-energy refreshments and fluids under observation.
              </p>
            </div>
          </div>
        </div>

        {/* Compatibility Matrix Interactive */}
        <div className="mb-12 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Blood Group Compatibility Matrix</h2>
          <p className="text-xs text-neutral-600 mb-6">Select any blood group to understand reciprocal compatibility:</p>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setActiveGroup(bg)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeGroup === bg
                    ? 'bg-[#DC0A20] text-white border-[#DC0A20] shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-[#DC0A20]'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {activeGroup} Can Donate Red Cells To:
              </span>
              <div className="flex flex-wrap gap-2 mt-3">
                {BLOOD_COMPATIBILITY[activeGroup].canGiveTo.map(g => (
                  <span key={g} className="px-3 py-1 bg-white text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300 shadow-2xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                {activeGroup} Can Receive Red Cells From:
              </span>
              <div className="flex flex-wrap gap-2 mt-3">
                {BLOOD_COMPATIBILITY[activeGroup].canReceiveFrom.map(g => (
                  <span key={g} className="px-3 py-1 bg-white text-blue-900 text-xs font-bold rounded-lg border border-blue-300 shadow-2xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Before You Donate (Recommended)
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>&bull; Drink at least 500ml (2 glasses) of water or juice before your appointment.</li>
              <li>&bull; Have a healthy, low-fat meal within 2 to 3 hours prior to donation.</li>
              <li>&bull; Get a good night’s sleep (at least 6-7 hours).</li>
              <li>&bull; Bring your Sri Lankan National Identity Card (NIC) or valid passport.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-[#DC0A20]" />
              Temporary Deferrals (Wait to Donate)
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>&bull; Within 6 months of receiving a tattoo or ear/body piercing.</li>
              <li>&bull; Within 4 months of your previous whole blood donation.</li>
              <li>&bull; If currently taking antibiotics or experiencing cold/flu symptoms.</li>
              <li>&bull; If hemoglobin level is below 12.5 g/dL during fingerprick screening.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
