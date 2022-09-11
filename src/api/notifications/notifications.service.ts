import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Runner } from '../runners/entities/runner.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>,
  ) {}

  findRunner({ email }) {
    return this.runnerRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'board'],
    });
  }
}
