import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { ItinerariesService } from './itineraries.service';
import { ItineraryDestinationsRepository } from './itinerary-destinations.repository';
import { ItineraryDestinationsService } from './itinerary-destinations.service';

describe('ItineraryDestinationsService save responses', () => {
  const findOwned = jest.fn();
  const destinationExists = jest.fn();
  const findByVisitOrder = jest.fn();
  const create = jest.fn();
  const save = jest.fn();
  const findByIdInItinerary = jest.fn();
  const entriesRepository = {
    destinationExists,
    findByVisitOrder,
    create,
    save,
    findByIdInItinerary,
  } as unknown as ItineraryDestinationsRepository;
  const itineraryService = {
    findOwned,
  } as unknown as ItinerariesService;
  const service = new ItineraryDestinationsService(
    entriesRepository,
    itineraryService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reloads a newly created stop before formatting its date', async () => {
    destinationExists.mockResolvedValue(true);
    findByVisitOrder.mockResolvedValue(null);
    create.mockResolvedValue({ itineraryDestinationId: 12 });
    findByIdInItinerary.mockResolvedValue(
      Object.assign(new ItineraryDestination(), {
        itineraryDestinationId: 12,
        itineraryId: 4,
        destinationId: 8,
        visitDate: new Date('2026-05-20T00:00:00.000Z'),
        visitOrder: 1,
      }),
    );

    const result = await service.create(4, 7, {
      destinationId: 8,
      visitDate: '2026-05-20',
      visitOrder: 1,
    });

    expect(findByIdInItinerary).toHaveBeenCalledWith(12, 4);
    expect(result.visitDate).toBe('2026-05-20');
  });

  it('reloads an updated stop and safely formats a missing date', async () => {
    findByIdInItinerary
      .mockResolvedValueOnce(
        Object.assign(new ItineraryDestination(), {
          itineraryDestinationId: 12,
          itineraryId: 4,
          destinationId: 8,
          visitDate: '2026-05-20',
          visitOrder: 1,
        }),
      )
      .mockResolvedValueOnce(
        Object.assign(new ItineraryDestination(), {
          itineraryDestinationId: 12,
          itineraryId: 4,
          destinationId: 8,
          visitDate: undefined,
          visitOrder: 1,
        }),
      );
    save.mockResolvedValue({ itineraryDestinationId: 12 });

    const result = await service.update(4, 12, 7, {
      visitOrder: 1,
    });

    expect(findByIdInItinerary).toHaveBeenNthCalledWith(2, 12, 4);
    expect(result.visitDate).toBeNull();
  });
});
