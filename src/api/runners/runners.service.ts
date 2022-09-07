import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      relations: ['user', 'board'],
    });
    return runner;
  }

  async findAllByBoard({ boardId }) {
    const result = await this.runnerRepository.find({
      where: { board: { id: boardId } },
      relations: {
        user: true,
      },
    });
    return result.map((el) => el.user);
  }

  async findOneByBoardUser({ boardId, userId }) {
    const result = await this.runnerRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
      relations: {
        user: true,
        board: true,
      },
    });
    console.log('runner: ', result);
    return result;
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
