import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
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

    const findUser = await this.usersService.findOne({
      email: user.email,
    });

    return this.paymentHistoriesService.findAllByUser({ user: findUser, page });
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

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PaymentHistory)
  async test(
    @Context() context: IContext, //
    @Args('boardId') boardId: string,
  ) {
    const user = await this.usersService.findOne({
      email: context.req.user.email,
    });
    const board = await this.boardsService.findOne({
      boardId,
    });

    return this.paymentHistoriesService.create({
      user,
      board,
      price: board.price,
      flag: true,
    });
  }
}
