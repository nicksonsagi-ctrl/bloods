import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';
import { Campaign } from '../types/index.js';
import { CampaignRegisterModal } from '../components/CampaignRegisterModal.js';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCampaigns(data.campaigns);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#DC0A20] uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-[#DC0A20]" />
            <span>Community Outreach</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">Blood Donation Campaigns</h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
            Join scheduled community blood drives organized collaboratively with Teaching Hospital Jaffna Blood Bank and NBTS.
          </p>
        </div>

        {/* Campaign cards */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Loading donation campaigns...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
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
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">{camp.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">{camp.description}</p>
                    
                    <div className="space-y-1.5 text-xs pt-2">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{camp.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{new Date(camp.startDate).toLocaleDateString()} &middot; 09:00 AM - 04:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>Organizer: {camp.organizer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="w-full py-2.5 bg-[#DC0A20] hover:bg-[#B80020] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    Register as Attendee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CampaignRegisterModal
        campaign={selectedCampaign}
        isOpen={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
};
