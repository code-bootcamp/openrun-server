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

  findAll() {
    return this.eventRpository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllByOld() {
    const result = await this.eventRpository.find();
    const curDate = new Date();
    const old = result.map((el) => {
      const event = Math.abs(el.period.getTime() / 1000);
      const cur = Math.abs(curDate.getTime() / 1000);
      return { ...el, temp: Math.ceil(event) - Math.ceil(cur) };
    });
    old.sort((a, b) => a.temp - b.temp);

    return old;
  }

  create({ createEventInput }) {
    return this.eventRpository.save({
      ...createEventInput,
    });
  }
}
