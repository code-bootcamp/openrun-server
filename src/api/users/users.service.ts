import { Injectable } from '@nestjs/common';
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

  findOne({ email }) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['cardInfo'],
    });
  }

  async create({ createUserInput }) {
    const { cardInfoInput, ...userInfo } = createUserInput;

    //CardInfo저장
    const cardInfoResult = await this.cardInfosService.create({
      ...cardInfoInput,
    });

    //User 데이터 저장
    const userResult = await this.userRepository.save({
      ...userInfo,
      point: 0,
      rating: 0,
      report: 0,
      cardInfo: cardInfoResult,
    });
    return userResult;
  }
}
