import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DC0A20] flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Life<span className="text-[#DC0A20]">Link</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sri Lanka’s smart blood donation management network. Designed for immediate voluntary donor matching with initial focus on Jaffna District healthcare facilities.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Privacy & Identity Protection Enforced</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform Navigation</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link to="/find-donors" className="hover:text-white transition-colors">Find Blood Donors</Link></li>
              <li><Link to="/request-blood" className="hover:text-white transition-colors">Request Emergency Blood</Link></li>
              <li><Link to="/campaigns" className="hover:text-white transition-colors">Donation Campaigns</Link></li>
              <li><Link to="/donation-guide" className="hover:text-white transition-colors">NBTS Donor Guidelines</Link></li>
              <li><Link to="/about-us" className="hover:text-white transition-colors">About LifeLink Sri Lanka</Link></li>
            </ul>
          </div>

          {/* Column 3: Medical Centers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Key Medical Centers</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Teaching Hospital Jaffna – Blood Bank</li>
              <li>Tellippalai Trail Cancer Hospital</li>
              <li>Base Hospital Point Pedro</li>
              <li>National Blood Transfusion Service, Narahenpita</li>
              <li>National Hospital of Sri Lanka, Colombo</li>
            </ul>
          </div>

          {/* Column 4: Contact & Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Emergency Support</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#DC0A20] shrink-0" />
                <span>NBTS 24/7 Hotline: <strong>1923</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>emergency@lifelink.lk</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>Hospital Road, Jaffna, Northern Province, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} LifeLink Sri Lanka. All rights reserved. Every Drop Saves a Life.</p>
          <div className="flex items-center gap-6">
            <Link to="/donation-guide" className="hover:text-neutral-400 transition-colors">Medical Protocols</Link>
            <Link to="/contact-us" className="hover:text-neutral-400 transition-colors">Contact Coordination</Link>
            <span>Timezone: Asia/Colombo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
