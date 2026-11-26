import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from '../entities/destination.entity';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { CreateItineraryDestinationDto } from './dto/create-itinerary-destination.dto';

// Encapsulates queries for stop entries scoped to an itinerary.
@Injectable()
export class ItineraryDestinationsRepository {
  constructor(
    @InjectRepository(ItineraryDestination)
    private readonly entries: Repository<ItineraryDestination>,
    @InjectRepository(Destination)
    private readonly destinations: Repository<Destination>,
  ) {}

  findByItinerary(itineraryId: number): Promise<ItineraryDestination[]> {
    return this.entries.find({
      where: { itineraryId },
      order: { visitOrder: 'ASC' },
    });
  }

  findByIdInItinerary(
    itineraryDestinationId: number,
    itineraryId: number,
  ): Promise<ItineraryDestination | null> {
    return this.entries.findOneBy({ itineraryDestinationId, itineraryId });
  }

  findByVisitOrder(
    itineraryId: number,
    visitOrder: number,
  ): Promise<ItineraryDestination | null> {
    return this.entries.findOneBy({ itineraryId, visitOrder });
  }

  destinationExists(destinationId: number): Promise<boolean> {
    return this.destinations.existsBy({ destinationId });
  }

  create(
    itineraryId: number,
    dto: CreateItineraryDestinationDto,
  ): Promise<ItineraryDestination> {
    const entry = this.entries.create({
      itineraryId,
      destinationId: dto.destinationId,
      visitDate: dto.visitDate,
      visitOrder: dto.visitOrder,
    });
    return this.entries.save(entry);
  }

  save(entry: ItineraryDestination): Promise<ItineraryDestination> {
    return this.entries.save(entry);
  }

  async delete(itineraryDestinationId: number): Promise<void> {
    await this.entries.delete(itineraryDestinationId);
  }
}
