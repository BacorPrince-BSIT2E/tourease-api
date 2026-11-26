import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { Destination } from './destination.entity';

const numberTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};

// Stores lodging options near destinations.
@Entity('accommodations')
export class Accommodation {
  @PrimaryGeneratedColumn()
  accommodationId: number;

  @Column()
  destinationId: number;

  @Column({ length: 150 })
  accommodationName: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 20 })
  contactNumber: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: numberTransformer,
  })
  pricePerNight: number;

  // Many accommodations belong to one destination.
  @ManyToOne(() => Destination, (destination) => destination.accommodations)
  @JoinColumn({ name: 'destinationId' })
  destination: Destination;
}
