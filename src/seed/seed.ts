import { ConfigModule } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { Destination } from '../entities/destination.entity';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { Itinerary } from '../entities/itinerary.entity';
import { TourGuide } from '../entities/tour-guide.entity';
import { User } from '../entities/user.entity';

type DemoUser = {
  fullName: string;
  email: string;
  password: string;
  userRole: User['userRole'];
};

const demoUsers: DemoUser[] = [
  {
    fullName: 'TourEase Administrator',
    email: 'admin@tourease.test',
    password: 'Admin123!',
    userRole: 'Admin',
  },
  {
    fullName: 'TourEase Staff',
    email: 'staff@tourease.test',
    password: 'Staff123!',
    userRole: 'Staff',
  },
  {
    fullName: 'Sample Tourist',
    email: 'tourist@tourease.test',
    password: 'Tourist123!',
    userRole: 'Tourist',
  },
];

const destinationSeeds = [
  {
    key: 'peoples-park',
    destinationName: "People's Park in the Sky",
    description: 'A scenic mountaintop park with panoramic views of Taal Lake.',
    address: "People's Park Road, Tagaytay, Cavite",
    latitude: 14.1626,
    longitude: 120.9545,
    entranceFee: 100,
  },
  {
    key: 'picnic-grove',
    destinationName: 'Picnic Grove',
    description: 'A lakeside recreation area with picnic spots and walking trails.',
    address: 'Picnic Grove Complex, Tagaytay, Cavite',
    latitude: 14.1193,
    longitude: 120.9534,
    entranceFee: 75,
  },
  {
    key: 'sky-ranch',
    destinationName: 'Sky Ranch',
    description: 'A family amusement park with rides and views of Taal Volcano.',
    address: 'Km. 60, Tagaytay-Nasugbu Highway, Tagaytay, Cavite',
    latitude: 14.1018,
    longitude: 120.9447,
    entranceFee: 100,
  },
  {
    key: 'taal-viewpoint',
    destinationName: 'Taal Volcano Viewpoint',
    description: 'A popular ridge viewpoint overlooking Taal Lake and Volcano.',
    address: 'Tagaytay-Nasugbu Highway, Tagaytay, Cavite',
    latitude: 14.1011,
    longitude: 120.9412,
    entranceFee: 0,
  },
  {
    key: 'tagaytay-highlands',
    destinationName: 'Tagaytay Highlands',
    description: 'A mountain resort destination with cool-weather scenery.',
    address: 'Tagaytay-Calamba Road, Tagaytay, Cavite',
    latitude: 14.0872,
    longitude: 121.0124,
    entranceFee: 250,
  },
];

const tourGuideSeeds = [
  {
    fullName: 'Maria Santos',
    email: 'maria.guide@tourease.test',
    phoneNumber: '09171234567',
    specialization: 'Nature and viewpoint tours',
    destinationKey: 'peoples-park',
  },
  {
    fullName: 'Jose Reyes',
    email: 'jose.guide@tourease.test',
    phoneNumber: '09181234567',
    specialization: 'Family attractions',
    destinationKey: 'sky-ranch',
  },
  {
    fullName: 'Ana Cruz',
    email: 'ana.guide@tourease.test',
    phoneNumber: '09191234567',
    specialization: 'Local history and food',
    destinationKey: 'picnic-grove',
  },
];

const accommodationSeeds = [
  {
    destinationKey: 'peoples-park',
    accommodationName: 'Ridgeview Garden Inn',
    address: 'Aguinaldo Highway, Tagaytay, Cavite',
    contactNumber: '0464131001',
    pricePerNight: 3200,
  },
  {
    destinationKey: 'picnic-grove',
    accommodationName: 'Picnic Grove Suites',
    address: 'Santa Rosa-Tagaytay Road, Tagaytay, Cavite',
    contactNumber: '0464131002',
    pricePerNight: 2800,
  },
  {
    destinationKey: 'sky-ranch',
    accommodationName: 'Skyline Tagaytay Hotel',
    address: 'Tagaytay-Nasugbu Highway, Tagaytay, Cavite',
    contactNumber: '0464131003',
    pricePerNight: 4500,
  },
  {
    destinationKey: 'taal-viewpoint',
    accommodationName: 'Taal View Cottage',
    address: 'Mahogany Avenue, Tagaytay, Cavite',
    contactNumber: '0464131004',
    pricePerNight: 3600,
  },
];

function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function requiredDestination(
  destinations: Map<string, Destination>,
  key: string,
): Destination {
  const destination = destinations.get(key);
  if (!destination) {
    throw new Error(`Seed destination "${key}" is unavailable.`);
  }
  return destination;
}

async function seedData(manager: EntityManager) {
  const created = {
    users: 0,
    destinations: 0,
    tourGuides: 0,
    accommodations: 0,
    itineraries: 0,
    itineraryStops: 0,
  };

  const usersRepository = manager.getRepository(User);
  const usersByEmail = new Map<string, User>();
  for (const demoUser of demoUsers) {
    let user = await usersRepository.findOneBy({ email: demoUser.email });
    if (!user) {
      user = usersRepository.create({
        fullName: demoUser.fullName,
        email: demoUser.email,
        passwordHash: await bcrypt.hash(demoUser.password, 10),
        userRole: demoUser.userRole,
      });
      user = await usersRepository.save(user);
      created.users += 1;
    }
    usersByEmail.set(demoUser.email, user);
  }

  const destinationsRepository = manager.getRepository(Destination);
  const destinationsByKey = new Map<string, Destination>();
  for (const seed of destinationSeeds) {
    let destination = await destinationsRepository.findOneBy({
      destinationName: seed.destinationName,
    });
    if (!destination) {
      const { key: _key, ...destinationData } = seed;
      destination = await destinationsRepository.save(
        destinationsRepository.create(destinationData),
      );
      created.destinations += 1;
    }
    destinationsByKey.set(seed.key, destination);
  }

  const tourGuidesRepository = manager.getRepository(TourGuide);
  for (const seed of tourGuideSeeds) {
    const existing = await tourGuidesRepository.findOneBy({
      email: seed.email,
    });
    if (existing) {
      continue;
    }

    const { destinationKey, ...guideData } = seed;
    await tourGuidesRepository.save(
      tourGuidesRepository.create({
        ...guideData,
        destinationId: requiredDestination(destinationsByKey, destinationKey)
          .destinationId,
      }),
    );
    created.tourGuides += 1;
  }

  const accommodationsRepository = manager.getRepository(Accommodation);
  for (const seed of accommodationSeeds) {
    const existing = await accommodationsRepository.findOneBy({
      accommodationName: seed.accommodationName,
    });
    if (existing) {
      continue;
    }

    const { destinationKey, ...accommodationData } = seed;
    await accommodationsRepository.save(
      accommodationsRepository.create({
        ...accommodationData,
        destinationId: requiredDestination(destinationsByKey, destinationKey)
          .destinationId,
      }),
    );
    created.accommodations += 1;
  }

  const tourist = usersByEmail.get('tourist@tourease.test');
  if (!tourist) {
    throw new Error('The sample tourist user is unavailable.');
  }

  const itinerariesRepository = manager.getRepository(Itinerary);
  const itineraryName = 'Tagaytay Weekend Escape';
  let itinerary = await itinerariesRepository.findOneBy({
    userId: tourist.userId,
    itineraryName,
  });
  if (!itinerary) {
    itinerary = await itinerariesRepository.save(
      itinerariesRepository.create({
        userId: tourist.userId,
        itineraryName,
        startDate: dateOffset(1),
        endDate: dateOffset(3),
      }),
    );
    created.itineraries += 1;
  }

  const stopSeeds = [
    { destinationKey: 'peoples-park', visitDate: itinerary.startDate, visitOrder: 1 },
    {
      destinationKey: 'picnic-grove',
      visitDate: addDays(itinerary.startDate, 1),
      visitOrder: 2,
    },
    { destinationKey: 'taal-viewpoint', visitDate: itinerary.endDate, visitOrder: 3 },
  ];
  const stopsRepository = manager.getRepository(ItineraryDestination);
  for (const seed of stopSeeds) {
    const existing = await stopsRepository.findOneBy({
      itineraryId: itinerary.itineraryId,
      visitOrder: seed.visitOrder,
    });
    if (existing) {
      continue;
    }

    await stopsRepository.save(
      stopsRepository.create({
        itineraryId: itinerary.itineraryId,
        destinationId: requiredDestination(
          destinationsByKey,
          seed.destinationKey,
        ).destinationId,
        visitDate: seed.visitDate,
        visitOrder: seed.visitOrder,
      }),
    );
    created.itineraryStops += 1;
  }

  return created;
}

async function main(): Promise<void> {
  await ConfigModule.forRoot({ isGlobal: true });

  const { DB_HOST, DB_USERNAME, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USERNAME || !DB_NAME) {
    throw new Error('DB_HOST, DB_USERNAME, and DB_NAME must be set in .env.');
  }

  const dataSource = new DataSource({
    type: 'mysql',
    host: DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    username: DB_USERNAME,
    password: process.env.DB_PASSWORD ?? '',
    database: DB_NAME,
    entities: [
      User,
      Destination,
      TourGuide,
      Accommodation,
      Itinerary,
      ItineraryDestination,
    ],
    synchronize: false,
  });

  await dataSource.initialize();
  try {
    const created = await dataSource.transaction(seedData);
    console.log(
      `Seed complete. Created ${created.users} users, ${created.destinations} destinations, ${created.tourGuides} tour guides, ${created.accommodations} accommodations, ${created.itineraries} itineraries, and ${created.itineraryStops} itinerary stops.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
