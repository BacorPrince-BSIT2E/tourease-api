import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Destination } from './destination.entity';

// Stores tour guides and their assigned destination.
@Entity('tour_guides')
export class TourGuide {
  @PrimaryGeneratedColumn()
  guideId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 100 })
  specialization: string;

  @Column()
  destinationId: number;

  // Many tour guides belong to one destination.
  @ManyToOne(() => Destination, (destination) => destination.tourGuides)
  @JoinColumn({ name: 'destinationId' })
  destination: Destination;
}
