import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { Accommodation } from './accommodation.entity';
import { ItineraryDestination } from './itinerary-destination.entity';
import { TourGuide } from './tour-guide.entity';

const numberTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};

// Stores destinations available in the tourism system.
@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn()
  destinationId: number;

  @Column({ length: 150 })
  destinationName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, transformer: numberTransformer })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, transformer: numberTransformer })
  longitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numberTransformer,
  })
  entranceFee: number;

  // One destination can have many tour guides.
  @OneToMany(() => TourGuide, (tourGuide) => tourGuide.destination)
  tourGuides: TourGuide[];

  // One destination can have many accommodations.
  @OneToMany(() => Accommodation, (accommodation) => accommodation.destination)
  accommodations: Accommodation[];

  // One destination can appear in many itinerary entries.
  @OneToMany(
    () => ItineraryDestination,
    (itineraryDestination) => itineraryDestination.destination,
  )
  itineraryDestinations: ItineraryDestination[];
}
