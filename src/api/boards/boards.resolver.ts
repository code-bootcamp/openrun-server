import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';

import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @Query(() => [Board])
  featchBoards() {
    return this.boardsService.findAll();
  }

  @Query(() => Board)
  fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.boardsService.findOne({ boardId });
  }

  @Mutation(() => Board)
  createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
    //@Context() context: any
  ) {
    // const user = context.req.user;
    const user = {
      email: '12@na.com',
      id: 'abc',
    };

    return this.boardsService.create({ createBoardInput, email: user.email });
  }
}
