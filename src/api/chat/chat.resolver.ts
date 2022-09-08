import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatMessage])
  fetchChatLogs(
    @Args('room') room: string, //
  ) {
    return this.chatService.load({ room });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatRoom])
  fetchUserChatRoom(
    @Context() context: IContext, //
  ) {
    const user = context.req.user;

    return this.chatService.findAllUser({ email: user.email });
  }
}
