import { BadRequestException } from '@nestjs/common';
import { Itinerary } from '../entities/itinerary.entity';
import { ItinerariesRepository } from './itineraries.repository';
import { ItinerariesService } from './itineraries.service';

describe('ItinerariesService date validation', () => {
  const findById = jest.fn();
  const findOne = jest.fn();
  const create = jest.fn();
  const save = jest.fn();
  const repository = {
    findById,
    findOne,
    create,
    save,
  } as unknown as ItinerariesRepository;
  const service = new ItinerariesService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an end date earlier than a database Date start date', async () => {
    findById.mockResolvedValue(
      Object.assign(new Itinerary(), {
        itineraryId: 4,
        userId: 7,
        itineraryName: 'Weekend trip',
        startDate: new Date('2026-05-20T00:00:00.000Z'),
        endDate: '2026-05-24',
        dateCreated: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );

    let thrown: unknown;
    try {
      await service.update(4, 7, { endDate: '2026-05-19' });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(BadRequestException);
    expect((thrown as BadRequestException).getResponse()).toEqual({
      message: 'Validation failed.',
      errors: ['endDate must be on or after startDate.'],
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects an end date earlier than a string start date', async () => {
    findById.mockResolvedValue(
      Object.assign(new Itinerary(), {
        itineraryId: 4,
        userId: 7,
        itineraryName: 'Weekend trip',
        startDate: '2026-05-20',
        endDate: '2026-05-24',
        dateCreated: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );

    await expect(
      service.update(4, 7, { endDate: '2026-05-19' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('reloads the full itinerary after a partial update before formatting', async () => {
    findById.mockResolvedValue(
      Object.assign(new Itinerary(), {
        itineraryId: 4,
        userId: 7,
        itineraryName: 'Weekend trip',
        startDate: '2026-05-20',
        endDate: '2026-05-24',
        dateCreated: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );
    save.mockResolvedValue({ itineraryId: 4 });
    findOne.mockResolvedValue(
      Object.assign(new Itinerary(), {
        itineraryId: 4,
        userId: 7,
        itineraryName: 'Updated trip',
        startDate: '2026-05-20',
        endDate: '2026-05-24',
        dateCreated: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );

    const result = await service.update(4, 7, {
      itineraryName: 'Updated trip',
    });

    expect(findOne).toHaveBeenCalledWith(4);
    expect(result.startDate).toBe('2026-05-20');
    expect(result.endDate).toBe('2026-05-24');
  });

  it('reloads a created itinerary and formats missing dates as null', async () => {
    create.mockResolvedValue({ itineraryId: 8 });
    findOne.mockResolvedValue(
      Object.assign(new Itinerary(), {
        itineraryId: 8,
        userId: 7,
        itineraryName: 'New trip',
        startDate: '2026-05-20',
        endDate: undefined,
        dateCreated: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );

    const result = await service.create(7, {
      itineraryName: 'New trip',
      startDate: '2026-05-20',
      endDate: '2026-05-24',
    });

    expect(findOne).toHaveBeenCalledWith(8);
    expect(result.startDate).toBe('2026-05-20');
    expect(result.endDate).toBeNull();
  });
});
