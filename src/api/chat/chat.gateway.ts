import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ChatMessage } from './entities/chatMessage.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>, //

    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  @WebSocketServer()
  server: Server;

  wsClients = [];

  @SubscribeMessage('message')
  connectSomeone(@MessageBody() data: string, @ConnectedSocket() client) {
    const [nickname, room] = data;
    console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`);
    const comeOn = `${nickname}님이 입장했습니다.`;
    this.server.emit('comeOn' + room, comeOn);
    this.wsClients.push(client);
  }

  private broadcast(event, client, message: any) {
    for (const c of this.wsClients) {
      if (client.id == c.id) continue;
      c.emit(event, message);
    }
  }

  @SubscribeMessage('send')
  async sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;
    const user = await this.usersRepository.findOne({
      where: { nickName: nickname },
    });
    await this.chatMessageRepository.save({
      message: message,
      room: room,
      user: user,
    });
    console.log(`${client.id} : ${data}`);
    this.broadcast(room, client, [nickname, message]);
  }
}
