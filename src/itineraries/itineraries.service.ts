import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Itinerary } from '../entities/itinerary.entity';
import { JwtPayload } from '../auth/auth.types';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryQueryDto } from './dto/itinerary-query.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { ItinerariesRepository } from './itineraries.repository';

// Enforces itinerary ownership, date rules, and user-scoped CRUD operations.
@Injectable()
export class ItinerariesService {
  constructor(private readonly itineraries: ItinerariesRepository) {}

  async findAll(userId: number, query: ItineraryQueryDto) {
    const [results, totalItems] = await this.itineraries.findAll(userId, query);
    return {
      success: true,
      page: query.page,
      limit: query.limit,
      totalItems,
      itineraries: results.map((itinerary) => this.toResponse(itinerary)),
    };
  }

  async findOne(
    itineraryId: number,
    requester: JwtPayload,
  ): Promise<ItineraryResponse> {
    const itinerary = await this.findAccessible(itineraryId, requester);
    return this.toResponse(itinerary);
  }

  async create(
    userId: number,
    dto: CreateItineraryDto,
  ): Promise<ItineraryResponse> {
    this.validateDateRange(dto.startDate, dto.endDate);
    const itinerary = await this.itineraries.create(userId, dto);
    return this.toResponse(itinerary);
  }

  async update(
    itineraryId: number,
    userId: number,
    dto: UpdateItineraryDto,
  ): Promise<ItineraryResponse> {
    const itinerary = await this.itineraries.findById(itineraryId);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found.');
    }
    if (itinerary.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    this.validateDateRange(
      dto.startDate ?? itinerary.startDate,
      dto.endDate ?? itinerary.endDate,
    );
    Object.assign(itinerary, dto);
    return this.toResponse(await this.itineraries.save(itinerary));
  }

  async remove(itineraryId: number, requester: JwtPayload): Promise<void> {
    const itinerary = await this.findAccessible(itineraryId, requester);
    await this.itineraries.delete(itinerary.itineraryId);
  }

  async findAccessible(
    itineraryId: number,
    requester: JwtPayload,
  ): Promise<Itinerary> {
    const itinerary = await this.itineraries.findById(itineraryId);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found.');
    }
    if (
      itinerary.userId !== requester.sub &&
      requester.role !== 'Admin'
    ) {
      throw new ForbiddenException('Access denied.');
    }
    return itinerary;
  }

  async findOwned(itineraryId: number, userId: number): Promise<Itinerary> {
    const itinerary = await this.itineraries.findById(itineraryId);
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found.');
    }
    if (itinerary.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    return itinerary;
  }

  private validateDateRange(startDate: string, endDate: string): void {
    if (endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate.');
    }
  }

  private toResponse(itinerary: Itinerary): ItineraryResponse {
    return {
      itineraryId: itinerary.itineraryId,
      userId: itinerary.userId,
      itineraryName: itinerary.itineraryName,
      startDate: this.formatDate(itinerary.startDate),
      endDate: this.formatDate(itinerary.endDate),
      dateCreated: itinerary.dateCreated,
    };
  }

  private formatDate(value: string | Date): string {
    return value instanceof Date
      ? value.toISOString().slice(0, 10)
      : value.slice(0, 10);
  }
}

type ItineraryResponse = Pick<
  Itinerary,
  | 'itineraryId'
  | 'userId'
  | 'itineraryName'
  | 'startDate'
  | 'endDate'
  | 'dateCreated'
>;
