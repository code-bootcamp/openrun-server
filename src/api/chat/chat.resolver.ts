import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService, //

    private readonly usersService: UsersService,

    private readonly boardsService: BoardsService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ChatRoom)
  async createRoom(
    @Args('userEmail') userEmail: string,
    @Args('boardId') boardId: string,
    @Context() context: IContext, //
  ) {
    const prevRoom = await this.chatService.findOne({ boardId });

    const email = context.req.user.email;

    if (userEmail !== prevRoom.runner.email || email !== prevRoom.seller.email)
      throw new NotFoundException('다른 유저는 들어갈 수 없습니다!');

    if (prevRoom) return prevRoom;

    const hostUser = await this.usersService.findOne({ email });
    const curUser = await this.usersService.findOne({ email: userEmail });

    const board = await this.boardsService.findOne({ boardId });

    return this.chatService.create({ hostUser, curUser, board });
  }

  @Query(() => ChatRoom)
  async connectionRoom(
    @Context() context: IContext, //
    @Args('userEmail') userEmail: string,
  ) {
    const email = context.req.user.email;

    const hostUser = await this.usersService.findOne({ email });
    const curUser = await this.usersService.findOne({ email: userEmail });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatMessage])
  fetchLogs(
    @Args('room') room: string, //
  ) {
    return this.chatService.load({ room });
  }
}
