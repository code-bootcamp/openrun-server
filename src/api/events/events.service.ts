import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRpository: Repository<Event>, //
  ) {}

  findOne({ eventId }) {
    return this.eventRpository.findOne({
      where: { id: eventId },
    });
  }

  async findAll() {
    const result = await this.eventRpository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return result;
  }

  findByDate({ date }) {
    const strDate = JSON.stringify(date).slice(1, 11);
    return this.eventRpository.find({
      where: { fakeData: strDate },
    });
  }

  create({ createEventInput }) {
    return this.eventRpository.save({
      ...createEventInput,
    });
  }
}
