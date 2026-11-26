import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { JwtPayload } from '../auth/auth.types';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { CreateItineraryDestinationDto } from './dto/create-itinerary-destination.dto';
import { UpdateItineraryDestinationDto } from './dto/update-itinerary-destination.dto';
import { ItinerariesService } from './itineraries.service';
import { ItineraryDestinationsRepository } from './itinerary-destinations.repository';

// Enforces itinerary access and visit-order uniqueness for nested stops.
@Injectable()
export class ItineraryDestinationsService {
  constructor(
    private readonly itineraryDestinations: ItineraryDestinationsRepository,
    private readonly itinerariesService: ItinerariesService,
  ) {}

  async findAll(itineraryId: number, requester: JwtPayload) {
    await this.itinerariesService.findAccessible(itineraryId, requester);
    const entries =
      await this.itineraryDestinations.findByItinerary(itineraryId);
    return {
      success: true,
      destinations: entries.map((entry) => this.toResponse(entry)),
    };
  }

  async create(
    itineraryId: number,
    userId: number,
    dto: CreateItineraryDestinationDto,
  ) {
    await this.itinerariesService.findOwned(itineraryId, userId);

    if (
      !(await this.itineraryDestinations.destinationExists(dto.destinationId))
    ) {
      throw new BadRequestException('Destination not found.');
    }
    if (
      await this.itineraryDestinations.findByVisitOrder(
        itineraryId,
        dto.visitOrder,
      )
    ) {
      throw new ConflictException('Visit order is already used.');
    }

    try {
      const saved = await this.itineraryDestinations.create(itineraryId, dto);
      const entry = await this.itineraryDestinations.findByIdInItinerary(
        saved.itineraryDestinationId,
        itineraryId,
      );
      if (!entry) {
        throw new NotFoundException('Itinerary destination not found.');
      }
      return this.toResponse(entry);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Visit order is already used.');
      }
      if (this.isMissingReference(error)) {
        throw new BadRequestException('Destination not found.');
      }
      throw error;
    }
  }

  async update(
    itineraryId: number,
    entryId: number,
    userId: number,
    dto: UpdateItineraryDestinationDto,
  ) {
    await this.itinerariesService.findOwned(itineraryId, userId);
    const entry = await this.findEntry(itineraryId, entryId);

    if (
      dto.visitOrder !== undefined &&
      dto.visitOrder !== entry.visitOrder &&
      (await this.itineraryDestinations.findByVisitOrder(
        itineraryId,
        dto.visitOrder,
      ))
    ) {
      throw new ConflictException('Visit order is already used.');
    }

    Object.assign(entry, dto);
    try {
      await this.itineraryDestinations.save(entry);
      const reloaded = await this.itineraryDestinations.findByIdInItinerary(
        entry.itineraryDestinationId,
        itineraryId,
      );
      if (!reloaded) {
        throw new NotFoundException('Itinerary destination not found.');
      }
      return this.toResponse(reloaded);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Visit order is already used.');
      }
      throw error;
    }
  }

  async remove(
    itineraryId: number,
    entryId: number,
    userId: number,
  ): Promise<void> {
    await this.itinerariesService.findOwned(itineraryId, userId);
    const entry = await this.findEntry(itineraryId, entryId);
    await this.itineraryDestinations.delete(entry.itineraryDestinationId);
  }

  private async findEntry(
    itineraryId: number,
    entryId: number,
  ): Promise<ItineraryDestination> {
    const entry = await this.itineraryDestinations.findByIdInItinerary(
      entryId,
      itineraryId,
    );
    if (!entry) {
      throw new NotFoundException('Itinerary destination not found.');
    }
    return entry;
  }

  private toResponse(entry: ItineraryDestination) {
    return {
      itineraryDestinationId: entry.itineraryDestinationId,
      itineraryId: entry.itineraryId,
      destinationId: entry.destinationId,
      visitDate: this.formatDate(entry.visitDate),
      visitOrder: entry.visitOrder,
    };
  }

  private formatDate(
    value: string | Date | null | undefined,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value instanceof Date
      ? value.toISOString().slice(0, 10)
      : value.slice(0, 10);
  }

  private isDuplicateEntry(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === 'ER_DUP_ENTRY'
    );
  }

  private isMissingReference(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === 'ER_NO_REFERENCED_ROW_2'
    );
  }
}
