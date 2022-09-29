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

    // 챗룸 조회
    const findChatRoom = await this.chatService.findOne({
      boardId,
    });

    // 먼저 들어온 유저 조회
    const host = await this.usersRepository.findOne({
      where: { nickName },
    });

    // 그 이후 들어온 유저 조회
    const runner = await this.usersRepository.findOne({
      where: { id: runnerId },
    });

    // 현재 채팅방 게시물 조회
    const board = await this.boardsService.findOne({
      boardId,
    });

    let findRoom;

    if (!findChatRoom) {
      // 현재 게시물에 채팅방이 존재하지 않으면 새로 생성
      findRoom = await this.chatService.create({
        room: 'first' + boardId,
        host,
        runner,
        board,
      });
    } else {
      // 현재 게시물에 채팅방이 존재하면 조회해온 채팅방을 변수에 할당
      findRoom = findChatRoom;
    }

    // 채팅방에 들어오려는 유저가 현재 채팅방에 유저인지 검증
    if (
      findRoom.seller.nickName !== nickName &&
      findRoom.runner.nickName !== nickName
    )
      throw new NotFoundException('다른 유저가 들어갈 수 없습니다.');

    const comeOn = `${nickName}님이 입장했습니다.`;

    // 현재 유저가 방장인지 확인
    if (nickName === findRoom.seller.nickName) {
      // 방장인 유저메시지 조회
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

      // 방장인 적은 메시지가 없으면
      if (findSellerMessage.length === 0) {
        const result = await this.usersRepository.findOne({
          where: { nickName: findRoom.seller.nickName },
        });

        // 방문 메시지 저장
        this.chatMessageRepository.save({
          message: comeOn,
          room: findRoom,
          user: result,
        });

        // 방문 메시지 프론트로 보내기
        this.server.emit('first' + boardId, [comeOn, nickName]);

        // 방장에 클라이언트 푸시
        this.wsClients.push(client);

        return;
      }
    }

    // 현재 유저가 상대방이면
    if (nickName === findRoom.runner.nickName) {
      // 상대 유저 메시지 조회
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

      // 메시지가 없으면
      if (findRunnerMessage.length === 0) {
        const result = await this.usersRepository.findOne({
          where: { nickName: findRoom.runner.nickName },
        });

        // 방문메시지 저장
        this.chatMessageRepository.save({
          message: comeOn,
          room: findRoom,
          user: result,
        });

        // 방문메시지 프론트로 보내기
        this.server.emit('first' + boardId, [comeOn, nickName]);

        // 상대유저 클라이언트 푸시
        this.wsClients.push(client);

        return;
      }
    }
  }

  @SubscribeMessage('send')
  async sendMessage(
    @MessageBody() data: string, //
  ) {
    const [room, nickname, message] = data;

    // 룸번호에서 보드아이디만 가져오기
    const boardId = room.slice(5);

    // 현재 게시물에 채팅방 조회
    const findChatRoom = await this.chatService.findOne({
      boardId,
    });

    // 현재 채팅방에 유저가 맞는지 검증
    if (
      findChatRoom.seller.nickName !== nickname &&
      findChatRoom.runner.nickName !== nickname
    )
      throw new NotFoundException('다른 유저는 채팅을 칠 수 없습니다.');

    // 현재 유저 조회
    const user = await this.usersRepository.findOne({
      where: { nickName: nickname },
    });

    // 현재 채팅방 룸 번호로 조회
    const findRoom = await this.chatRoomRepository.findOne({
      where: { id: room },
      relations: {
        runner: true,
        seller: true,
      },
    });

    // 채팅 메시지 저장
    await this.chatMessageRepository.save({
      message: message,
      room: findRoom,
      user: user,
    });

    // 프론트로 닉네임, 채팅 메시지 보내기
    this.server.emit(room, [nickname, message]);
  }
}
