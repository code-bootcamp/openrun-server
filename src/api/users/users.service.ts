import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Runner } from '../runners/entities/runner.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly bankAccountsService: BankAccountsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //

    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>, // temporary
  ) {}

  findAll() {
    return this.userRepository.find({
      relations: ['bankAccount'],
    });
  }

  async findOne({ email }) {
    return await this.userRepository.findOne({
      where: { email },
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

  async delete({ email }) {
    const result = await this.userRepository.softDelete({ email });
    return result.affected;
  }

  async updateRate({ boardId, rate }) {
    //temporary - runner찾기
    const runner = await this.runnerRepository.findOne({
      where: { board: { id: boardId }, isChecked: true },
      relations: ['user', 'board'],
    });

    //rating 평균값 계산
    let newRate = 0;
    if (runner.user.rating > 0) {
      newRate = Number(((runner.user.rating + rate) / 2).toFixed(1));
    } else {
      newRate = rate;
    }

    //runner rating 반영
    const result = await this.userRepository.save({
      ...runner.user,
      rating: newRate,
    });

    //데이터 반영 확인 후 return
    if (result.rating !== newRate) {
      throw new NotFoundException('별점 반영에 실패하였습니다.');
    } else {
      return true;
    }
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
