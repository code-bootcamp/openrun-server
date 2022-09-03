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

  async findAllByOld() {
    const result = await this.eventRpository.find({
      order: { period: 'ASC' },
    });

    const boards = [];

    const date = new Date();

    const cur = Math.abs(date.getTime() / 1000);

    let arr = [];
    for (let i = 0; i < result.length; i++) {
      const p = result[i].period;
      const e = Math.abs(p.getTime() / 1000);
      console.log(e, cur);
      if (Math.ceil(e) < Math.ceil(cur)) continue;

      if (result[i + 1] === undefined) {
        arr.push(result[i]);
        boards.push(arr);
        arr = [];
        continue;
      }
      if (result[i - 1] === undefined) {
        arr.push(result[i]);
        if (result[i].fakeData !== result[i + 1].fakeData) {
          boards.push(arr);
          arr = [];
        }
        continue;
      }
      if (
        result[i].fakeData === result[i + 1].fakeData ||
        result[i].fakeData === result[i - 1].fakeData
      ) {
        arr.push(result[i]);
      }

      if (
        result[i].fakeData !== result[i + 1].fakeData ||
        result[i].fakeData !== result[i - 1].fakeData
      ) {
        arr.push(result[i]);
      }

      if (result[i].fakeData !== result[i + 1].fakeData) {
        boards.push(arr);

        arr = [];
      }
    }

    return boards;
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
