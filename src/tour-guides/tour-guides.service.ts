import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TourGuide } from '../entities/tour-guide.entity';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { TourGuideQueryDto } from './dto/tour-guide-query.dto';
import { UpdateTourGuideDto } from './dto/update-tour-guide.dto';
import { TourGuidesRepository } from './tour-guides.repository';

// Applies tour-guide validation and business rules through the repository.
@Injectable()
export class TourGuidesService {
  constructor(private readonly tourGuides: TourGuidesRepository) {}

  async findAll(query: TourGuideQueryDto) {
    const [results, totalItems] = await this.tourGuides.findAll(query);
    return {
      success: true,
      page: query.page,
      limit: query.limit,
      totalItems,
      tourGuides: results,
    };
  }

  async findOne(guideId: number): Promise<TourGuide> {
    const guide = await this.tourGuides.findById(guideId);
    if (!guide) {
      throw new NotFoundException('Tour guide not found.');
    }
    return guide;
  }

  async create(dto: CreateTourGuideDto): Promise<TourGuide> {
    await this.assertDestinationExists(dto.destinationId);
    if (await this.tourGuides.findByEmail(dto.email)) {
      throw new ConflictException('Email already exists.');
    }

    try {
      return await this.tourGuides.create(dto);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Email already exists.');
      }
      if (this.isMissingReference(error)) {
        throw new BadRequestException('Destination not found.');
      }
      throw error;
    }
  }

  async update(
    guideId: number,
    dto: UpdateTourGuideDto,
  ): Promise<TourGuide> {
    const guide = await this.requireTourGuide(guideId);
    if (dto.destinationId !== undefined) {
      await this.assertDestinationExists(dto.destinationId);
    }
    if (
      dto.email &&
      dto.email !== guide.email &&
      (await this.tourGuides.findByEmail(dto.email))
    ) {
      throw new ConflictException('Email already exists.');
    }

    Object.assign(guide, dto);
    try {
      return await this.tourGuides.save(guide);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Email already exists.');
      }
      if (this.isMissingReference(error)) {
        throw new BadRequestException('Destination not found.');
      }
      throw error;
    }
  }

  async remove(guideId: number): Promise<void> {
    await this.requireTourGuide(guideId);
    await this.tourGuides.delete(guideId);
  }

  private async requireTourGuide(guideId: number): Promise<TourGuide> {
    const guide = await this.tourGuides.findById(guideId);
    if (!guide) {
      throw new NotFoundException('Tour guide not found.');
    }
    return guide;
  }

  private async assertDestinationExists(destinationId: number): Promise<void> {
    if (!(await this.tourGuides.destinationExists(destinationId))) {
      throw new BadRequestException('Destination not found.');
    }
  }

  private isDuplicateEntry(error: unknown): boolean {
    return this.hasMysqlErrorCode(error, 'ER_DUP_ENTRY');
  }

  private isMissingReference(error: unknown): boolean {
    return this.hasMysqlErrorCode(error, 'ER_NO_REFERENCED_ROW_2');
  }

  private hasMysqlErrorCode(error: unknown, code: string): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === code
    );
  }
}
