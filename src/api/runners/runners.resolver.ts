import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
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
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Runner])
  fetchRunnerByBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.runnersService.findAllByBoard({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Runner)
  async applyRunner(
    @Args('boardId') boardId: string, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({ email: user.email });

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
  ) {
    const board = await this.boardsService.findOne({ boardId });

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

    this.boardsService.updateStatus({ board });

    return this.runnersService.updateIsChecked({ runner });
  }
}
