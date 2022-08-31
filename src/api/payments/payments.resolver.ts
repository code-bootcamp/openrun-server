import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/types/type';
import { IamportsService } from '../iamport/iamport.service';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService, //
    private readonly iamportService: IamportsService, //
  ) {}

  @Query(() => [Payment])
  async fetchPointChargeHistory(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;
    // const user = {
    //   email: 'asd@asd.com',
    //   sub: '1d81836c-5aa3-4caf-a6e3-b9d03c7090c7',
    // };

    const isUser = await this.paymentsService.findOne({ email: user.email });

    const result = await this.paymentsService.findPointCharge({
      id: isUser.id,
    });

    return result;
  }

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

    const isUser = await this.paymentsService.findOne({ email: user.email });

    if (typeof isValid === 'string')
      throw new UnprocessableEntityException(isValid);

    return this.paymentsService.create({ impUid, amount, user: isUser });
  }

  @Mutation(() => Payment)
  async cancelPayment(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    const isCanceled = await this.paymentsService.findPayment({ impUid });

    if (isCanceled.status === PAYMENT_STATUS_ENUM.CANCEL)
      throw new UnprocessableEntityException('이미 환불 되었습니다.');

    const isUser = await this.paymentsService.findOne({ email: user.email });

    if (isUser.id !== isCanceled.user.id)
      throw new UnprocessableEntityException('유저 정보가 일치하지 않습니다.');

    if (isUser.point < amount)
      throw new UnprocessableEntityException('보유 포인트가 부족합니다.');

    const token = await this.iamportService.createIamportAccessToken();

    const isValid = await this.iamportService.checkPayment({ token, impUid });

    if (typeof isValid === 'string')
      throw new UnprocessableEntityException(isValid);

    if (isValid.data.response.status === 'cancelled')
      throw new UnprocessableEntityException('이미 환불 되었습니다.');

    const cancelAmount = await this.iamportService.cancelPayment({
      impUid,
      token,
      amount,
    });

    return this.paymentsService.cancel({
      impUid,
      user: isUser,
      amount: cancelAmount,
    });
  }
}
