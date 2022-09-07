import { NotFoundException, UseGuards } from '@nestjs/common';
import { Context, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { PaymentHistory } from './entities/paymentHistory.entity';
import { PaymentHistoriesService } from './paymentHistories.service';

@Resolver()
export class PaymentHistoriesResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly paymentHistoriesService: PaymentHistoriesService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [PaymentHistory])
  async fetchPaymentHistory(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({
      email: user.email,
    });

    return this.paymentHistoriesService.findAllByUser({ user: findUser });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async fetchPaymentHistoryCount(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({ email: user.email });

    if (!findUser.isAdmin) throw new NotFoundException('관리자가 아닙니다.');

    return (await this.paymentHistoriesService.findAll()).length;
  }
}
