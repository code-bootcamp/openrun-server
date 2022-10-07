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
      relations: {
        user: {
          bankAccount: true,
        },
      },
    });

    return result;
  }

  async findPointCharge({ id, page }) {
    const result = await this.paymentRepository.find({
      where: { user: { id: id } },
      order: { createdAt: 'DESC' },
      relations: {
        user: {
          bankAccount: true,
        },
      },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });

    return result;
  }

  async findTotalAmount() {
    // 모든 충전, 취소내역 조회
    const result = await this.paymentRepository.find({
      order: { createdAt: 'ASC' },
    });
    // 날짜별로 총 매출 데이터로 만들기 위한 빈 객체 선언
    const obj = {};
    result.forEach((el) => {
      // 아이디로 날짜 할당
      const id = JSON.stringify(el.createdAt).slice(1, 11);
      // 현재 날짜가 없으면
      if (!obj[id]) {
        // 날짜를 키로 밸류 할당
        obj[id] = [
          {
            id: id,
            amount: el.amount,
            count: 1,
          },
        ];
      } else {
        // 현재 날짜가 있으면

        // 조회한 키값에 밸류에 가격 더해주기
        obj[id][0].amount = obj[id][0].amount + el.amount;
        // 조회한 키값에 밸류에 횟수 더해주기
        obj[id][0].count = obj[id][0].count + 1;
      }
    });

    // 밸류만 뽑아서 새로운 배열로 변환
    const arr = Object.values(obj).map((el) => el[0]);

    return arr;
  }

  async create({ impUid, amount, user: _user }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 유저 조회
      const user = await queryRunner.manager.findOne(User, {
        where: { id: _user.id },
        relations: {
          bankAccount: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      // 결제내역 생성
      const payment = this.paymentRepository.create({
        impUid,
        amount: amount,
        user,
        status: PAYMENT_STATUS_ENUM.PAYMENT,
      });

      await queryRunner.manager.save(payment);

      // 유저 포인트 업데이트
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

  async cancel({ impUid, user, amount }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 유저 조회
      const findUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        lock: { mode: 'pessimistic_write' },
      });

      // 유저에게 포인트 지급
      const updateUser = this.userRepository.create({
        ...findUser,
        point: findUser.point - amount,
      });

      await queryRunner.manager.save(updateUser);

      // 환불내역 저장
      const cancelPayment = this.paymentRepository.create({
        amount: -amount,
        impUid,
        user: findUser,
        status: PAYMENT_STATUS_ENUM.CANCEL,
      });

      await queryRunner.manager.save(cancelPayment);

      await queryRunner.commitTransaction();

      return cancelPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
