import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Itinerary } from './itinerary.entity';

// Stores the accounts that can use TourEase.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['Tourist', 'Staff', 'Guide', 'Admin'],
    default: 'Tourist',
  })
  userRole: 'Tourist' | 'Staff' | 'Guide' | 'Admin';

  @CreateDateColumn()
  dateRegistered: Date;

  // One user owns many itineraries.
  @OneToMany(() => Itinerary, (itinerary) => itinerary.user)
  itineraries: Itinerary[];
}
