import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { IamportsService } from '../iamport/iamport.service';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

export interface IUser {
  user: {
    email: string;
    sub: string;
  };
}

interface IContext {
  req?: Request & IUser;
  res?: Response;
}

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService, //
    private readonly iamportService: IamportsService, //
  ) {}

  @Mutation(() => Payment)
  async chargePayment(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Context() context: IContext, //
  ) {
    const user = context.req.user;
    // const user = {
    //   email: 'asd@asd.com',
    //   sub: '1d81836c-5aa3-4caf-a6e3-b9d03c7090c7',
    // };

    const isPayment = await this.paymentsService.findPayment({ impUid });

    if (isPayment) throw new ConflictException('이미 결제된 내역입니다.');

    const token = await this.iamportService.createIamportAccessToken();

    const isValid = await this.iamportService.checkPayment({ token, impUid });

    if (typeof isValid === 'string')
      throw new UnprocessableEntityException(isValid);

    return this.paymentsService.create({ impUid, amount, user });
  }
}
