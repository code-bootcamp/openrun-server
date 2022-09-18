import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver, Query, Int } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { Interest } from './entities/interests.entity';
import { InterestsService } from './interests.service';

@Resolver()
export class InterestsResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly boardsService: BoardsService,
    private readonly interestsService: InterestsService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Interest])
  async fetchInterestBoards(
    @Context() context: IContext, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    const user = context.req.user;

    return this.interestsService.findInterests({ email: user.email, page });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [String])
  fetchInterestBoardId(
    @Context() context: IContext, //
  ) {
    return this.interestsService.findInterestsId({
      email: context.req.user.email,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async addInterestList(
    @Args('boardId') boardId: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({ email: user.email });

    const findBoard = await this.boardsService.findOne({ boardId });

    const findInterest = await this.interestsService.findInterest({
      user: findUser,
      board: findBoard,
    });

    console.log('==========', findInterest);

    if (findInterest) {
      this.interestsService.delete({ interest: findInterest });
      return false;
    }

    this.interestsService.create({ user: findUser, board: findBoard });
    return true;
  }
}
