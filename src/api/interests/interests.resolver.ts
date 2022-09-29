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

    // 현재 유저 관심목록 조회
    return this.interestsService.findInterests({ email: user.email, page });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [String])
  fetchInterestBoardId(
    @Context() context: IContext, //
  ) {
    // 현재 유저 관심목록 아이디만 조회
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

    // 현재 유저 조회
    const findUser = await this.usersService.findOne({ email: user.email });

    // 현재 게시물 조회
    const findBoard = await this.boardsService.findOne({ boardId });

    // 현재 유저의 관심목록 중 보드아이디로 조회
    const findInterest = await this.interestsService.findInterest({
      user: findUser,
      board: findBoard,
    });

    // 이미 관심목록에 등록한 게시물일 경우
    if (findInterest) {
      // 관심목록에서 삭제
      this.interestsService.delete({ interest: findInterest });
      return false;
    }

    // 관심목록에 등록
    this.interestsService.create({ user: findUser, board: findBoard });
    return true;
  }
}
