import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardInfo } from './entities/cardInfo.entity';

@Injectable()
export class CardInfosService {
  constructor(
    @InjectRepository(CardInfo)
    private readonly cardInfoRepository: Repository<CardInfo>,
  ) {}

  async create({ cardCompany, cardNum, expireDate, cvcNum }) {
    return await this.cardInfoRepository.save({
      cardCompany,
      cardNum,
      expireDate,
      cvcNum,
    });
  }
}
