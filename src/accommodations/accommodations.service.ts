import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { AccommodationQueryDto } from './dto/accommodation-query.dto';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';
import { AccommodationsRepository } from './accommodations.repository';

// Applies accommodation business rules and returns prices as JavaScript numbers.
@Injectable()
export class AccommodationsService {
  constructor(
    private readonly accommodations: AccommodationsRepository,
  ) {}

  async findAll(query: AccommodationQueryDto) {
    const [results, totalItems] = await this.accommodations.findAll(query);
    return {
      success: true,
      page: query.page,
      limit: query.limit,
      totalItems,
      accommodations: results.map((accommodation) =>
        this.toResponse(accommodation),
      ),
    };
  }

  async findOne(accommodationId: number) {
    const accommodation = await this.accommodations.findById(accommodationId);
    if (!accommodation) {
      throw new NotFoundException('Accommodation not found.');
    }
    return this.toResponse(accommodation);
  }

  async create(dto: CreateAccommodationDto) {
    await this.assertDestinationExists(dto.destinationId);
    try {
      return this.toResponse(await this.accommodations.create(dto));
    } catch (error) {
      if (this.isMissingReference(error)) {
        throw new BadRequestException('Destination not found.');
      }
      throw error;
    }
  }

  async update(accommodationId: number, dto: UpdateAccommodationDto) {
    const accommodation = await this.requireAccommodation(accommodationId);
    if (dto.destinationId !== undefined) {
      await this.assertDestinationExists(dto.destinationId);
    }

    Object.assign(accommodation, dto);
    try {
      return this.toResponse(await this.accommodations.save(accommodation));
    } catch (error) {
      if (this.isMissingReference(error)) {
        throw new BadRequestException('Destination not found.');
      }
      throw error;
    }
  }

  async remove(accommodationId: number): Promise<void> {
    await this.requireAccommodation(accommodationId);
    await this.accommodations.delete(accommodationId);
  }

  private async requireAccommodation(
    accommodationId: number,
  ): Promise<Accommodation> {
    const accommodation = await this.accommodations.findById(accommodationId);
    if (!accommodation) {
      throw new NotFoundException('Accommodation not found.');
    }
    return accommodation;
  }

  private async assertDestinationExists(destinationId: number): Promise<void> {
    if (!(await this.accommodations.destinationExists(destinationId))) {
      throw new BadRequestException('Destination not found.');
    }
  }

  private toResponse(accommodation: Accommodation) {
    return {
      accommodationId: accommodation.accommodationId,
      destinationId: accommodation.destinationId,
      accommodationName: accommodation.accommodationName,
      address: accommodation.address,
      contactNumber: accommodation.contactNumber,
      pricePerNight: Number(accommodation.pricePerNight),
    };
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
