import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  countByUser({ user }) {
    return this.notificationRepository.count({
      where: { user, isNew: true },
    });
  }

  findAllByUser({ user }) {
    // return this.notificationRepository.find({
    //   where: { user },
    //   relations: ['user'],
    // });
  }
}
