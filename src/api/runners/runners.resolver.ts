import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Runner } from './entities/runner.entity';
import { RunnersService } from './runners.service';

@Resolver()
export class RunnersResolver {
  constructor(
    private readonly boardsService: BoardsService, //
    private readonly usersService: UsersService, //
    private readonly runnersService: RunnersService,
    private readonly paymentHistoriesService: PaymentHistoriesService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Runner])
  fetchRunnerByBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.runnersService.findAllByBoard({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  async fetchRunner(@Args('boardId') boardId: string) {
    return (await this.runnersService.findRunner({ boardId })).user;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Runner])
  fetchRuunerProcessingByUser(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    return this.runnersService.findRunnerProcessing({ email: user.email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Runner)
  async applyRunner(
    @Args('boardId') boardId: string, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({ email: user.email });

    const findRunner = await this.runnersService.findRunnerByBoard({
      boardId,
      user: findUser,
    });

    if (findRunner) throw new NotFoundException('이미 신청한 게시물입니다.');

    const board = await this.boardsService.findOne({ boardId });

    const safetyMoney = board.price * 0.1;

    if (findUser.point < safetyMoney)
      throw new NotFoundException('보증금이 부족합니다.');

    return this.runnersService.create({ user: findUser, board });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Runner)
  async adoptRunner(
    @Args('userId') userId: string, //
    @Args('boardId') boardId: string,
    @Context() context: IContext,
  ) {
    const board = await this.boardsService.findOne({ boardId });

    if (board.user.email !== context.req.user.email)
      throw new NotFoundException(
        '게시글을 작성한 유저만이 채택을 할 수 있습니다.',
      );

    if (board.status === BOARD_STATUS_ENUM.INPROGRESS)
      throw new NotFoundException('이미 진행중인 게시물입니다.');

    // 여기서 사용하는 userId는 신청한 유저의 userId
    const runner = await this.runnersService.findOneByBoardUser({
      userId,
      boardId,
    });

    const user = await this.usersService.findOneById({ userId });

    const safetyMoney = board.price * 0.1;

    if (user.point < safetyMoney)
      throw new NotFoundException('러너가 보유한 보증금이 모자릅니다.');

    if (runner.isChecked)
      throw new NotFoundException('이미 신청한 게시물 입니다.');

    // 보드 상태 진행중으로 변경
    this.boardsService.updateStatus({ board });

    // 러너 보증금 차감
    this.usersService.updatePoint({
      resultUser: user,
      price: safetyMoney,
      flag: false,
    });

    // 보증금 차감한 로그 쌓기
    this.paymentHistoriesService.create({
      user: user,
      board: board,
      price: safetyMoney,
      flag: true,
    });

    return await this.runnersService.updateIsChecked({ runner });
  }
}
