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

  findAllByUser({ user }) {
    return this.paymentHistoryRepository.find({
      where: { user: { id: user.id } },
    });
  }

  findAll() {
    return this.paymentHistoryRepository.find();
  }
}
