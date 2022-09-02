import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { PaymentHistory } from './entities/paymentHistory.entity';
import { PaymentHistoriesService } from './paymentHistories.service';

@Resolver()
export class PaymentHistoriesResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly paymentHistoiesService: PaymentHistoriesService,
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

    return this.paymentHistoiesService.findAllByUser({ user: findUser });
  }
}
