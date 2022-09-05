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

  async create({ curUser, hostUser, board }) {
    const result = await this.chatRoomRepository.save({
      seller: hostUser,
      runner: curUser,
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
}
