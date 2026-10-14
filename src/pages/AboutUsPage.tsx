import React from 'react';
import { Heart, Shield, Users, Award, MapPin } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#DC0A20] uppercase tracking-wider mb-2">
            <Heart className="w-4 h-4 fill-[#DC0A20]" />
            <span>Sri Lankan Healthcare Innovation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">About LifeLink Sri Lanka</h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
            Bridging the gap between voluntary blood donors, emergency patients, and certified hospital blood banks across Jaffna and island-wide Sri Lanka.
          </p>
        </div>

        {/* Visual Story Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100">
            <img
              src="/src/assets/images/medical_volunteer_1791957956746.jpg"
              alt="Medical volunteer doctor Sri Lanka"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Our Founding Mission</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              In Sri Lanka, thousands of blood requests are circulated across unverified social media messaging groups every day. This leads to leaked donor numbers, harassment, outdated pleas, and dangerous delays during critical surgical procedures.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              LifeLink solves this with a privacy-first technological architecture. Every blood request is audited by administrative medical officers. Voluntary donors maintain total anonymity until they explicitly consent to a contact or booking request.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Zero Public Exposure</h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Your contact details are protected behind server-side session guards. Neither telephone numbers nor private addresses are ever exposed to search engines or anonymous web crawlers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Hospital Verification</h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Every completed blood donation is recorded through verified hospital records. Donors cannot self-certify medical procedures, ensuring high trust.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Jaffna Focus & Island-wide</h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              With initial primary coordination rooted in Jaffna District and Teaching Hospital Jaffna, our platform supports all 9 provinces and 25 districts of Sri Lanka.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
