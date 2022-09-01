import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly cardInfosService: CardInfosService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
  ) {}

  async findOne({ email }) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['cardInfo'],
    });
  }

  async create({ _user, hashedPwd: password, cardInfoInput }) {
    //CardInfo저장
    const cardInfoResult = await this.cardInfosService.create({
      ...cardInfoInput,
    });

    //User 데이터 저장
    const userResult = await this.userRepository.save({
      ..._user,
      password,
      point: 0,
      rating: 0,
      report: 0,
      cardInfo: cardInfoResult,
    });
    return userResult;
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
