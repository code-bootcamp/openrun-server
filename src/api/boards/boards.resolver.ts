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
    @Args({ name: 'category', nullable: true }) category: string,
    @Args({ name: 'direcion', nullable: true, defaultValue: '' })
    direcion: string,
    @Args({ name: 'search', nullable: true })
    search: string,
    @Args('dateType') dateType: string, //
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number, //
  ) {
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
        console.log(result);
        return this.boardsService.elasticResult({ result });
      }

      return this.boardsService.findAllbyCurrent({ page, direcion, category });
    }
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
        console.log(result);
        return this.boardsService.elasticResult({ result });
      }

      return this.boardsService.findAllbyCurrent({ page, direcion, category });
    }
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
  @Query(() => [Board])
  fetchBoardProcessingByUser(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    return this.boardsService.findBoardProcessing({ email: user.email });
  }

  @Query(() => [Board])
  async fetchBestOfBoards(
    @Args({ name: 'category', nullable: true }) category: string,
    @Args({ name: 'page', nullable: true, type: () => Int }) page: number,
  ) {
    return this.boardsService.findBestOfBoards({ category, page });
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
  async deleteBoard(
    @Args('boardId') boardId: string, //
  ) {
    //board 삭제
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
