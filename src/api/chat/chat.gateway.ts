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

    const host = await this.usersRepository.findOne({
      where: { nickName },
    });

    const runner = await this.usersRepository.findOne({
      where: { id: runnerId },
    });

    const board = await this.boardsService.findOne({
      boardId,
    });

    let findRoom;

    if (!findChatRoom) {
      findRoom = await this.chatService.create({
        room: 'first' + boardId,
        host,
        runner,
        board,
      });
    } else {
      findRoom = findChatRoom;
    }

    console.log('===================findChatRoom===================', findRoom);

    if (
      findRoom.seller.nickName !== nickName &&
      findRoom.runner.nickName !== nickName
    )
      throw new NotFoundException('다른 유저가 들어갈 수 없습니다.');

    const comeOn = `${nickName}님이 입장했습니다.`;

    if (nickName === findRoom.seller.nickName) {
      const findSellerMessage = await this.chatMessageRepository.find({
        relations: {
          room: true,
          user: true,
        },
        where: {
          room: { id: findRoom.id },
          user: { nickName: findRoom.seller.nickName },
        },
      });

      console.log(
        '===================findSellerMessage===================',
        findSellerMessage,
      );

      if (findSellerMessage.length === 0) {
        this.chatMessageRepository.save({
          message: comeOn,
          room: findRoom,
          user: host,
        });

        this.server.emit('first' + boardId, [comeOn, nickName]);

        this.wsClients.push(client);

        return;
      }
    }

    if (nickName === findRoom.runner.nickName) {
      const findRunnerMessage = await this.chatMessageRepository.find({
        relations: {
          room: true,
          user: true,
        },
        where: {
          room: { id: findRoom.id },
          user: { nickName: findRoom.runner.nickName },
        },
      });

      console.log(
        '===================findRunnerMessage===================',
        findRunnerMessage,
      );

      if (findRunnerMessage.length === 0) {
        this.chatMessageRepository.save({
          message: comeOn,
          room: findRoom,
          user: runner,
        });

        this.server.emit('first' + boardId, [comeOn, nickName]);

        this.wsClients.push(client);

        return;
      }
    }
    // this.wsClients.push(client);
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

    console.log(client);

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
      where: { id: room },
      relations: {
        runner: true,
        seller: true,
      },
    });

    await this.chatMessageRepository.save({
      message: message,
      room: findRoom,
      user: user,
    });

    this.server.emit(room, [nickname, message]);

    // this.broadcast(room, client, [nickname, message]);
  }
}
