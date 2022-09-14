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
        board: true,
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
    return this.paymentHistoryRepository.save({
      board,
      user,
      price,
      status: flag
        ? 'safeMoney'
        : board.user.id === user.id
        ? 'seller'
        : 'runner',
    });
  }
}
