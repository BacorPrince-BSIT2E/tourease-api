import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Itinerary } from '../entities/itinerary.entity';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryQueryDto } from './dto/itinerary-query.dto';

// Encapsulates database access to user-owned itineraries.
@Injectable()
export class ItinerariesRepository {
  constructor(
    @InjectRepository(Itinerary)
    private readonly itineraries: Repository<Itinerary>,
  ) {}

  findAll(
    userId: number,
    query: ItineraryQueryDto,
  ): Promise<[Itinerary[], number]> {
    const builder = this.itineraries
      .createQueryBuilder('itinerary')
      .where('itinerary.userId = :userId', { userId });

    return builder
      .orderBy(
        query.sort === 'startDate'
          ? 'itinerary.startDate'
          : 'itinerary.itineraryId',
        'ASC',
      )
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  findById(itineraryId: number): Promise<Itinerary | null> {
    return this.itineraries.findOneBy({ itineraryId });
  }

  findOne(itineraryId: number): Promise<Itinerary | null> {
    return this.itineraries.findOne({ where: { itineraryId } });
  }

  create(
    userId: number,
    itineraryData: CreateItineraryDto,
  ): Promise<Itinerary> {
    const itinerary = this.itineraries.create({
      userId,
      itineraryName: itineraryData.itineraryName,
      startDate: itineraryData.startDate,
      endDate: itineraryData.endDate,
    });
    return this.itineraries.save(itinerary);
  }

  save(itinerary: Itinerary): Promise<Itinerary> {
    return this.itineraries.save(itinerary);
  }

  async delete(itineraryId: number): Promise<void> {
    await this.itineraries.delete(itineraryId);
  }
}
