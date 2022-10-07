import {
  ConflictException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { IamportsService } from '../iamport/iamport.service';
import { UsersService } from '../users/users.service';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';
import { PaymentByDate } from './entities/paymentByDate';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService, //
    private readonly iamportService: IamportsService, //
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Payment])
  async fetchPointChargeHistory(
    @Context() context: IContext, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    const user = context.req.user;

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({ email: user.email });

    // 현재 유저의 포인트 충전내역 조회
    const result = await this.paymentsService.findPointCharge({
      id: findUser.id,
      page,
    });

    return result;
  }

  @Query(() => [PaymentByDate])
  fetchPayments() {
    // 날짜별로 매출 조회
    return this.paymentsService.findTotalAmount();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async chargePayment(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    // 결제내역 조회
    const isPayment = await this.paymentsService.findPayment({ impUid });

    // 이미 결제한 내역인지 검증
    if (isPayment) throw new ConflictException('이미 결제된 내역입니다.');

    // 토큰 발급
    const token = await this.iamportService.createIamportAccessToken();

    // 아임포트에서 결제내역 검증
    const isValid = await this.iamportService.checkPayment({ token, impUid });

    // 아임포트에서 오는 내역이 에러코드인지 검증
    if (typeof isValid === 'string')
      throw new UnprocessableEntityException(isValid);

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({ email: user.email });

    // 결제내역 생성
    return this.paymentsService.create({ impUid, amount, user: findUser });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async cancelPayment(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    // 결제내역 조회
    const isCanceled = await this.paymentsService.findPayment({ impUid });

    // 이미 환불된 내역인지 검증
    if (isCanceled.status === PAYMENT_STATUS_ENUM.CANCEL)
      throw new UnprocessableEntityException('이미 환불 되었습니다.');

    // 유저 조회
    const findUser = await this.usersService.findOne({ email: user.email });

    // 현재 유저와 거래내역에 유저와 같은지 검증
    if (findUser.id !== isCanceled.user.id)
      throw new UnprocessableEntityException('유저 정보가 일치하지 않습니다.');

    // 현재 유저의 포인트가 충분한지 검증
    if (findUser.point < amount)
      throw new UnprocessableEntityException('보유 포인트가 부족합니다.');

    // 토큰 발급
    const token = await this.iamportService.createIamportAccessToken();

    // 정상적인 거래내역인지 아임포트에서 확인
    const isValid = await this.iamportService.checkPayment({ token, impUid });

    // 아임포트에 요청한 검증이 에러인지 검증
    if (typeof isValid === 'string')
      throw new UnprocessableEntityException(isValid);

    // 아임포트에서 요청한 거래내역이 이미 환불된 내역인지 검증
    if (isValid.data.response.status === 'cancelled')
      throw new UnprocessableEntityException('이미 환불 되었습니다.');

    // 환불 요청
    const cancelAmount = await this.iamportService.cancelPayment({
      impUid,
      token,
      amount,
    });

    // 환불내역 저장
    return this.paymentsService.cancel({
      impUid,
      user: findUser,
      amount: cancelAmount,
    });
  }
}
