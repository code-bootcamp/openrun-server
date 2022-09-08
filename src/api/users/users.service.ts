import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Runner } from '../runners/entities/runner.entity';
import { Board } from '../boards/entities/board.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly bankAccountsService: BankAccountsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //

    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>, // temporary

    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,

    //findAll에서 데이터를 가공하기 위해
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['bankAccount'],
    });

    const data = await Promise.all(
      users.map(async (ele) => {
        const boardTotal = await this.boardRepository.count({
          where: { user: { id: ele.id } },
        });

        const inquiryTotal = await this.inquiryRepository.count({
          where: { user: { id: ele.id } },
          relations: ['user'],
        });

        const paymentTotal = await this.paymentRepository.count({
          where: { user: { id: ele.id } },
          relations: ['user'],
        });

        return {
          ...ele,
          boardTotal: boardTotal,
          inquiryTotal: inquiryTotal,
          paymentTotal: paymentTotal,
        };
      }),
    );

    return data;
  }

  async findOne({ email }) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['bankAccount'],
    });
  }

  findOneById({ userId }) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['bankAccount'],
    });
  }

  findAllAdmin() {
    return this.userRepository.find({
      where: { isAdmin: true },
      relations: ['bankAccount'],
    });
  }

  findFourByRating() {
    return this.userRepository.find({
      order: {
        rating: 'DESC',
      },
      take: 4,
      relations: ['bankAccount'],
    });
  }

  findNumberOfUsers() {
    return this.userRepository.count();
  }

  async create({ _user, hashedPwd: password }) {
    //User 데이터 저장
    const userResult = await this.userRepository.save({
      ..._user,
      password,
      point: 0,
      rating: 0,
      report: 0,
    });
    return userResult;
  }

  async createSocialUser({ _user, loginType }) {
    //User 데이터 저장(Social Login용)
    return this.userRepository.save({
      loginType,
      ..._user,
      point: 0,
      rating: 0,
      report: 0,
    });
  }

  async updateUser({ updateUserInput }) {
    const { email, password, bankAccount, ...userInput } = updateUserInput;

    //user 정보 찾기
    const user = await this.findOne({ email });

    //비밀번호 Encrypt
    const hashedPwd = await this.encryptPassword({ password });

    //등록된 bankAccount가 있는지 확인하고 없으면 신규 추가, 있다면 업데이트
    let account = {};
    if (bankAccount) {
      if (!user.bankAccount) {
        account = await this.bankAccountsService.create({ ...bankAccount });
      } else {
        account = await this.bankAccountsService.update({
          bankAccountId: user.bankAccount.id,
          bankAccount,
        });
      }

      //bankAccount가 있는 user 정보 업데이트
      return this.userRepository.save({
        ...user,
        password: hashedPwd,
        ...userInput,
        bankAccount: account,
      });
    } else {
      //bankAccount가 없는 user 정보 업데이트
      return this.userRepository.save({
        ...user,
        password: hashedPwd,
        ...userInput,
      });
    }
  }

  updatePoint({ resultUser, price, flag }) {
    if (flag) {
      return this.userRepository.update(
        { email: resultUser.email },
        { point: resultUser.point + price },
      );
    } else {
      return this.userRepository.update(
        { email: resultUser.email },
        { point: resultUser.point - price },
      );
    }
  }

  async updateRates({ runner, successRate, rating }) {
    //runner rating 반영
    const result = await this.userRepository.save({
      ...runner.user,
      successRate,
      rating,
    });

    return result;
  }

  async delete({ email }) {
    const result = await this.userRepository.softDelete({ email });
    return result.affected;
  }

  async calculateRate({ rate, runner }) {
    //rating 평균값 계산
    let newRate = 0;
    if (runner.user.rating > 0) {
      newRate = Number(((runner.user.rating + rate) / 2).toFixed(1));
    } else {
      newRate = rate;
    }

    return newRate;
  }

  async calculateSuccessRate({ runner }) {
    //유저가 거래한 총 횟수 구하기
    const totalAdopted = await this.runnerRepository.count({
      where: { user: { id: runner.user.id } },
      relations: ['user'],
    });

    //성공한 거래 횟수 구하기
    const successTotal = await this.paymentHistoryRepository.count({
      where: { user: { id: runner.user.id }, status: 'safeMoney' },
      relations: ['user'],
    });

    //성공률 계산
    const successRate = (1 / totalAdopted) * successTotal * 100;
    return successRate;
  }

  async checkIsUserAvailable({ email }) {
    const result = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (result) {
      throw new UnprocessableEntityException('이미 사용중인 아이디입니다.');
    }
  }

  async checkIsNickNameAvailable({ nickName }) {
    const result = await this.userRepository.findOne({ where: { nickName } });
    if (result) {
      throw new UnprocessableEntityException('이미 사용중인 닉네임입니다.');
    }
  }

  async checkIsAdmin({ email }) {
    const result = await this.userRepository.findOne({
      where: { email, isAdmin: true },
    });

    if (!result) {
      throw new UnprocessableEntityException('해당 유저는 관리자가 아닙니다.');
    }
    return true;
  }

  async encryptPassword({ password }) {
    const hashedPwd = await bcrypt.hash(password, 10);
    return hashedPwd;
  }
}
