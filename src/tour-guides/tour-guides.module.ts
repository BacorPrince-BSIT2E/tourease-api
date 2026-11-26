import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from '../entities/destination.entity';
import { TourGuide } from '../entities/tour-guide.entity';
import { TourGuidesController } from './tour-guides.controller';
import { TourGuidesRepository } from './tour-guides.repository';
import { TourGuidesService } from './tour-guides.service';

// Registers tour-guide persistence, business logic, and HTTP endpoints.
@Module({
  imports: [TypeOrmModule.forFeature([TourGuide, Destination])],
  controllers: [TourGuidesController],
  providers: [TourGuidesRepository, TourGuidesService],
})
export class TourGuidesModule {}
