import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { UsersService } from '../users/users.service';
import { Interest } from './entities/interests.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>, //
    private readonly userService: UsersService,
    private readonly boardsService: BoardsService,

    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  create({ user, board }) {
    return this.interestRepository.save({
      user,
      board,
    });
  }

  async findInterests({ email, page }) {
    const result = await this.interestRepository.find({
      relations: ['board', 'user'],
      where: { user: { email } },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });

    console.log(result);
    return result;
  }

  async findInterestsId({ email }) {
    const result = await this.interestRepository.find({
      relations: {
        user: true,
        board: true,
      },
      where: { user: { email } },
      select: {
        board: {
          id: true,
        },
      },
    });
    return result.map((el) => el.board.id);
  }

  async findInterest({ user, board }) {
    return await this.interestRepository.findOne({
      where: { user: { id: user.id }, board: { id: board.id } },
    });
  }

  delete({ interest }) {
    this.interestRepository.delete({
      id: interest.id,
    });
  }
}
