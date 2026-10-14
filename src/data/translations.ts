export type Language = 'en' | 'si' | 'ta';

export const TRANSLATIONS = {
  en: {
    brand: 'LifeLink',
    tagline: 'Every Drop Saves a Life',
    nav: {
      home: 'Home',
      findDonors: 'Find Donors',
      requestBlood: 'Request Blood',
      campaigns: 'Campaigns',
      guide: 'Donation Guide',
      about: 'About Us',
      contact: 'Contact Us',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      logout: 'Logout'
    },
    hero: {
      title: 'Every Drop Saves a Life',
      subtitle: 'Sri Lanka’s smart, privacy-centric blood donation network connecting patients, hospitals, and voluntary donors across Jaffna and island-wide districts.',
      findDonorsNow: 'Find Donors Now',
      requestEmergencyBlood: 'Request Emergency Blood',
      searchTitle: 'Find Blood Donors in Sri Lanka',
      searchDesc: 'Search privacy-verified, available voluntary blood donors by blood group, province, district, and city.',
      selectBloodGroup: 'Select Blood Group',
      selectProvince: 'Select Province',
      selectDistrict: 'Select District',
      selectCity: 'Select City (Optional)',
      allProvinces: 'All Provinces',
      allDistricts: 'All Districts',
      allCities: 'All Cities',
      searchDonors: 'Search Donors'
    },
    shortcuts: {
      findDonors: 'Find Donors',
      findDonorsDesc: 'Connect with verified voluntary donors nearby',
      requestBlood: 'Request Blood',
      requestBloodDesc: 'Urgent requests verified through hospital records',
      camps: 'Donation Campaigns',
      campsDesc: 'Join upcoming community blood drives in Jaffna',
      hotline: 'NBTS Hotline 1923',
      hotlineDesc: 'National Blood Transfusion Service Sri Lanka'
    },
    stats: {
      totalDonors: 'Registered Donors',
      verifiedDonors: 'Verified Active Donors',
      bloodRequests: 'Blood Requests Processed',
      campaigns: 'Community Drives'
    },
    recentRequests: {
      title: 'Recent Urgent Blood Requests',
      subtitle: 'Verified by hospital confirmation and processed in real time across Sri Lankan healthcare facilities.',
      unitsNeeded: 'Units Needed',
      urgency: 'Urgency',
      hospital: 'Hospital',
      respondHelp: 'Respond to Request',
      viewAll: 'View All Requests'
    },
    campaignSection: {
      title: 'Upcoming Blood Donation Campaigns',
      subtitle: 'Join community blood collection drives organized with Jaffna Teaching Hospital and regional health services.',
      registerCamp: 'Register for Camp',
      targetUnits: 'Target Units'
    },
    mapSection: {
      title: 'Island-Wide Blood Bank Network',
      subtitle: 'Interactive map displaying verified hospital blood banks and active donation centers with initial focus on Jaffna District.'
    },
    guideSection: {
      title: 'Blood Compatibility & Donor Guidelines',
      subtitle: 'Learn who you can help and standard medical eligibility criteria set by the National Blood Transfusion Service (NBTS) Sri Lanka.'
    },
    common: {
      loading: 'Loading data...',
      save: 'Save Changes',
      cancel: 'Cancel',
      submit: 'Submit',
      status: 'Status',
      actions: 'Actions',
      date: 'Date',
      verified: 'Verified',
      pending: 'Pending Verification',
      available: 'Available to Donate',
      unavailable: 'Temporarily Unavailable',
      privacyNote: 'Donor privacy is protected. Contact details are never exposed publicly.'
    }
  },
  si: {
    brand: 'LifeLink',
    tagline: 'සෑම ලේ බිඳක්ම ජීවිතයක් බේරාගනී',
    nav: {
      home: 'මුල් පිටුව',
      findDonors: 'දායකයින් සොයන්න',
      requestBlood: 'ලේ ඉල්ලුම් කරන්න',
      campaigns: 'ලේ දන්දීමේ කඳවුරු',
      guide: 'මඟපෙන්වීම',
      about: 'අප ගැන',
      contact: 'සම්බන්ධ වන්න',
      login: 'ඇතුල් වන්න',
      register: 'ලියාපදිංචි වන්න',
      dashboard: 'පාලක පුවරුව',
      logout: 'ඉවත් වන්න'
    },
    hero: {
      title: 'සෑම ලේ බිඳක්ම ජීවිතයක් බේරාගනී',
      subtitle: 'ශ්‍රී ලංකාවේ යාපනය ඇතුළු දිවයින පුරා රෝගීන්, රෝහල් සහ ස්වේච්ඡා ලේ පරිත්‍යාගශීලීන් සම්බන්ධ කරන සුහුරු ජාලය.',
      findDonorsNow: 'දායකයින් සොයන්න',
      requestEmergencyBlood: 'හදිසි ලේ ඉල්ලීමක් කරන්න',
      searchTitle: 'ශ්‍රී ලංකාවේ ලේ දායකයින් සොයන්න',
      searchDesc: 'රුධිර ඝනය, පළාත, දිස්ත්‍රික්කය සහ නගරය අනුව සත්‍යාපිත දායකයින් සොයන්න.',
      selectBloodGroup: 'රුධිර ඝනය තෝරන්න',
      selectProvince: 'පළාත තෝරන්න',
      selectDistrict: 'දිස්ත්‍රික්කය තෝරන්න',
      selectCity: 'නගරය තෝරන්න',
      allProvinces: 'සියලු පළාත්',
      allDistricts: 'සියලු දිස්ත්‍රික්ක',
      allCities: 'සියලු නගර',
      searchDonors: 'සොයන්න'
    },
    shortcuts: {
      findDonors: 'දායකයින් සොයන්න',
      findDonorsDesc: 'ලඟම සිටින සත්‍යාපිත ස්වේච්ඡා දායකයින්',
      requestBlood: 'ලේ ඉල්ලුම් කරන්න',
      requestBloodDesc: 'රෝහල් තහවුරු කිරීම් සහිත හදිසි ඉල්ලීම්',
      camps: 'ලේ දන්දීමේ කඳවුරු',
      campsDesc: 'යාපනය සහ ඒ අවට පැවැත්වෙන කඳවුරු',
      hotline: 'ජාතික රුධිර සේවය 1923',
      hotlineDesc: 'ශ්‍රී ලංකා ජාතික රුධිර පාරවිලයන සේවය'
    },
    stats: {
      totalDonors: 'ලියාපදිංචි දායකයින්',
      verifiedDonors: 'සත්‍යාපිත දායකයින්',
      bloodRequests: 'සැපිරූ රුධිර ඉල්ලීම්',
      campaigns: 'ලේ දන්දීමේ කඳවුරු'
    },
    recentRequests: {
      title: 'මෑත හදිසි රුධිර ඉල්ලීම්',
      subtitle: 'ශ්‍රී ලංකා රෝහල් හරහා තහවුරු කරන ලද සහ නිරන්තරයෙන් යාවත්කාලීන වන ඉල්ලීම්.',
      unitsNeeded: 'අවශ්‍ය ඒකක',
      urgency: 'හදිසිභාවය',
      hospital: 'රෝහල',
      respondHelp: 'උදව් කරන්න',
      viewAll: 'සියලු ඉල්ලීම් බලන්න'
    },
    campaignSection: {
      title: 'ඉදිරි ලේ දන්දීමේ කඳවුරු',
      subtitle: 'යාපනය ශික්ෂණ රෝහල සහ ප්‍රාදේශීය සෞඛ්‍ය අංශ සංවිධානය කරන කඳවුරු.',
      registerCamp: 'කඳවුරට ලියාපදිංචි වන්න',
      targetUnits: 'ඉලක්ක ඒකක'
    },
    mapSection: {
      title: 'දිවයින පුරා රුධිර බැංකු ජාලය',
      subtitle: 'යාපනය දිස්ත්‍රික්කය මුල්කරගත් අන්තර්ක්‍රියාකාරී සිතියම.'
    },
    guideSection: {
      title: 'රුධිර ගැළපුම සහ සුදුසුකම්',
      subtitle: 'ජාතික රුධිර පාරවිලයන සේවයේ සම්මත මඟපෙන්වීම්.'
    },
    common: {
      loading: 'දත්ත පූරණය වෙමින්...',
      save: 'සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      submit: 'යොමු කරන්න',
      status: 'තත්ත්වය',
      actions: 'ක්‍රියාමාර්ග',
      date: 'දිනය',
      verified: 'සත්‍යාපිතයි',
      pending: 'තහවුරු කිරීම අපේක්ෂාවෙන්',
      available: 'ලේ දීමට සූදානම්',
      unavailable: 'දැනට නොහැක',
      privacyNote: 'දායකයින්ගේ පෞද්ගලිකත්වය සුරක්ෂිත කර ඇත.'
    }
  },
  ta: {
    brand: 'LifeLink',
    tagline: 'ஒவ்வொரு துளியும் ஒரு உயிரைக் காக்கும்',
    nav: {
      home: 'முகப்பு',
      findDonors: 'குருதிக்கொடையாளரைத் தேடுங்கள்',
      requestBlood: 'குருதி கோரிக்கை',
      campaigns: 'குருதிக்கொடை முகாம்கள்',
      guide: 'வழிகாட்டி',
      about: 'எங்களைப்பற்றி',
      contact: 'தொடர்புகொள்ள',
      login: 'உள்நுழைவு',
      register: 'பதிவுசெய்க',
      dashboard: 'கட்டுப்பாட்டகம்',
      logout: 'வெளியேறு'
    },
    hero: {
      title: 'ஒவ்வொரு துளியும் ஒரு உயிரைக் காக்கும்',
      subtitle: 'இலங்கையில் யாழ்ப்பாண மாவட்டம் மற்றும் ஏனைய மாவட்டங்களில் நோயாளர்கள், மருத்துவமனைகள் மற்றும் தொண்டர் குருதிக்கொடையாளர்களை இணைக்கும் நவீன தளம்.',
      findDonorsNow: 'கொடையாளர்களைத் தேடுக',
      requestEmergencyBlood: 'அவசர குருதி கோரிக்கை',
      searchTitle: 'இலங்கையில் குருதிக்கொடையாளரைத் தேடுங்கள்',
      searchDesc: 'குருதிப் பிரிவு, மாகாணம், மாவட்டம் மற்றும் நகரம் வாரியாக சரிபார்க்கப்பட்ட கொடையாளர்களைக் கண்டறியுங்கள்.',
      selectBloodGroup: 'குருதிப் பிரிவைத் தேர்ந்தெடுக்கவும்',
      selectProvince: 'மாகாணத்தைத் தேர்ந்தெடுக்கவும்',
      selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
      selectCity: 'நகரத்தைத் தேர்ந்தெடுக்கவும்',
      allProvinces: 'அனைத்து மாகாணங்கள்',
      allDistricts: 'அனைத்து மாவட்டங்கள்',
      allCities: 'அனைத்து நகரங்கள்',
      searchDonors: 'தேடுங்கள்'
    },
    shortcuts: {
      findDonors: 'கொடையாளர்களைத் தேடுக',
      findDonorsDesc: 'அருகிலுள்ள சரிபார்க்கப்பட்ட தன்னார்வ கொடையாளர்கள்',
      requestBlood: 'குருதி கோரிக்கை',
      requestBloodDesc: 'மருத்துவமனை பதிவுடன் கூடிய அவசர கோரிக்கைகள்',
      camps: 'குருதிக்கொடை முகாம்கள்',
      campsDesc: 'யாழ்ப்பாணத்தில் நடைபெறவுள்ள சமூதாய முகாம்கள்',
      hotline: 'தேசிய குருதி சேவை 1923',
      hotlineDesc: 'இலங்கை தேசிய குருதி மாற்றீட்டுச் சேவை'
    },
    stats: {
      totalDonors: 'பதிவுசெய்த கொடையாளர்கள்',
      verifiedDonors: 'சரிபார்க்கப்பட்ட கொடையாளர்கள்',
      bloodRequests: 'நிறைவேற்றப்பட்ட கோரிக்கைகள்',
      campaigns: 'குருதிக்கொடை முகாம்கள்'
    },
    recentRequests: {
      title: 'சமீபத்திய அவசர குருதி கோரிக்கைகள்',
      subtitle: 'மருத்துவமனை உறுதிப்படுத்தல் மூலம் சரிபார்க்கப்பட்ட உண்மையான அவசர கோரிக்கைகள்.',
      unitsNeeded: 'தேவைப்படும் அலகுகள்',
      urgency: 'அவசரம்',
      hospital: 'மருத்துவமனை',
      respondHelp: 'உதவ முன்வருக',
      viewAll: 'அனைத்து கோரிக்கைகளையும் பார்க்க'
    },
    campaignSection: {
      title: 'வரவிருக்கும் குருதிக்கொடை முகாம்கள்',
      subtitle: 'யாழ்ப்பாணம் போதனா வைத்தியசாலை மற்றும் சுகாதார சேவைகளுடன் இணைந்து நடாத்தப்படும் முகாம்கள்.',
      registerCamp: 'முகாமிற்குப் பதிவுசெய்க',
      targetUnits: 'இலக்கு அலகுகள்'
    },
    mapSection: {
      title: 'நாடளாவிய குருதி வங்கி வலையமைப்பு',
      subtitle: 'யாழ்ப்பாண மாவட்டத்தை மையமாகக் கொண்ட ஊடாடும் வரைபடம்.'
    },
    guideSection: {
      title: 'குருதிப் பொருத்தப்பாடு மற்றும் தகைமை',
      subtitle: 'தேசிய குருதி மாற்றீட்டுச் சேவையின் மருத்துவ வழிகாட்டல்கள்.'
    },
    common: {
      loading: 'தரவு ஏற்றப்படுகிறது...',
      save: 'சேமிக்க',
      cancel: 'ரத்துசெய்க',
      submit: 'சமர்ப்பிக்க',
      status: 'நிலை',
      actions: 'செயல்கள்',
      date: 'திகதி',
      verified: 'சரிபார்க்கப்பட்டது',
      pending: 'சரிபார்ப்பு நிலுவையில்',
      available: 'குருதி வழங்கத் தயார்',
      unavailable: 'தற்காலிகமாக இயலாது',
      privacyNote: 'கொடையாளரின் தனியுரிமை பாதுகாக்கப்படுகிறது.'
    }
  }
};
