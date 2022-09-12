import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { RunnersService } from '../runners/runners.service';
import { UsersService } from '../users/users.service';
import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';

@Resolver()
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly runnersService: RunnersService,
    private readonly usersService: UsersService,
    private readonly paymentHistoriesService: PaymentHistoriesService,
  ) {}

  @Query(() => [Board])
  fetchBoards(
    @Args('dateType') dateType: string, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number, //
  ) {
    if (dateType === '최신순')
      //
      return this.boardsService.findAllbyCurrent({ page });
    if (dateType === '마감 임박순')
      //
      return this.boardsService.findAllbyLimit({ page });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  fetchWriteBoards(
    @Context() context: IContext, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    const user = context.req.user;
    return this.boardsService.findAllbyUser({ email: user.email, page });
  }

  @Query(() => Board)
  fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.boardsService.findOne({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    return this.boardsService.create({ createBoardInput, email: user.email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async completeBusiness(
    @Args('boardId') boardId: string, // 거래완료 할 게시물
  ) {
    // 진행중-> 거래완료 상태 수정
    const board = await this.boardsService.findOne({ boardId });
    if (board.status === BOARD_STATUS_ENUM.FINISHED)
      throw new NotFoundException('이미 거래완료된 게시물 입니다.');

    //   러너 정보 Get
    console.log('============', board);
    const runner = await this.runnersService.findRunner({ boardId });

    //러너 포인트 업데이트
    const returnMoney = board.price * 0.1 + board.price;

    const updatePoint = await this.usersService.updatePoint({
      resultUser: runner.user,
      price: returnMoney,
      flag: true,
    });
    //상태 업데이트
    const updateStatus = await this.boardsService.updateToFinish({ board });

    console.log('!!!!!!!!!!', updateStatus);
    // 거래내역 히스토리에 저장
    const saveHistory = await this.paymentHistoriesService.create({
      user: runner.user,
      board: board,
      price: board.price,
      flag: false,
    });

    return saveHistory;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('boardId') boardId: string,
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
  ) {
    return await this.boardsService.update({ boardId, updateBoardInput });
  }
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.boardsService.delete({ boardId });
  }

  // @Query(() => [Board])
  // test(
  //   @Args('keyword') keyword: string, //
  // ) {
  //   return this.boardsService.findLocation({ keyword });
  // }
}
