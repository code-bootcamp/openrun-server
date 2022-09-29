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
    // 이벤트 아이디를 이용한 이벤트 정보 단일 조회
    return this.eventsService.findOne({ eventId });
  }

  @Query(() => [Event])
  fetchEventsByDate(
    @Args({ name: 'date', nullable: true }) date: Date, //
  ) {
    // 날짜별로 행사정보 조회
    return this.eventsService.findByDate({ date });
  }

  @Mutation(() => Event)
  createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput, //
  ) {
    // 행사정보 생성
    return this.eventsService.create({ createEventInput });
  }

  @Mutation(() => Boolean)
  async deleteEvent(
    @Args('eventId') eventId: string, //
  ) {
    // 행사정보 삭제
    return (await this.eventsService.delete({ eventId })).affected;
  }
}
