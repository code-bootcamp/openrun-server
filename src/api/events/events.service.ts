import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRpository: Repository<Event>, //

    private readonly elasticsearchService: ElasticsearchService, //
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

  async findAllByOld({ search }) {
    let result;

    if (!search) {
      result = await this.eventRpository.find({
        order: { period: 'ASC' },
      });
    } else {
      const elasticResult = await this.elasticsearchService.search({
        index: 'event',
        _source: [
          'id',
          'title',
          'contents',
          'period',
          'location',
          'text',
          'fakeData',
          'image',
          'createdAt',
        ],
        query: {
          match: {
            title: search,
          },
        },
      });

      result = elasticResult.hits.hits.map((el) => {
        const obj: any = el._source;
        const date = new Date(obj.fakeData);
        const date2 = Math.abs(date.getTime() / 1000);
        const a = new Date(obj.period);
        const b = new Date(obj.createdAt * 1000.0195);
        return { ...obj, period: a, createdAt: b, temp: date2 };
      });

      result.sort((a, b) => a.temp - b.temp);
    }

    const boards = [];

    const date = new Date();

    const cur = Math.abs(date.getTime() / 1000);

    let arr = [];
    for (let i = 0; i < result.length; i++) {
      const p = result[i].period;
      const e = Math.abs(p.getTime() / 1000);

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
