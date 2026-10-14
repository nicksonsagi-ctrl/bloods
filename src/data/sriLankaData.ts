export interface District {
  name: string;
  province: string;
  lat: number;
  lng: number;
  cities: string[];
}

export interface HospitalRecord {
  id: string;
  name: string;
  district: string;
  province: string;
  type: 'Teaching Hospital' | 'Provincial General' | 'Base Hospital' | 'Specialized';
  phone: string;
  hasBloodBank: boolean;
  lat: number;
  lng: number;
}

export const SRI_LANKA_PROVINCES = [
  'Northern Province',
  'Western Province',
  'Central Province',
  'Southern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

export const SRI_LANKA_DISTRICTS: Record<string, District> = {
  'Jaffna': {
    name: 'Jaffna',
    province: 'Northern Province',
    lat: 9.6615,
    lng: 80.0255,
    cities: ['Jaffna Town', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Tellippalai', 'Karainagar', 'Valvettithurai', 'Kankesanthurai', 'Kopay', 'Manipay']
  },
  'Kilinochchi': {
    name: 'Kilinochchi',
    province: 'Northern Province',
    lat: 9.3803,
    lng: 80.3770,
    cities: ['Kilinochchi Town', 'Paranthan', 'Poonakary', 'Pallai']
  },
  'Mannar': {
    name: 'Mannar',
    province: 'Northern Province',
    lat: 8.9810,
    lng: 79.9044,
    cities: ['Mannar Town', 'Pesalai', 'Murunkan', 'Nanattan']
  },
  'Mullaitivu': {
    name: 'Mullaitivu',
    province: 'Northern Province',
    lat: 9.2671,
    lng: 80.8145,
    cities: ['Mullaitivu Town', 'Puthukkudiyiruppu', 'Oddusuddan', 'Mulliyawalai']
  },
  'Vavuniya': {
    name: 'Vavuniya',
    province: 'Northern Province',
    lat: 8.7514,
    lng: 80.4971,
    cities: ['Vavuniya Town', 'Cheddikulam', 'Nedunkeni', 'Puliyankulam']
  },
  'Colombo': {
    name: 'Colombo',
    province: 'Western Province',
    lat: 6.9271,
    lng: 79.8612,
    cities: ['Colombo 01-15', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Kotte', 'Nugegoda', 'Maharagama', 'Homagama']
  },
  'Gampaha': {
    name: 'Gampaha',
    province: 'Western Province',
    lat: 7.0840,
    lng: 79.9943,
    cities: ['Gampaha Town', 'Negombo', 'Kelaniya', 'Ja-Ela', 'Wattala', 'Kadawatha']
  },
  'Kalutara': {
    name: 'Kalutara',
    province: 'Western Province',
    lat: 6.5854,
    lng: 79.9607,
    cities: ['Kalutara Town', 'Panadura', 'Horana', 'Beruwala', 'Matugama']
  },
  'Kandy': {
    name: 'Kandy',
    province: 'Central Province',
    lat: 7.2906,
    lng: 80.6337,
    cities: ['Kandy City', 'Peradeniya', 'Katugastota', 'Gampola', 'Kundasale']
  },
  'Matale': {
    name: 'Matale',
    province: 'Central Province',
    lat: 7.4675,
    lng: 80.6234,
    cities: ['Matale Town', 'Dambulla', 'Galewela', 'Ukuwela']
  },
  'Nuwara Eliya': {
    name: 'Nuwara Eliya',
    province: 'Central Province',
    lat: 6.9497,
    lng: 80.7891,
    cities: ['Nuwara Eliya Town', 'Hatton', 'Talawakele', 'Ginigathena']
  },
  'Galle': {
    name: 'Galle',
    province: 'Southern Province',
    lat: 6.0535,
    lng: 80.2210,
    cities: ['Galle Fort', 'Karapitiya', 'Hikkaduwa', 'Ambalangoda', 'Baddegama']
  },
  'Matara': {
    name: 'Matara',
    province: 'Southern Province',
    lat: 5.9549,
    lng: 80.5550,
    cities: ['Matara Town', 'Weligama', 'Akuressa', 'Dikwella']
  },
  'Hambantota': {
    name: 'Hambantota',
    province: 'Southern Province',
    lat: 6.1429,
    lng: 81.1212,
    cities: ['Hambantota Town', 'Tangalle', 'Tissamaharama', 'Ambalantota']
  },
  'Batticaloa': {
    name: 'Batticaloa',
    province: 'Eastern Province',
    lat: 7.7310,
    lng: 81.6747,
    cities: ['Batticaloa Town', 'Kattankudy', 'Eravur', 'Valaichchenai']
  },
  'Ampara': {
    name: 'Ampara',
    province: 'Eastern Province',
    lat: 7.2912,
    lng: 81.6724,
    cities: ['Ampara Town', 'Kalmunai', 'Sammanthurai', 'Akkaraipattu']
  },
  'Trincomalee': {
    name: 'Trincomalee',
    province: 'Eastern Province',
    lat: 8.5874,
    lng: 81.2152,
    cities: ['Trincomalee Town', 'Kinniya', 'Muttur', 'Kantale']
  },
  'Kurunegala': {
    name: 'Kurunegala',
    province: 'North Western Province',
    lat: 7.4863,
    lng: 80.3623,
    cities: ['Kurunegala Town', 'Kuliyapitiya', 'Narammala', 'Pannala']
  },
  'Puttalam': {
    name: 'Puttalam',
    province: 'North Western Province',
    lat: 8.0408,
    lng: 79.8394,
    cities: ['Puttalam Town', 'Chilaw', 'Marawila', 'Wennappuwa']
  },
  'Anuradhapura': {
    name: 'Anuradhapura',
    province: 'North Central Province',
    lat: 8.3114,
    lng: 80.4037,
    cities: ['Anuradhapura Town', 'Medawachchiya', 'Kekirawa', 'Tambuttegama']
  },
  'Polonnaruwa': {
    name: 'Polonnaruwa',
    province: 'North Central Province',
    lat: 7.9403,
    lng: 81.0188,
    cities: ['Polonnaruwa Town', 'Kaduruwela', 'Hingurakgoda', 'Medirigiriya']
  },
  'Badulla': {
    name: 'Badulla',
    province: 'Uva Province',
    lat: 6.9934,
    lng: 81.0550,
    cities: ['Badulla Town', 'Bandarawela', 'Haputale', 'Mahiyanganaya', 'Welimada']
  },
  'Monaragala': {
    name: 'Monaragala',
    province: 'Uva Province',
    lat: 6.8728,
    lng: 81.3507,
    cities: ['Monaragala Town', 'Wellawaya', 'Bibile', 'Buttala']
  },
  'Ratnapura': {
    name: 'Ratnapura',
    province: 'Sabaragamuwa Province',
    lat: 6.7056,
    lng: 80.3847,
    cities: ['Ratnapura Town', 'Pelmadulla', 'Balangoda', 'Embilipitiya']
  },
  'Kegalle': {
    name: 'Kegalle',
    province: 'Sabaragamuwa Province',
    lat: 7.2513,
    lng: 80.3464,
    cities: ['Kegalle Town', 'Mawanella', 'Warakapola', 'Rambukkana']
  }
};

export const SRI_LANKA_HOSPITALS: HospitalRecord[] = [
  {
    id: 'hosp-001',
    name: 'Teaching Hospital Jaffna',
    district: 'Jaffna',
    province: 'Northern Province',
    type: 'Teaching Hospital',
    phone: '+94 21 222 2261',
    hasBloodBank: true,
    lat: 9.6644,
    lng: 80.0177
  },
  {
    id: 'hosp-002',
    name: 'Tellippalai Trail Cancer Hospital',
    district: 'Jaffna',
    province: 'Northern Province',
    type: 'Specialized',
    phone: '+94 21 225 5224',
    hasBloodBank: true,
    lat: 9.7712,
    lng: 80.0384
  },
  {
    id: 'hosp-003',
    name: 'Base Hospital Point Pedro',
    district: 'Jaffna',
    province: 'Northern Province',
    type: 'Base Hospital',
    phone: '+94 21 226 2261',
    hasBloodBank: true,
    lat: 9.8242,
    lng: 80.2341
  },
  {
    id: 'hosp-004',
    name: 'Base Hospital Chavakachcheri',
    district: 'Jaffna',
    province: 'Northern Province',
    type: 'Base Hospital',
    phone: '+94 21 227 2261',
    hasBloodBank: true,
    lat: 9.6582,
    lng: 80.1558
  },
  {
    id: 'hosp-005',
    name: 'District General Hospital Kilinochchi',
    district: 'Kilinochchi',
    province: 'Northern Province',
    type: 'Provincial General',
    phone: '+94 21 228 5326',
    hasBloodBank: true,
    lat: 9.3905,
    lng: 80.4012
  },
  {
    id: 'hosp-006',
    name: 'National Hospital of Sri Lanka (NHSL), Colombo',
    district: 'Colombo',
    province: 'Western Province',
    type: 'Teaching Hospital',
    phone: '+94 11 269 1111',
    hasBloodBank: true,
    lat: 6.9197,
    lng: 79.8688
  },
  {
    id: 'hosp-007',
    name: 'National Blood Transfusion Service (NBTS) Blood Center, Narahenpita',
    district: 'Colombo',
    province: 'Western Province',
    type: 'Specialized',
    phone: '+94 11 269 8891',
    hasBloodBank: true,
    lat: 6.8943,
    lng: 79.8823
  },
  {
    id: 'hosp-008',
    name: 'National Hospital Kandy',
    district: 'Kandy',
    province: 'Central Province',
    type: 'Teaching Hospital',
    phone: '+94 81 222 2261',
    hasBloodBank: true,
    lat: 7.2882,
    lng: 80.6274
  },
  {
    id: 'hosp-009',
    name: 'Teaching Hospital Karapitiya, Galle',
    district: 'Galle',
    province: 'Southern Province',
    type: 'Teaching Hospital',
    phone: '+94 91 223 2250',
    hasBloodBank: true,
    lat: 6.0683,
    lng: 80.2294
  },
  {
    id: 'hosp-010',
    name: 'Teaching Hospital Batticaloa',
    district: 'Batticaloa',
    province: 'Eastern Province',
    type: 'Teaching Hospital',
    phone: '+94 65 222 2261',
    hasBloodBank: true,
    lat: 7.7183,
    lng: 81.7011
  }
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canGiveTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-']
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-']
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-']
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-']
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-']
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-']
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-']
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  }
};
