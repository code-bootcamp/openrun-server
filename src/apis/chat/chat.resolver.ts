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
    // 현재 채팅방에 채팅 메시지 조회
    return this.chatService.load({ room });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ChatRoom])
  fetchUserChatRoom(
    @Context() context: IContext, //
  ) {
    // 현재 유저 조회
    const user = context.req.user;

    // 현재 유저가 가지고 있는 채팅방 목록 조회
    return this.chatService.findAllUser({ email: user.email });
  }
}
