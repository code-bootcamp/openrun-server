import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateEventInput } from './dto/createEvent.input';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

@Resolver()
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService, //
  ) {}

  @Query(() => [[Event]])
  fetchEvents(
    @Args({ name: 'search', nullable: true }) search: string, //
  ) {
    return this.eventsService.findAllByOld({ search });
  }

  @Query(() => Event)
  fetchEvent(
    @Args('eventId') eventId: string, //
  ) {
    return this.eventsService.findOne({ eventId });
  }

  @Query(() => [Event])
  fetchEventsByDate(
    @Args('date') date: Date, //
  ) {
    return this.eventsService.findByDate({ date });
  }

  @Mutation(() => Event)
  createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput, //
  ) {
    return this.eventsService.create({ createEventInput });
  }
}
