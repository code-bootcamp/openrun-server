import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import coolsms from 'coolsms-node-sdk';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  findOne({ phone }) {
    return this.tokenRepository.findOne({ where: { phone } });
  }

  create({ phone, token }) {
    //DB에 토큰 저장
    return this.tokenRepository.save({
      phone,
      token,
    });
  }

  createToken() {
    const number = 6;

    //토큰 발생
    const token = String(Math.floor(Math.random() * 10 ** number)).padStart(
      number,
      '0',
    );
    return token;
  }

  async sendTokenToPhone({ phone, token }) {
    try {
      const text = `[OpenRun] 인증번호 ${token}을 입력해주세요.`;

      const SMS_KEY = process.env.SMS_KEY;
      const SMS_SECRET = process.env.SMS_SECRET;
      const SMS_SENDER = process.env.SMS_SENDER;

      const messageService = new coolsms(SMS_KEY, SMS_SECRET);
      await messageService.sendOne({
        to: phone,
        from: SMS_SENDER,
        text,
        type: 'SMS',
        autoTypeDetect: false,
      });
      return '인증번호 전송 완료';
    } catch (error) {
      throw new NotFoundException('인증번호 전송에 실패하였습니다.');
    }
  }

  async compareToken({ phone, token }) {
    //phone으로 token데이터 찾기
    const savedToken = await this.findOne({ phone });

    //입력받은 인증번호 일치 여부 확인
    if (savedToken) {
      if (savedToken.token === token) {
        await this.tokenRepository.save({
          ...savedToken,
          isAuth: true,
        });
        return true;
      } else {
        return false;
      }
    } else {
      throw new NotFoundException('인증번호 요청을 먼저 수행해주세요.');
    }
  }

  checkPhoneLength({ phone }) {
    if (phone.length !== 11 && phone.length !== 10) {
      throw new NotFoundException('전화번호를 확인해주세요.');
    } else {
      return true;
    }
  }

  async checkIsExist({ phone }) {
    const existUser = await this.findOne({ phone });
    if (existUser) {
      await this.tokenRepository.save({
        ...existUser,
        isAuth: false,
      });
    }
  }
}
