import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateEventInput } from './dto/createEvent.input';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

@Resolver()
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService, //
  ) {}

  @Mutation(() => Event)
  createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput, //
  ) {
    return this.eventsService.create({ createEventInput });
  }

  @Query(() => [Event])
  fetchEvents(
    @Args('dueDate', { nullable: true }) dueDate: boolean, //
  ) {
    if (!dueDate) return this.eventsService.findAll();

    return this.eventsService.findAllByOld();
  }

  @Query(() => Event)
  fetchEvent(
    @Args('eventId') eventId: string, //
  ) {
    return this.eventsService.findOne({ eventId });
  }
}
