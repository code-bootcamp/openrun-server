import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventImage } from '../eventImages/entities/eventImage.entity';
import { Event } from './entities/event.entity';
import { FileService } from '../file/file.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRpository: Repository<Event>, //

    @InjectRepository(EventImage)
    private readonly eventImageRepository: Repository<EventImage>,

    private readonly filesService: FileService,
  ) {}

  findOne({ eventId }) {
    return this.eventRpository.findOne({
      where: { id: eventId },
      relations: {
        contentsImage: true,
      },
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
    let strDate = JSON.stringify(date).slice(1, 11);

    if (!date) {
      const result = new Date();
      strDate = JSON.stringify(result).slice(1, 11);
    }
    return this.eventRpository.find({
      where: { fakeData: strDate },
      relations: {
        contentsImage: true,
      },
    });
  }

  async create({ createEventInput }) {
    const event = await this.eventRpository.save({
      ...createEventInput,
    });
    const contentsImageArr = [];
    for (let i = 0; i < createEventInput.contentsImage.length; i++) {
      const img = await this.eventImageRepository.save({
        url: createEventInput.contentsImage[i],
        event,
      });
      contentsImageArr.push(img);
    }
    return { ...event, contentsImage: contentsImageArr };
  }

  async delete({ eventId }) {
    const event = await this.eventRpository.findOne({
      where: { id: eventId },
      relations: {
        contentsImage: true,
      },
    });

    for (let i = 0; i < event.contentsImage.length; i++) {
      await this.filesService.delete({ url: event.contentsImage[i].url });
    }

    this.eventImageRepository.delete({
      event: { id: eventId },
    });

    return await this.eventRpository.delete({
      id: eventId,
    });
  }
}
