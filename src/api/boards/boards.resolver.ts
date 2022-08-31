import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import e from 'express';
import { stringify } from 'querystring';
import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  // @Query(() => [Board])
  // featchBoards() {
  //   return this.boardsService.findAll();
  // }
  @Mutation(() => Board)
  createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
    @Context() context: any, //
  ) {
    // const user = context.req.user;
    const user = {
      email: '123@123.com',
      id: 'abc',
    };

    return this.boardsService.create({ createBoardInput });
  }
}
