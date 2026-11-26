import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { Destination } from '../entities/destination.entity';
import { AccommodationQueryDto } from './dto/accommodation-query.dto';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';

// Encapsulates TypeORM queries for accommodations and their destinations.
@Injectable()
export class AccommodationsRepository {
  constructor(
    @InjectRepository(Accommodation)
    private readonly accommodations: Repository<Accommodation>,
    @InjectRepository(Destination)
    private readonly destinations: Repository<Destination>,
  ) {}

  findAll(
    query: AccommodationQueryDto,
  ): Promise<[Accommodation[], number]> {
    const builder = this.accommodations.createQueryBuilder('accommodation');
    if (query.destinationId !== undefined) {
      builder.andWhere('accommodation.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }
    if (query.maxPrice !== undefined) {
      builder.andWhere('accommodation.pricePerNight <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    return builder
      .orderBy(
        query.sort === 'pricePerNight'
          ? 'accommodation.pricePerNight'
          : 'accommodation.accommodationId',
        'ASC',
      )
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  findById(accommodationId: number): Promise<Accommodation | null> {
    return this.accommodations.findOneBy({ accommodationId });
  }

  destinationExists(destinationId: number): Promise<boolean> {
    return this.destinations.existsBy({ destinationId });
  }

  create(dto: CreateAccommodationDto): Promise<Accommodation> {
    return this.accommodations.save(this.accommodations.create(dto));
  }

  save(accommodation: Accommodation): Promise<Accommodation> {
    return this.accommodations.save(accommodation);
  }

  async delete(accommodationId: number): Promise<void> {
    await this.accommodations.delete(accommodationId);
  }
}
