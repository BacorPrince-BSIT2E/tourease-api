import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from '../entities/destination.entity';
import { TourGuide } from '../entities/tour-guide.entity';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { TourGuideQueryDto } from './dto/tour-guide-query.dto';

// Encapsulates TypeORM queries for tour guides and their destination records.
@Injectable()
export class TourGuidesRepository {
  constructor(
    @InjectRepository(TourGuide)
    private readonly tourGuides: Repository<TourGuide>,
    @InjectRepository(Destination)
    private readonly destinations: Repository<Destination>,
  ) {}

  findAll(query: TourGuideQueryDto): Promise<[TourGuide[], number]> {
    const builder = this.tourGuides.createQueryBuilder('tourGuide');
    if (query.destinationId !== undefined) {
      builder.andWhere('tourGuide.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }
    if (query.specialization !== undefined) {
      builder.andWhere('tourGuide.specialization = :specialization', {
        specialization: query.specialization,
      });
    }

    return builder
      .orderBy('tourGuide.guideId', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  findById(guideId: number): Promise<TourGuide | null> {
    return this.tourGuides.findOneBy({ guideId });
  }

  findByEmail(email: string): Promise<TourGuide | null> {
    return this.tourGuides.findOneBy({ email });
  }

  destinationExists(destinationId: number): Promise<boolean> {
    return this.destinations.existsBy({ destinationId });
  }

  create(dto: CreateTourGuideDto): Promise<TourGuide> {
    return this.tourGuides.save(this.tourGuides.create(dto));
  }

  save(tourGuide: TourGuide): Promise<TourGuide> {
    return this.tourGuides.save(tourGuide);
  }

  async delete(guideId: number): Promise<void> {
    await this.tourGuides.delete(guideId);
  }
}
