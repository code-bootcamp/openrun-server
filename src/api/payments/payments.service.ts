import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly connection: DataSource,
  ) {}

  async findPayment({ impUid }) {
    const result = await this.paymentRepository.findOne({
      where: { impUid: impUid },
      order: { id: 'DESC' },
      relations: ['user'],
    });

    return result;
  }

  async create({ impUid, amount, user: _user }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const user = await this.userRepository.findOne({
        where: { email: _user.email },
        order: { id: 'DESC' },
      });

      const payment = this.paymentRepository.create({
        impUid,
        amount: amount,
        user,
        status: PAYMENT_STATUS_ENUM.PAYMENT,
      });

      await queryRunner.manager.save(payment);

      const updateUser = this.userRepository.create({
        ...user,
        point: user.point + amount,
      });

      await queryRunner.manager.save(updateUser);

      await queryRunner.commitTransaction();

      return payment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
