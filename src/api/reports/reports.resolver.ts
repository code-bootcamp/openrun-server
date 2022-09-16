import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { CreateReportInput } from './dto/report.input';
import { Report } from './entities/report.entity';
import { ReportsService } from './reports.service';

@Resolver()
export class ReportsResolver {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
  ) {}
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Report])
  async fetchReports(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    await this.usersService.checkIsAdmin({ email });

    return this.reportsService.findAll({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Report)
  async createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    this.boardsService.updateStatusReporting({
      boardId: createReportInput.boardId,
    });

    return this.reportsService.create({
      createReportInput,
      email: user.email,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async completeReport(
    @Context() context: IContext, //
    @Args('boardId') boardId: string,
  ) {
    const user = context.req.user;

    await this.usersService.checkIsAdmin({ email: user.email });

    return (await this.boardsService.updateStatusCompleted({ boardId }))
      .affected;
  }

  @Mutation(() => Boolean)
  deleteReport(
    @Args('reportId') reportId: string, //
  ) {
    return this.reportsService.delete({ reportId });
  }
}
