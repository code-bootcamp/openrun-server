import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { User } from '../users/entities/user.entity';
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
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Report])
  fetchReports(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;
    return this.reportsService.findAll({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Report)
  async createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.reportsService.create({
      createReportInput,
      email: user.email,
    });
  }
}
