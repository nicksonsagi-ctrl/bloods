// Prisma Seed script for LifeLink (MySQL)
// Populates Sri Lankan provinces, districts, key cities, and reference hospitals (Jaffna Teaching Hospital, etc.)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SRI_LANKA_PROVINCES = [
  {
    name: 'Northern Province',
    districts: [
      {
        name: 'Jaffna',
        lat: 9.6615,
        lng: 80.0255,
        cities: ['Jaffna Town', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Tellippalai', 'Karainagar']
      },
      {
        name: 'Kilinochchi',
        lat: 9.3803,
        lng: 80.3770,
        cities: ['Kilinochchi Town', 'Paranthan', 'Poonakary']
      },
      {
        name: 'Mannar',
        lat: 8.9810,
        lng: 79.9044,
        cities: ['Mannar Town', 'Pesalai', 'Murunkan']
      },
      {
        name: 'Mullaitivu',
        lat: 9.2671,
        lng: 80.8145,
        cities: ['Mullaitivu Town', 'Puthukkudiyiruppu', 'Oddusuddan']
      },
      {
        name: 'Vavuniya',
        lat: 8.7514,
        lng: 80.4971,
        cities: ['Vavuniya Town', 'Cheddikulam', 'Nedunkeni']
      }
    ]
  },
  {
    name: 'Western Province',
    districts: [
      {
        name: 'Colombo',
        lat: 6.9271,
        lng: 79.8612,
        cities: ['Colombo 01-15', 'Dehiwala', 'Moratuwa', 'Kotte']
      },
      {
        name: 'Gampaha',
        lat: 7.0840,
        lng: 79.9943,
        cities: ['Gampaha Town', 'Negombo', 'Kelaniya']
      },
      {
        name: 'Kalutara',
        lat: 6.5854,
        lng: 79.9607,
        cities: ['Kalutara Town', 'Panadura', 'Horana']
      }
    ]
  },
  {
    name: 'Central Province',
    districts: [
      {
        name: 'Kandy',
        lat: 7.2906,
        lng: 80.6337,
        cities: ['Kandy City', 'Peradeniya', 'Gampola']
      },
      {
        name: 'Matale',
        lat: 7.4675,
        lng: 80.6234,
        cities: ['Matale Town', 'Dambulla']
      },
      {
        name: 'Nuwara Eliya',
        lat: 6.9497,
        lng: 80.7891,
        cities: ['Nuwara Eliya Town', 'Hatton']
      }
    ]
  }
];

const SRI_LANKA_HOSPITALS = [
  {
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
    name: 'National Hospital of Sri Lanka (NHSL), Colombo',
    district: 'Colombo',
    province: 'Western Province',
    type: 'Teaching Hospital',
    phone: '+94 11 269 1111',
    hasBloodBank: true,
    lat: 6.9197,
    lng: 79.8688
  }
];

async function main() {
  console.log('[Seed] Seeding Sri Lankan provinces, districts, and reference hospitals...');

  for (const prov of SRI_LANKA_PROVINCES) {
    const provinceRecord = await prisma.province.upsert({
      where: { name: prov.name },
      update: {},
      create: { name: prov.name }
    });

    for (const dist of prov.districts) {
      const districtRecord = await prisma.district.upsert({
        where: { name: dist.name },
        update: { lat: dist.lat, lng: dist.lng },
        create: {
          name: dist.name,
          provinceId: provinceRecord.id,
          lat: dist.lat,
          lng: dist.lng
        }
      });

      for (const cityName of dist.cities) {
        await prisma.city.upsert({
          where: {
            name_districtId: {
              name: cityName,
              districtId: districtRecord.id
            }
          },
          update: {},
          create: {
            name: cityName,
            districtId: districtRecord.id
          }
        });
      }
    }
  }

  for (const hosp of SRI_LANKA_HOSPITALS) {
    await prisma.hospital.create({
      data: hosp
    });
  }

  console.log('[Seed] Database reference data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
