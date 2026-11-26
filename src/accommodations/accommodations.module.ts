import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { Destination } from '../entities/destination.entity';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsRepository } from './accommodations.repository';
import { AccommodationsService } from './accommodations.service';

// Registers accommodation persistence, business logic, and HTTP endpoints.
@Module({
  imports: [TypeOrmModule.forFeature([Accommodation, Destination])],
  controllers: [AccommodationsController],
  providers: [AccommodationsRepository, AccommodationsService],
})
export class AccommodationsModule {}
