import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Search,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  PhoneCall,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Send,
  Droplets
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { BLOOD_GROUPS, SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS, BLOOD_COMPATIBILITY, BloodGroup } from '../data/sriLankaData.js';
import { BloodRequest, Campaign, SystemStats, DonorSearchResult } from '../types/index.js';
import { SriLankaMap } from '../components/SriLankaMap.js';
import { RequestBloodModal } from '../components/RequestBloodModal.js';
import { ContactDonorModal } from '../components/ContactDonorModal.js';
import { CampaignRegisterModal } from '../components/CampaignRegisterModal.js';

interface HomePageProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuth }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search card state
  const [searchBloodGroup, setSearchBloodGroup] = useState('O+');
  const [searchProvince, setSearchProvince] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('Jaffna');
  const [searchCity, setSearchCity] = useState('');

  // Dynamic data from API
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchResults, setSearchResults] = useState<DonorSearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<DonorSearchResult | null>(null);
  const [selectedCampaignForRegister, setSelectedCampaignForRegister] = useState<Campaign | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  // Selected blood group for interactive compatibility matrix
  const [selectedMatrixGroup, setSelectedMatrixGroup] = useState<BloodGroup>('O+');

  useEffect(() => {
    // Fetch system stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data);
      })
      .catch(() => {});

    // Fetch verified active requests
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentRequests(data.requests.slice(0, 3));
      })
      .catch(() => {});

    // Fetch campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCampaigns(data.campaigns.slice(0, 2));
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        bloodGroup: searchBloodGroup,
        ...(searchProvince ? { province: searchProvince } : {}),
        ...(searchDistrict ? { district: searchDistrict } : {}),
        ...(searchCity ? { city: searchCity } : {})
      });
      const res = await fetch(`/api/donors/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.donors);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: contactName,
          email: contactEmail,
          phone: contactPhone,
          subject: contactSubject,
          message: contactMessage
        })
      });
      if (res.ok) {
        setContactStatus('Thank you! Your message has been received by our Jaffna coordination desk.');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactSubject('');
        setContactMessage('');
      }
    } catch {
      setContactStatus('Could not send message. Please retry or call 1923.');
    }
  };

  const availableCities = searchDistrict ? SRI_LANKA_DISTRICTS[searchDistrict]?.cities || [] : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#151515]">
      
      {/* 1. HERO SECTION (REFERENCE MATCHED: Hands holding red heart + Search Card) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F2] via-white to-[#FAFAFA] pt-8 pb-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#DC0A20] bg-white px-3 py-1 rounded-full border border-[#DC0A20]/20 shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-[#DC0A20]" />
                <span>Sri Lanka National Blood Network &middot; Jaffna District</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.1] text-balance">
                Every Drop <br />
                <span className="text-[#DC0A20]">Saves a Life</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
                Connect directly with verified voluntary blood donors across Jaffna and island-wide healthcare centers. Free, privacy-protected, and hospital-verified.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('searchCardSection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 text-sm font-semibold text-white bg-[#DC0A20] hover:bg-[#B80020] rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.hero.findDonorsNow}</span>
                </button>

                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="px-5 py-3 text-sm font-semibold text-neutral-800 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-300 transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-[#DC0A20]" />
                  <span>{t.hero.requestEmergencyBlood}</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex items-center gap-6 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  100% Privacy Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Hospital Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  24/7 Response
                </span>
              </div>
            </div>

            {/* Right Hero Image: Large hands holding a red heart */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-neutral-100">
                <img
                  src="/src/assets/images/hero_hands_heart_1791957955528.jpg"
                  alt="Caring hands holding a heart for blood donation in Sri Lanka"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-wider font-semibold text-red-200">Volunteer Network</p>
                    <h3 className="text-lg font-bold">Teaching Hospital Jaffna</h3>
                    <p className="text-xs text-white/80">Connecting blood donors across Northern Province</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FIND BLOOD DONORS SEARCH CARD (REFERENCE MATCHED) */}
          <div id="searchCardSection" className="mt-12 bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 lg:p-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#DC0A20]" />
                {t.hero.searchTitle}
              </h3>
              <p className="text-xs text-neutral-500">{t.hero.searchDesc}</p>
            </div>

            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group</label>
                <select
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium focus:outline-hidden focus:bg-white"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Province</label>
                <select
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium focus:outline-hidden focus:bg-white"
                >
                  <option value="">{t.hero.allProvinces}</option>
                  {SRI_LANKA_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">District</label>
                <select
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium focus:outline-hidden focus:bg-white"
                >
                  <option value="">{t.hero.allDistricts}</option>
                  {Object.keys(SRI_LANKA_DISTRICTS).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Town</label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-neutral-50 font-medium focus:outline-hidden focus:bg-white"
                >
                  <option value="">{t.hero.allCities}</option>
                  {availableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-2.5 px-4 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Searching...' : t.hero.searchDonors}</span>
                </button>
              </div>
            </form>

            {/* Inline search results */}
            {searchResults !== null && (
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Search Results ({searchResults.length} Verified Donors Found)
                  </h4>
                  <span className="text-[11px] text-neutral-400">Strict privacy enforced &middot; Phone masked</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-xs text-neutral-600">
                      No verified active donors matching "{searchBloodGroup}" currently registered in {searchDistrict || 'Sri Lanka'}.
                    </p>
                    <button
                      onClick={() => {
                        if (!user) onOpenAuth('register');
                        else navigate('/donor/dashboard');
                      }}
                      className="mt-3 px-4 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg hover:bg-[#B80020]"
                    >
                      Register as a Donor
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.map((donor) => (
                      <div key={donor.id} className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#DC0A20]/40 transition-colors flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900">{donor.displayName}</span>
                            <span className="text-xs font-bold text-[#DC0A20] bg-[#FFF0F2] px-2 py-0.5 rounded border border-[#DC0A20]/20">
                              {donor.bloodGroup}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {donor.city}, {donor.district}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-[10px]">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Verified Active</span>
                            {donor.isAvailable && <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">Available</span>}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100">
                          <button
                            onClick={() => setSelectedDonorForContact(donor)}
                            className="w-full py-1.5 text-center text-xs font-semibold text-white bg-[#DC0A20] hover:bg-[#B80020] rounded-lg transition-colors"
                          >
                            Request Contact
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. SHORTCUT CARDS (REFERENCE MATCHED: White rounded shortcut cards) */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/find-donors"
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:shadow-md hover:border-[#DC0A20]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">{t.shortcuts.findDonors}</h4>
              <p className="text-xs text-neutral-500 mt-1">{t.shortcuts.findDonorsDesc}</p>
            </Link>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:shadow-md hover:border-[#DC0A20]/30 transition-all text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">{t.shortcuts.requestBlood}</h4>
              <p className="text-xs text-neutral-500 mt-1">{t.shortcuts.requestBloodDesc}</p>
            </button>

            <Link
              to="/campaigns"
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:shadow-md hover:border-[#DC0A20]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">{t.shortcuts.camps}</h4>
              <p className="text-xs text-neutral-500 mt-1">{t.shortcuts.campsDesc}</p>
            </Link>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:shadow-md hover:border-[#DC0A20]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC0A20] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">{t.shortcuts.hotline}</h4>
              <p className="text-xs text-neutral-500 mt-1">{t.shortcuts.hotlineDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL DYNAMIC STATISTICS SECTION (REAL COUNTS, NO FAKE DATA) */}
      <section className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#DC0A20] font-mono tabular-nums">
                {stats ? stats.registeredDonors : 0}
              </p>
              <p className="text-xs font-semibold text-neutral-700 mt-1">{t.stats.totalDonors}</p>
              <span className="text-[10px] text-neutral-400">Database verified</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {stats ? stats.verifiedDonors : 0}
              </p>
              <p className="text-xs font-semibold text-neutral-700 mt-1">{t.stats.verifiedDonors}</p>
              <span className="text-[10px] text-neutral-400">Active & available</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#DC0A20] font-mono tabular-nums">
                {stats ? stats.totalRequests : 0}
              </p>
              <p className="text-xs font-semibold text-neutral-700 mt-1">{t.stats.bloodRequests}</p>
              <span className="text-[10px] text-neutral-400">Hospital confirmed</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {stats ? stats.activeCampaigns : 0}
              </p>
              <p className="text-xs font-semibold text-neutral-700 mt-1">{t.stats.campaigns}</p>
              <span className="text-[10px] text-neutral-400">Jaffna & island-wide</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENT BLOOD REQUESTS SECTION */}
      <section className="py-16 bg-[#FAFAFA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Urgent Needs</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">{t.recentRequests.title}</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t.recentRequests.subtitle}</p>
            </div>
            <Link
              to="/request-blood"
              className="text-xs font-semibold text-[#DC0A20] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>{t.recentRequests.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 max-w-xl mx-auto">
              <Activity className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-neutral-800">No Active Emergency Requests Currently</h4>
              <p className="text-xs text-neutral-500 mt-1">
                All patient requests have been fulfilled or are undergoing hospital administrative verification.
              </p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-4 px-4 py-2 bg-[#DC0A20] text-white text-xs font-semibold rounded-lg hover:bg-[#B80020] cursor-pointer"
              >
                Submit Blood Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-[#DC0A20]/40 transition-colors flex flex-col justify-between"
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
                      <span className="text-lg font-extrabold text-[#DC0A20] bg-[#FFF0F2] px-2.5 py-0.5 rounded-lg border border-[#DC0A20]/20">
                        {req.bloodGroup}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{req.hospital}</h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {req.city}, {req.district}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Units Required:</span>
                        <span className="font-bold text-neutral-900 font-mono">{req.unitsRequired} Pints</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Required Date:</span>
                        <span className="font-medium text-neutral-800">{new Date(req.requiredDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        if (!user) onOpenAuth('login');
                        else navigate('/donor/dashboard');
                      }}
                      className="w-full py-2 bg-[#DC0A20] hover:bg-[#B80020] text-white text-xs font-semibold rounded-lg transition-colors text-center"
                    >
                      {t.recentRequests.respondHelp}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. CAMPAIGNS SECTION (FEATURING JAFFNA BLOOD DRIVE IMAGE) */}
      <section className="py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Community Drives</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">{t.campaignSection.title}</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t.campaignSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((camp) => (
              <div key={camp.id} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden">
                    <img
                      src={camp.bannerUrl}
                      alt={camp.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-bold text-[#DC0A20]">
                      {camp.district} District
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-base font-bold text-neutral-900">{camp.title}</h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{camp.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div className="p-2.5 bg-neutral-50 rounded-lg">
                        <span className="text-neutral-400 block text-[10px]">Location</span>
                        <span className="font-semibold text-neutral-800">{camp.location}</span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded-lg">
                        <span className="text-neutral-400 block text-[10px]">Target Collection</span>
                        <span className="font-semibold text-[#DC0A20] font-mono">{camp.targetUnits} Units</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedCampaignForRegister(camp)}
                    className="w-full py-2.5 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    {t.campaignSection.registerCamp}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE SRI LANKA MAP SECTION */}
      <section className="py-16 bg-[#FAFAFA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Hospital Network</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">{t.mapSection.title}</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t.mapSection.subtitle}</p>
          </div>

          <SriLankaMap
            onSelectHospital={(hosp) => {
              // Can prefill hospital request
            }}
          />
        </div>
      </section>

      {/* 8. BLOOD COMPATIBILITY MATRIX & DONOR GUIDELINE SECTION */}
      <section className="py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Medical Guidelines</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">{t.guideSection.title}</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t.guideSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Matrix */}
            <div className="lg:col-span-7 bg-[#FFF0F2]/40 rounded-2xl p-6 border border-[#DC0A20]/20">
              <h3 className="text-sm font-bold text-neutral-900 mb-2">Interactive Blood Compatibility Matrix</h3>
              <p className="text-xs text-neutral-600 mb-4">Click your blood group to view compatible donors and recipients:</p>
              
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedMatrixGroup(bg)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      selectedMatrixGroup === bg
                        ? 'bg-[#DC0A20] text-white border-[#DC0A20] shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-[#DC0A20]'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-neutral-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    You can donate to:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {BLOOD_COMPATIBILITY[selectedMatrixGroup].canGiveTo.map(g => (
                      <span key={g} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md border border-emerald-200">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-neutral-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    You can receive from:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {BLOOD_COMPATIBILITY[selectedMatrixGroup].canReceiveFrom.map(g => (
                      <span key={g} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-md border border-blue-200">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/80 border border-neutral-200 text-xs text-neutral-600">
                <strong>O- Negative</strong> is the universal red cell donor; <strong>AB+ Positive</strong> is the universal plasma donor.
              </div>
            </div>

            {/* NBTS Eligibility Rules */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Sri Lanka NBTS Eligibility Criteria</h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#DC0A20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Age Limit</span>
                    <span className="text-neutral-500">Between 18 and 60 years of age (regular donors up to 65).</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#DC0A20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Body Weight</span>
                    <span className="text-neutral-500">Above 50 kg (110 lbs) for safe 450ml donation.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#DC0A20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Donation Interval</span>
                    <span className="text-neutral-500">Minimum 4 months (120 days) between consecutive donations.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#DC0A20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Hemoglobin Level</span>
                    <span className="text-neutral-500">Minimum 12.5 g/dL measured prior to donation by clinical staff.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MEDICAL VOLUNTEER & ABOUT SECTION */}
      <section className="py-16 bg-[#FAFAFA] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-neutral-100">
                <img
                  src="/src/assets/images/medical_volunteer_1791957956746.jpg"
                  alt="Sri Lankan medical volunteer doctor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">About LifeLink Sri Lanka</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                Direct Voluntary Matching. Absolute Donor Privacy.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                LifeLink was founded to eliminate emergency blood shortages across Sri Lankan hospitals. Unlike social media broadcasts where sensitive personal numbers are leaked publicly, LifeLink keeps donor identities completely encrypted and confidential.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Requesters can message verified donors anonymously. Only when a donor mutually accepts the request are safe contact coordinates and appointment schedules finalized at certified hospital facilities.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-neutral-800">
                <div className="px-3 py-2 bg-white rounded-lg border border-neutral-200">
                  Regional Focus: <strong>Jaffna District</strong>
                </div>
                <div className="px-3 py-2 bg-white rounded-lg border border-neutral-200">
                  Transfusion Standard: <strong>NBTS Compliant</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CONTACT US SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC0A20]">Reach Our Team</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">Contact LifeLink Coordination</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              For hospital affiliations, emergency blood drive requests, or technical support across Sri Lanka.
            </p>
          </div>

          <div className="bg-[#FFF0F2]/30 rounded-2xl p-6 sm:p-8 border border-neutral-200">
            {contactStatus && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{contactStatus}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@example.lk"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Inquiry or blood drive request"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Coordination Desk</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <RequestBloodModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          fetch('/api/requests')
            .then(res => res.json())
            .then(data => { if (data.success) setRecentRequests(data.requests.slice(0, 3)); });
        }}
      />

      <ContactDonorModal
        donor={selectedDonorForContact}
        isOpen={Boolean(selectedDonorForContact)}
        onClose={() => setSelectedDonorForContact(null)}
        onPromptAuth={() => onOpenAuth('login')}
      />

      <CampaignRegisterModal
        campaign={selectedCampaignForRegister}
        isOpen={Boolean(selectedCampaignForRegister)}
        onClose={() => setSelectedCampaignForRegister(null)}
      />
    </div>
  );
};
