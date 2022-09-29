import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../boards/entities/board.entity';
import { Interest } from './entities/interests.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>, //

    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async findInterests({ email, page }) {
    const result = await this.interestRepository.find({
      relations: ['board', 'user', 'board.user', 'board.image'],
      where: { user: { email } },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
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
      relations: {
        user: {
          bankAccount: true,
        },
        board: {
          category: true,
          location: true,
          chatRoom: true,
          user: {
            bankAccount: true,
          },
          image: true,
        },
      },
    });
  }

  create({ user, board }) {
    this.boardRepository.update(
      {
        id: board.id,
      },
      {
        interestCount: board.interestCount + 1,
      },
    );
    return this.interestRepository.save({
      user,
      board,
    });
  }

  delete({ interest }) {
    this.boardRepository.update(
      {
        id: interest.board.id,
      },
      {
        interestCount: interest.board.interestCount - 1,
      },
    );
    this.interestRepository.delete({
      id: interest.id,
    });
  }
}
