import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItineraryDestination } from './itinerary-destination.entity';
import { User } from './user.entity';

// Stores travel plans created by users.
@Entity('itineraries')
export class Itinerary {
  @PrimaryGeneratedColumn()
  itineraryId: number;

  @Column()
  userId: number;

  @Column({ length: 150 })
  itineraryName: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @CreateDateColumn()
  dateCreated: Date;

  // Many itineraries belong to one user.
  @ManyToOne(() => User, (user) => user.itineraries)
  @JoinColumn({ name: 'userId' })
  user: User;

  // One itinerary contains many destination entries.
  @OneToMany(
    () => ItineraryDestination,
    (itineraryDestination) => itineraryDestination.itinerary,
  )
  itineraryDestinations: ItineraryDestination[];
}
