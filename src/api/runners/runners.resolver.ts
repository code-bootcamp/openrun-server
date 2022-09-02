import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { Runner } from './entities/runner.entity';
import { RunnersService } from './runners.service';

@Resolver()
export class RunnersResolver {
  constructor(
    private readonly boardsService: BoardsService, //
    private readonly usersService: UsersService, //
    private readonly runnersService: RunnersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Runner)
  async applyRunner(
    @Args('boardId') boardId: string, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOne({ email: user.email });

    const board = await this.boardsService.findOne({ boardId });

    return this.runnersService.create({ user: findUser, board });
  }
}
