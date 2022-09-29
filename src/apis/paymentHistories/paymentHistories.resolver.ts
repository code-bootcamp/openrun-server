import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { PaymentHistory } from './entities/paymentHistory.entity';
import { PaymentHistoriesService } from './paymentHistories.service';

@Resolver()
export class PaymentHistoriesResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly paymentHistoriesService: PaymentHistoriesService,
    private readonly boardsService: BoardsService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [PaymentHistory])
  async fetchPaymentHistory(
    @Context() context: IContext, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    const user = context.req.user;

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({
      email: user.email,
    });

    // 현재 유저의 거래내역 조회
    return this.paymentHistoriesService.findAllByUser({ user: findUser, page });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async fetchPaymentHistoryCount(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({ email: user.email });

    // 유저가 관리자인지 검증
    if (!findUser.isAdmin) throw new NotFoundException('관리자가 아닙니다.');

    // 거래내역에 총 횟수 조회
    return (await this.paymentHistoriesService.findAll()).length;
  }
}
