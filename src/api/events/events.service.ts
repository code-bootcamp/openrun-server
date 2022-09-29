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
    // 받은 데이트 타입에 날짜를 yyyy-mm-dd 형태로 변환
    let strDate = JSON.stringify(date).slice(1, 11);

    // 받은 데이트가 없다면
    if (!date) {
      // 현재 날짜
      const result = new Date();
      // 데이트 타입에 날짜를 yyyy-mm-dd 형태로 변환
      strDate = JSON.stringify(result).slice(1, 11);
    }
    // 받은 날짜와 같은 것들만 조회
    return this.eventRpository.find({
      where: { fakeData: strDate },
      relations: {
        contentsImage: true,
      },
    });
  }

  async create({ createEventInput }) {
    // 이벤트 저장
    const event = await this.eventRpository.save({
      ...createEventInput,
    });

    // 이벤트 이미지를 담을 배열 생성
    const contentsImageArr = [];
    for (let i = 0; i < createEventInput.contentsImage.length; i++) {
      // 받아온 이미지 이벤트 이미지 테이블에 저장
      const img = await this.eventImageRepository.save({
        url: createEventInput.contentsImage[i],
        event,
      });
      // 저장한 이벤트 이미지 푸시
      contentsImageArr.push(img);
    }
    // 등록한 행사정보 리턴
    return { ...event, contentsImage: contentsImageArr };
  }

  async delete({ eventId }) {
    // 현재 이벤트 정보 조회
    const event = await this.eventRpository.findOne({
      where: { id: eventId },
      relations: {
        contentsImage: true,
      },
    });

    for (let i = 0; i < event.contentsImage.length; i++) {
      // 버킷에 이미지 삭제
      await this.filesService.delete({ url: event.contentsImage[i].url });
    }

    // 이벤트 이미지 테이블에서 이미지 삭제
    this.eventImageRepository.delete({
      event: { id: eventId },
    });

    return await this.eventRpository.delete({
      id: eventId,
    });
  }
}
