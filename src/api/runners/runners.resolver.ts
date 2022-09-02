import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { Board, BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
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
  @Query(() => [User])
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

    if (runner.isChecked)
      throw new NotFoundException('이미 신청한 게시물 입니다.');

    this.runnersService.updateStatus({ board });

    return this.runnersService.updateIsChecked({ runner });
  }
}
