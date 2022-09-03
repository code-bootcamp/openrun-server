import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly bankAccountsService: BankAccountsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
  ) {}

  async findOne({ email }) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['bankAccount'],
    });
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

  // updateUser({ updateUserInput }) {
  //   const {bankAccount, ..._user}
  // }

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

  async checkIsUserAvailable({ email }) {
    const result = await this.userRepository.findOne({ where: { email } });
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
}
