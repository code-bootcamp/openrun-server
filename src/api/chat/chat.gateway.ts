import { NotFoundException } from '@nestjs/common';
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
import { BoardsService } from '../boards/boards.service';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
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

    private readonly chatService: ChatService,

    private readonly boardsService: BoardsService,
  ) {}
  @WebSocketServer()
  server: Server;

  wsClients = [];

  @SubscribeMessage('message')
  async connectSomeone(@MessageBody() data: string, @ConnectedSocket() client) {
    const [nickName, runnerId, boardId] = data;

    const findChatRoom = await this.chatService.findOne({
      boardId,
    });

    if (
      findChatRoom.seller.nickName !== nickName &&
      findChatRoom.runner.nickName !== nickName
    )
      throw new NotFoundException('다른 유저가 들어갈 수 없습니다.');

    const host = await this.usersRepository.findOne({
      where: { nickName },
    });

    const runner = await this.usersRepository.findOne({
      where: { id: runnerId },
    });

    const isRunner = await this.usersRepository.findOne({
      where: { nickName },
    });

    const board = await this.boardsService.findOne({
      boardId,
    });

    let room;

    if (!findChatRoom) {
      room = await this.chatService.create({
        room: 'first' + boardId,
        host,
        runner,
        board,
      });
    } else {
      room = findChatRoom;
    }

    console.log(room.room);

    const findSellerMessage = await this.chatMessageRepository.findOne({
      relations: {
        room: true,
        user: true,
      },
      where: { room: { room: room.room } } && { user: { nickName } },
    });

    const findRunnerMessage = await this.chatMessageRepository.findOne({
      relations: {
        room: true,
        user: true,
      },
      where: { room: { room: room.room } } && { user: { id: runnerId } },
    });

    const comeOn = `${nickName}님이 입장했습니다.`;

    if (!findSellerMessage) {
      this.chatMessageRepository.save({
        message: comeOn,
        room,
        user: host,
      });

      this.server.emit('first' + boardId, [comeOn, nickName]);

      this.wsClients.push(client);

      console.log(`${nickName}님이 코드: ${room.room}방에 접속했습니다.`);

      return;
    }

    if (!findRunnerMessage && isRunner.id !== host.id) {
      this.chatMessageRepository.save({
        message: comeOn,
        room,
        user: runner,
      });

      this.server.emit('first' + boardId, [comeOn, nickName]);

      this.wsClients.push(client);

      console.log(`${nickName}님이 코드: ${room.room}방에 접속했습니다.`);

      return;
    } else {
      this.wsClients.push(client);
      console.log(`${nickName}님이 코드: ${room.room}방에 접속했습니다.`);
    }
  }

  // private broadcast(event, client, message: any) {
  //   console.log(event);
  //   console.log('=================', this.wsClients);
  //   for (const c of this.wsClients) {
  //     if (client.id == c.id) continue;
  //     console.log(event);
  //     c.emit(event, message);
  //   }
  // }

  @SubscribeMessage('send')
  async sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;

    const boardId = room.slice(5);

    const findChatRoom = await this.chatService.findOne({
      boardId,
    });

    if (
      findChatRoom.seller.nickName !== nickname &&
      findChatRoom.runner.nickName !== nickname
    )
      throw new NotFoundException('다른 유저는 채팅을 칠 수 없습니다.');

    const user = await this.usersRepository.findOne({
      where: { nickName: nickname },
    });

    const findRoom = await this.chatRoomRepository.findOne({
      where: { room: room },
      relations: {
        runner: true,
        seller: true,
      },
    });

    console.log('==========', findRoom);

    await this.chatMessageRepository.save({
      message: message,
      room: findRoom,
      user: user,
    });

    this.server.emit(room, [nickname, message]);

    // this.broadcast(room, client, [nickname, message]);
  }
}
