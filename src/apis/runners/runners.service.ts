import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
import { Runner } from './entities/runner.entity';

@Injectable()
export class RunnersService {
  constructor(
    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>, //
  ) {}

  async findRunner({ boardId }) {
    const runner = await this.runnerRepository.findOne({
      where: { board: { id: boardId }, isChecked: true },
      relations: {
        user: {
          bankAccount: true,
        },
        board: {
          category: true,
          user: true,
          location: true,
          chatRoom: true,
        },
      },
    });
    return runner;
  }

  async findRunnerByBoard({ boardId, user }) {
    return await this.runnerRepository.findOne({
      where: { board: { id: boardId }, user: { id: user.id } },
      relations: {
        user: {
          bankAccount: true,
        },
        board: {
          category: true,
          user: true,
          location: true,
          chatRoom: true,
        },
      },
    });
  }

  async findAllByBoard({ boardId }) {
    const result = await this.runnerRepository.find({
      where: { board: { id: boardId } },
      relations: {
        user: {
          bankAccount: true,
        },
        board: {
          category: true,
          user: true,
          location: true,
          chatRoom: true,
        },
      },
    });
    return result;
  }

  async findOneByBoardUser({ boardId, userId }) {
    const result = await this.runnerRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
      relations: {
        user: true,
        board: true,
      },
    });
    return result;
  }

  findRunnerProcessing({ email, page }) {
    return this.runnerRepository.find({
      relations: {
        user: {
          bankAccount: true,
        },
        board: {
          category: true,
          user: true,
          location: true,
          chatRoom: true,
        },
      },
      where: {
        user: { email: email },
        isChecked: true,
        board: { status: BOARD_STATUS_ENUM.INPROGRESS },
      },
      order: { board: { updatedAt: 'ASC' } },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
  }

  create({ user, board }) {
    return this.runnerRepository.save({
      isChecked: false,
      user,
      board,
    });
  }

  async updateIsChecked({ runner }) {
    const result = await this.runnerRepository.save({
      ...runner,
      isChecked: true,
    });

    return result;
  }
}
