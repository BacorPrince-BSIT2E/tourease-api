import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Destination } from './destination.entity';
import { Itinerary } from './itinerary.entity';

// Links itineraries to destinations and tracks each stop.
@Entity('itinerary_destinations')
@Unique(['itineraryId', 'visitOrder'])
export class ItineraryDestination {
  @PrimaryGeneratedColumn()
  itineraryDestinationId: number;

  @Column()
  itineraryId: number;

  @Column()
  destinationId: number;

  @Column({ type: 'date' })
  visitDate: string;

  @Column({ type: 'int' })
  visitOrder: number;

  // Many destination entries belong to one itinerary.
  @ManyToOne(() => Itinerary, (itinerary) => itinerary.itineraryDestinations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itineraryId' })
  itinerary: Itinerary;

  // Many itinerary entries can reference one destination.
  @ManyToOne(
    () => Destination,
    (destination) => destination.itineraryDestinations,
  )
  @JoinColumn({ name: 'destinationId' })
  destination: Destination;
}
