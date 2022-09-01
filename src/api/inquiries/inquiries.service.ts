import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { UsersService } from '../users/users.service';
import { Inquiry } from './entities/inquiry.entity';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,

    private readonly usersService: UsersService,

    private readonly boardsService: BoardsService,
  ) {}

  findAll() {
    return this.inquiryRepository.find({
      relations: {
        user: {
          cardInfo: true,
        },
        board: {
          tag: true,
          category: true,
          user: true,
          location: true,
        },
      },
    });
  }

  async create({ createInquiryInput, email, boardId }) {
    const user = await this.usersService.findOne({
      email,
    });

    // const board = await this.boardsService.findOne({
    //   boardId,
    // });

    return this.inquiryRepository.save({
      ...createInquiryInput,
      user,
      //   board,
    });
  }
}
