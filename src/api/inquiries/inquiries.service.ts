import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
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
          bankAccount: true,
        },
        board: {
          category: true,
          user: true,
          location: true,
        },
      },
    });
  }

  async findUserInquiry({ user }) {
    const result = await this.inquiryRepository.find({
      where: { user: { id: user.id } },
      relations: {
        board: {
          category: true,
          user: true,
          location: true,
          image: true,
        },
      },
    });

    return result;
  }

  async findOne({ inquiryId }) {
    return await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });
  }

  async create({ createInquiryInput, email, boardId }) {
    // 현재 유저 조회
    const user = await this.usersService.findOne({
      email,
    });

    // 문의하는 게시물 조회
    const board = await this.boardsService.findOne({
      boardId,
    });

    // 문의내역 저장
    return this.inquiryRepository.save({
      ...createInquiryInput,
      user,
      board,
    });
  }
}
