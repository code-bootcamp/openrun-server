import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chatMessage.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}

  async create({ room, host, runner, board }) {
    const result = await this.chatRoomRepository.save({
      room: room,
      seller: host,
      runner: runner,
      board: board,
    });
    console.log(result);
    return result;
  }

  async load({ room }) {
    const result = await this.chatMessageRepository.find({
      where: { room },
      order: { createdAt: 'ASC' },
      relations: {
        user: {
          bankAccount: true,
        },
      },
    });

    return result;
  }

  findOne({ boardId }) {
    return this.chatRoomRepository.findOne({
      where: { board: { id: boardId } },
      relations: {
        seller: true,
        runner: true,
        board: true,
      },
    });
  }

  findAllUser({ email }) {
    return this.chatRoomRepository.find({
      where: { runner: { email: email } } || { seller: { email: email } },
    });
  }
}
