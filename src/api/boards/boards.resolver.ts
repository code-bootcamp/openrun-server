import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

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

  //   @Query(() => [Board])
  //   test(
  //     @Args('keyword') keyword: string, //
  //   ) {
  //     return this.boardsService.findLocation({ keyword });
  //   }
  //
}
