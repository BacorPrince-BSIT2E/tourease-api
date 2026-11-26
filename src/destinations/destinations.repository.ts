import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { Destination } from '../entities/destination.entity';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { TourGuide } from '../entities/tour-guide.entity';
import { DestinationQueryDto } from './dto/destination-query.dto';

// Encapsulates destination queries and checks dependent records before deletion.
@Injectable()
export class DestinationsRepository {
  constructor(
    @InjectRepository(Destination)
    private readonly destinations: Repository<Destination>,
    @InjectRepository(TourGuide)
    private readonly tourGuides: Repository<TourGuide>,
    @InjectRepository(Accommodation)
    private readonly accommodations: Repository<Accommodation>,
    @InjectRepository(ItineraryDestination)
    private readonly itineraryDestinations: Repository<ItineraryDestination>,
  ) {}

  findAll(query: DestinationQueryDto): Promise<[Destination[], number]> {
    const builder = this.destinations.createQueryBuilder('destination');

    if (query.q !== undefined) {
      builder.andWhere('destination.destinationName LIKE :q', {
        q: `%${query.q}%`,
      });
    }
    if (query.maxFee !== undefined) {
      builder.andWhere('destination.entranceFee <= :maxFee', {
        maxFee: query.maxFee,
      });
    }

    const sortColumn =
      query.sort === 'destinationName'
        ? 'destination.destinationName'
        : query.sort === 'entranceFee'
          ? 'destination.entranceFee'
          : 'destination.destinationId';

    return builder
      .orderBy(sortColumn, 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  findById(destinationId: number): Promise<Destination | null> {
    return this.destinations.findOneBy({ destinationId });
  }

  create(destination: Partial<Destination>): Promise<Destination> {
    return this.destinations.save(this.destinations.create(destination));
  }

  save(destination: Destination): Promise<Destination> {
    return this.destinations.save(destination);
  }

  async hasReferences(destinationId: number): Promise<boolean> {
    const [guideCount, accommodationCount, itineraryDestinationCount] =
      await Promise.all([
        this.tourGuides.countBy({ destinationId }),
        this.accommodations.countBy({ destinationId }),
        this.itineraryDestinations.countBy({ destinationId }),
      ]);
    return guideCount > 0 || accommodationCount > 0 || itineraryDestinationCount > 0;
  }

  async delete(destinationId: number): Promise<void> {
    await this.destinations.delete(destinationId);
  }
}
