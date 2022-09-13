import { Injectable, NotFoundException } from '@nestjs/common';
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
        user: { email: email },
        board: { status: BOARD_STATUS_ENUM.INPROGRESS },
      },
      relations: ['user', 'board'],
    });
  }

  getDday({ runner }) {
    //D-day 구하기
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    const nowDate = now.getDate();

    return runner.map((ele) => {
      let contents = '';

      const dueYear = ele.board.dueDate.getFullYear();
      const dueMonth = ele.board.dueDate.getMonth() + 1;
      const dueDate = ele.board.dueDate.getDate();

      if (dueYear === nowYear && dueMonth === nowMonth) {
        if (dueDate - 3 === nowDate) {
          //3일 남았을 경우
          contents = '러닝 3일 전입니다.';
        } else if (dueDate - 2 === nowDate) {
          //2일 남았을 경우
          contents = '러닝 2일 전입니다.';
        } else if (dueDate - 1 === nowDate) {
          //1일 남았을 경우
          contents = '러닝 1일 전입니다.';
        } else if (dueDate === nowDate) {
          //D-day
          contents = '오늘이 바로 러닝데이!!';
        }
      }

      // const diffTime = ele.board.dueDate.getTime() - now.getTime();
      // if (diffTime < 0 || diffTime > 60 * 60 * 24 * 4 * 1000) {
      //   //이미 지났거나 D-day가 4일 이상 남았을 경우
      //   contents = '';
      // } else if (diffTime > 60 * 60 * 24 * 3 * 1000) {
      //   //3일 남았을 경우
      //   contents = '러닝 3일 전입니다.';
      // } else if (diffTime > 60 * 60 * 24 * 2 * 1000) {
      //   //2일 남았을 경우
      //   contents = '러닝 2일 전입니다.';
      // } else if (diffTime > 60 * 60 * 24 * 1 * 1000) {
      //   //1일 남았을 경우
      //   contents = '러닝 1일 전입니다.';
      // } else {
      //   //D-day
      //   contents = '오늘이 바로 러닝데이!!';
      // }
      return contents;
    });
  }

  async create({ runner, contents }) {
    const result = [];
    for (let i = 0; i < contents.length; i++) {
      if (contents[i] === '') {
        //값이 없다면 d-day가 필요없는 계획
        continue;
      }

      //기존 notification 찾기 및 기존 contents와 같다면 skip
      const prevContent = await this.findOne({
        user: runner[i].user,
        board: runner[i].board,
      });

      if (prevContent) {
        //기존 데이터와 같다면 skip
        if (prevContent.contents === contents[i]) {
          result.push(prevContent);
          continue;
        }

        //기존 notification을 update
        const updatedContent = await this.notificationRepository.save({
          ...prevContent,
          contents: contents[i],
          isNew: true,
        });
        result.push(updatedContent);
      } else {
        //새로운 notification 생성
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

  async update({ email }) {
    const notifications = await this.notificationRepository.find({
      where: { user: { email } }, //
      relations: ['user', 'board'],
    });

    notifications.every(async (ele) => {
      const result = await this.notificationRepository.update(
        { id: ele.id },
        { isNew: false },
      );
      if (!result.affected) {
        throw new NotFoundException(
          '알림을 정상적으로 업데이트하지 못하였습니다.',
        );
      }
    });
    return true;
  }
}
