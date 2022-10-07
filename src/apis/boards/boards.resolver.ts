import { NotFoundException, UseGuards } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
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
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Query(() => [Board])
  async fetchBoards(
    //카테고리별로 게시물 조회
    @Args({ name: 'category', nullable: true }) category: string,
    //빈 배열로 값을 입력했을 때 undifined 뜨는 것 방지용
    @Args({ name: 'direcion', nullable: true, defaultValue: '' })
    direcion: string,
    //elasticsearch로 데이터 검색
    @Args({ name: 'search', nullable: true })
    search: string,
    //데이터를 전체, 최신순, 마감 임박순으로 나눠서 조회
    @Args('dateType') dateType: string, //
    //pagination
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number, //
  ) {
    //검색 할 때 모든 데이터로 조회, 검색 받을 인자는 지역과 타이틀
    if (dateType === '전체') {
      if (search) {
        const elasticResult = await this.elasticsearchService.search({
          index: 'board',
          query: {
            bool: {
              must: [
                direcion !== '전체' &&
                  direcion && {
                    term: { address: direcion },
                  },
                {
                  term: { title: search },
                },
              ],
            },
          },
          sort: [
            {
              updatedAt: 'desc',
            },
          ],
          size: 12,
          from: page ? (page - 1) * 12 : 0,
        });
        const result = elasticResult.hits.hits;
        return this.boardsService.elasticResult({ result });
      }
      return this.boardsService.findAllbyCurrent({ page, direcion, category });
    }
    //검색 할 때 최신순으로 조회
    if (dateType === '최신순') {
      if (search) {
        const elasticResult = await this.elasticsearchService.search({
          index: 'board',
          query: {
            bool: {
              must: [
                direcion !== '전체' &&
                  direcion && {
                    term: { address: direcion },
                  },
                {
                  term: { title: search },
                },
              ],
            },
          },
          sort: [
            {
              updatedAt: 'desc',
            },
          ],
          size: 12,
          from: page ? (page - 1) * 12 : 0,
        });
        const result = elasticResult.hits.hits;
        return this.boardsService.elasticResult({ result });
      }
      return this.boardsService.findAllbyCurrent({ page, direcion, category });
    }
    // 검색 할 때 마감 임박순으로 조회
    if (dateType === '마감 임박순') {
      if (search) {
        const elasticResult = await this.elasticsearchService.search({
          index: 'board',
          query: {
            bool: {
              must: [
                direcion !== '전체' &&
                  direcion && {
                    term: { address: direcion },
                  },
                {
                  term: { title: search },
                },
              ],
            },
          },
          sort: [
            {
              dueDate: 'asc',
            },
          ],
          size: 12,
          from: page ? (page - 1) * 12 : 0,
        });
        const result = elasticResult.hits.hits;
        return this.boardsService.elasticResult({ result });
      }
      return this.boardsService.findAllbyLimit({ page, direcion, category });
    }
  }
  //로그인한 유저가 작성한 모든 게시물 목록 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  fetchBoardRecruitingByUser(
    @Context() context: IContext, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    const user = context.req.user;
    return this.boardsService.findAllbyUser({ email: user.email, page });
  }
  //게시물 하나 조회
  @Query(() => Board)
  fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    return this.boardsService.findOne({ boardId });
  }
  //로그인한 유저가 작성한 진행중인 게시물 목록 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  fetchBoardInprocessingByUser(
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    return this.boardsService.findBoardProcessing({ email: user.email, page });
  }
  //찜 수가 가장 높은 게시물을 카테고리 별로 조회
  @Query(() => [Board])
  async fetchBestOfBoards(
    @Args({ name: 'category', nullable: true }) category: string,
  ) {
    return this.boardsService.findBestOfBoards({ category });
  }
  //게시물 생성
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    return this.boardsService.create({ createBoardInput, email: user.email });
  }
  //진행중인 게시물 거래완료로 변경
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async completeBusiness(
    // 거래완료 할 게시물id
    @Args('boardId') boardId: string,
  ) {
    // 진행중-> 거래완료 상태 수정
    const board = await this.boardsService.findOne({ boardId });
    //이미 거래완료된 게시물에 실행하게 될 시 에러띄우기
    if (board.status === BOARD_STATUS_ENUM.FINISHED)
      throw new NotFoundException('이미 거래완료된 게시물 입니다.');

    //   러너 정보 Get
    const runner = await this.runnersService.findRunner({ boardId });

    //러너 포인트 업데이트
    const returnMoney = board.price * 0.1 + board.price;

    await this.usersService.updatePoint({
      resultUser: runner.user,
      price: returnMoney,
      flag: true,
    });

    // 러너 줄서기 건수 업데이트
    await this.usersService.updateRunnerCount({ user: runner.user });

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
  //게시물 수정
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('boardId') boardId: string,
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
  ) {
    const result = await this.boardsService.update({
      boardId,
      updateBoardInput,
    });
    console.log(result);
    return result;
  }
  //게시물 삭제
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId') boardId: string, //
  ) {
    const result = await this.boardsService.delete({ boardId });

    //elasticsearch내의 해당 doc 삭제
    await this.elasticsearchService.deleteByQuery({
      index: 'board',
      query: {
        match: {
          _id: boardId,
        },
      },
    });

    return result;
  }
}
