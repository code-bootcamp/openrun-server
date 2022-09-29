import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentHistory } from './entities/paymentHistory.entity';

@Injectable()
export class PaymentHistoriesService {
  constructor(
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
  ) {}

  findAllByUser({ user, page }) {
    return this.paymentHistoryRepository.find({
      where: { user: { id: user.id } },
      relations: {
        user: true,
        board: {
          user: true,
        },
      },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
  }

  findAll() {
    return this.paymentHistoryRepository.find();
  }

  async findOne({ boardId, userId }) {
    const result = await this.paymentHistoryRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
    });
    return result;
  }

  create({ user, board, price, flag }) {
    // 거래내역 생성
    return this.paymentHistoryRepository.save({
      board,
      user,
      price,
      title: board.title,
      status: flag
        ? 'safeMoney'
        : board.user.id === user.id
        ? 'seller'
        : 'runner',
    });
  }

  findAllByBoardId({ boardId }) {
    return this.paymentHistoryRepository.find({
      where: { board: { id: boardId } },
      relations: {
        board: {
          user: true,
        },
      },
    });
  }

  deleteOnlyBoardId({ id }) {
    // 보드와 연결 끊기
    return this.paymentHistoryRepository.update(
      {
        id,
      },
      { board: null },
    );
  }

  updateOnlyBoardId({ id, boardId }) {
    // 보드와 연결하기
    return this.paymentHistoryRepository.update(
      {
        id,
      },
      {
        board: { id: boardId },
      },
    );
  }
}
