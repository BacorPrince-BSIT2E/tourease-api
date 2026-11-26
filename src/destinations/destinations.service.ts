import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Destination } from '../entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationQueryDto } from './dto/destination-query.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationsRepository } from './destinations.repository';

type DestinationResponse = Pick<
  Destination,
  | 'destinationId'
  | 'destinationName'
  | 'description'
  | 'address'
  | 'latitude'
  | 'longitude'
  | 'entranceFee'
>;

// Applies destination business rules and returns decimal fields as numbers.
@Injectable()
export class DestinationsService {
  constructor(private readonly destinations: DestinationsRepository) {}

  async findAll(query: DestinationQueryDto) {
    const [results, totalItems] = await this.destinations.findAll(query);
    return {
      success: true,
      page: query.page,
      limit: query.limit,
      totalItems,
      destinations: results.map((destination) => this.toResponse(destination)),
    };
  }

  async findOne(destinationId: number): Promise<DestinationResponse> {
    const destination = await this.destinations.findById(destinationId);
    if (!destination) {
      throw new NotFoundException('Destination not found.');
    }
    return this.toResponse(destination);
  }

  async create(dto: CreateDestinationDto): Promise<DestinationResponse> {
    return this.toResponse(await this.destinations.create(dto));
  }

  async replace(
    destinationId: number,
    dto: CreateDestinationDto,
  ): Promise<DestinationResponse> {
    const destination = await this.requireDestination(destinationId);
    Object.assign(destination, dto);
    return this.toResponse(await this.destinations.save(destination));
  }

  async update(
    destinationId: number,
    dto: UpdateDestinationDto,
  ): Promise<DestinationResponse> {
    const destination = await this.requireDestination(destinationId);
    Object.assign(destination, dto);
    return this.toResponse(await this.destinations.save(destination));
  }

  async remove(destinationId: number): Promise<void> {
    await this.requireDestination(destinationId);

    if (await this.destinations.hasReferences(destinationId)) {
      throw new ConflictException('Destination cannot be deleted.');
    }

    try {
      await this.destinations.delete(destinationId);
    } catch (error) {
      if (this.isForeignKeyConflict(error)) {
        throw new ConflictException('Destination cannot be deleted.');
      }
      throw error;
    }
  }

  private async requireDestination(destinationId: number): Promise<Destination> {
    const destination = await this.destinations.findById(destinationId);
    if (!destination) {
      throw new NotFoundException('Destination not found.');
    }
    return destination;
  }

  private toResponse(destination: Destination): DestinationResponse {
    return {
      destinationId: destination.destinationId,
      destinationName: destination.destinationName,
      description: destination.description,
      address: destination.address,
      latitude: Number(destination.latitude),
      longitude: Number(destination.longitude),
      entranceFee: Number(destination.entranceFee),
    };
  }

  private isForeignKeyConflict(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      (error.driverError.code === 'ER_ROW_IS_REFERENCED_2' ||
        error.driverError.code === 'ER_ROW_IS_REFERENCED')
    );
  }
}
