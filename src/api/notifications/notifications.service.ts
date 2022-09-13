import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
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

  findOne({ user, board }) {
    return this.notificationRepository.findOne({
      where: { user: { id: user.id }, board: { id: board.id } },
      relations: ['user', 'board'],
    });
  }

  findRunner({ email }) {
    return this.runnerRepository.find({
      where: {
        user: { email },
        board: { status: BOARD_STATUS_ENUM.INPROGRESS },
      },
      relations: ['user', 'board'],
    });
  }

  getDday({ runner }) {
    //D-day 구하기
    const now = new Date();

    return runner.map((ele) => {
      let contents = '';
      const diffTime = ele.board.dueDate.getTime() - now.getTime();
      if (diffTime < 0 && diffTime > 60 * 60 * 24 * 4) {
        //이미 지났거나 D-day가 4일 이상 남았을 경우
        contents = '';
      } else if (diffTime > 60 * 60 * 24 * 3) {
        //3일 남았을 경우
        contents = '러닝 3일 전입니다.';
      } else if (diffTime > 60 * 60 * 24 * 2) {
        //2일 남았을 경우
        contents = '러닝 2일 전입니다.';
      } else if (diffTime > 60 * 60 * 24 * 1) {
        //1일 남았을 경우
        contents = '러닝 1일 전입니다.';
      } else {
        //D-day
        contents = '오늘이 바로 러닝데이!!';
      }
      return contents;
    });

    // for (let i = 0; i < runner.length; i++) {
    //   let contents = '';
    //   const diffTime = runner[i].board.dueDate.getTime() - now.getTime();
    //   if (diffTime < 0 && diffTime > 60 * 60 * 24 * 4) {
    //     //이미 지났거나 D-day가 4일 이상 남았을 경우
    //     continue;
    //   } else if (diffTime > 60 * 60 * 24 * 3) {
    //     //3일 남았을 경우
    //     contents = '러닝 3일 전입니다.';
    //   } else if (diffTime > 60 * 60 * 24 * 2) {
    //     //2일 남았을 경우
    //     contents = '러닝 2일 전입니다.';
    //   } else if (diffTime > 60 * 60 * 24 * 1) {
    //     //1일 남았을 경우
    //     contents = '러닝 1일 전입니다.';
    //   } else {
    //     //D-day
    //     contents = '오늘이 바로 러닝데이!!';
    //   }
    // }

    // const test = new Date(temp);
    // console.log('test = ', test.toDateString());
  }

  async create({ runner, contents }) {
    const result = [];
    for (let i = 0; i < contents.length; i++) {
      if (contents[i] === '') {
        //값이 없다면 d-day가 필요없는 계획
        continue;
      }

      const prevContent = this.findOne({
        user: runner[i].user,
        board: runner[i].board,
      });
      if (prevContent) {
        const updatedContent = await this.notificationRepository.save({
          ...prevContent,
          contents: contents[i],
          isNew: true,
        });
        result.push(updatedContent);
      } else {
        const newContent = await this.notificationRepository.save({
          contents: contents[i],
          isNew: true,
          user: runner[i].user,
          board: runner[i].board,
        });
        result.push(newContent);
      }
    }
    return result;
  }
}
