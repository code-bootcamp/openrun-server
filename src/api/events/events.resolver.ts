import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateEventInput } from './dto/createEvent.input';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

@Resolver()
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService, //
  ) {}

  @Query(() => Event)
  fetchEvent(
    @Args('eventId') eventId: string, //
  ) {
    return this.eventsService.findOne({ eventId });
  }

  @Query(() => [Event])
  fetchEventsByDate(
    @Args({ name: 'date', nullable: true }) date: Date, //
  ) {
    return this.eventsService.findByDate({ date });
  }

  @Mutation(() => Event)
  createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput, //
  ) {
    return this.eventsService.create({ createEventInput });
  }

  @Mutation(() => Boolean)
  async deleteEvent(
    @Args('eventId') eventId: string, //
  ) {
    return (await this.eventsService.delete({ eventId })).affected;
  }
}
