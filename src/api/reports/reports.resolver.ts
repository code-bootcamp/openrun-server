import { Query, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersResolver } from '../users/users.resolver';
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

  //   @Query(() => [Report])
  //   fetchReport() {}

  //   @Query(() => )

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Report)
  async createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.reportsService.creat({
      createReportInput,
      email: user.email,
    });
  }
}
