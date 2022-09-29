import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import axios from 'axios';

@Injectable()
export class IamportsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createIamportAccessToken() {
    try {
      // 토큰발급 api 요청
      const result = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          imp_key: process.env.IMP_KEY,
          imp_secret: process.env.IMP_SECRET,
        },
      });
      // 발급받은 토큰 리턴
      return result.data.response.access_token;
    } catch (err) {
      throw new Error(err);
    }
  }

  async checkPayment({ token, impUid }) {
    try {
      // 결제정보 검증 api 요청
      const result = await axios({
        url: `https://api.iamport.kr/payments/${impUid}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return result;
    } catch (err) {
      return err.response.data.message;
    }
  }

  async cancelPayment({ impUid, token, amount }) {
    // 결제 환불 api 요청
    const result = await axios({
      url: 'https://api.iamport.kr/payments/cancel',
      method: 'post',
      headers: {
        Authorization: token,
      },
      data: {
        reason: '이유는 생각해봐야 됨',
        imp_uid: impUid,
        amount,
      },
    });
    return result.data.response.amount;
  }
}
