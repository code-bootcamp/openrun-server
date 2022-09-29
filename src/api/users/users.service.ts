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
      relations: {
        bankAccount: true,
      },
    });

    const data = await Promise.all(
      users.map(async (ele) => {
        //유저가 작성한 게시글 수
        const boardTotal = await this.boardRepository.count({
          where: { user: { id: ele.id } },
        });

        //유저가 작성한 문의글 수
        const inquiryTotal = await this.inquiryRepository.count({
          where: { user: { id: ele.id } },
          relations: {
            user: true,
          },
        });

        //유저의 결제완료 건수
        const paymentTotal = await this.paymentRepository.count({
          where: { user: { id: ele.id } },
          relations: {
            user: true,
          },
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
    //유저의 정보 출력
    const result = await this.userRepository.findOne({
      where: { email },
      relations: {
        bankAccount: true,
      },
    });

    return result;
  }

  async findOneForLoginUser({ email }) {
    //현재 로그인한 유저가 작성한 게시글 총 갯수
    const boardTotal = await this.boardRepository.count({
      where: { user: { email } },
    });

    //유저의 정보 출력
    const result = await this.userRepository.findOne({
      where: { email },
      relations: {
        bankAccount: true,
      },
    });

    result.boardTotal = boardTotal;
    return result;
  }

  findOneById({ userId }) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: {
        bankAccount: true,
      },
    });
  }

  findAllAdmin() {
    return this.userRepository.find({
      where: { isAdmin: true },
      relations: {
        bankAccount: true,
      },
    });
  }

  findFourByRating() {
    return this.userRepository.find({
      order: {
        rating: 'DESC',
      },
      take: 4,
      relations: {
        bankAccount: true,
      },
    });
  }

  findNumberOfUsers() {
    return this.userRepository.count();
  }

  async findNumberOfUsersByDate() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.createdAt AS createdAt')
      .addSelect('COUNT(*) AS countByDate')
      .groupBy('user.createdAt')
      .getRawMany();

    return result;
  }

  async create({ _user, hashedPwd: password }) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    //User 데이터 저장
    const userResult = await this.userRepository.save({
      ..._user,
      password,
      point: 0,
      rating: 0,
      report: 0,
      createdAt: now,
    });
    return userResult;
  }

  //개발용 creatUser
  async createForAdmin({ _user, hashedPwd: password }) {
    const { point, rating, report, successRate, ...user } = _user;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    //User 데이터 저장
    const userResult = await this.userRepository.save({
      ...user,
      password,
      point,
      rating,
      report,
      successRate,
      createdAt: now,
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
      // 충전(true)
      return this.userRepository.update(
        { email: resultUser.email },
        { point: resultUser.point + price },
      );
    } else {
      // 차감(false)
      return this.userRepository.update(
        { email: resultUser.email },
        { point: resultUser.point - price },
      );
    }
  }

  async updateRates({ runner, successRate, rating }) {
    // runner rating 반영
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
      relations: {
        user: true,
      },
    });

    //성공한 거래 횟수 구하기
    const successTotal = await this.paymentHistoryRepository.count({
      where: { user: { id: runner.user.id }, status: 'safeMoney' },
      relations: {
        user: true,
      },
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

  updateRunnerCount({ user }) {
    return this.userRepository.update(
      { id: user.id },
      { runnerCount: user.runnerCount + 1 },
    );
  }
}
