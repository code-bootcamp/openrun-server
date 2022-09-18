import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board, BOARD_STATUS_ENUM } from '../boards/entities/board.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefreshesService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistory: Repository<PaymentHistory>,
  ) {}

  //   @Cron('* * * * * *')
  //   test() {
  //     console.log('Hola!');
  //   }

  @Cron('* * * * *')
  async refreshBoard() {
    //
    const newBoard = await this.boardRepository.find({
      where: { status: BOARD_STATUS_ENUM.RECRUITING },
      relations: ['user'],
    });
    const today = new Date();

    for (let i = 0; i < newBoard.length; i++) {
      if (today > newBoard[i].dueDate) {
        //

        this.boardRepository.update(
          { id: newBoard[i].id },
          { status: BOARD_STATUS_ENUM.ENDED },
        );
        // status 바꾸기
        const result = await this.paymentHistory.save({
          board: newBoard[i],
          user: newBoard[i].user,
          price: newBoard[i].price,
          title: newBoard[i].title,
          status: 'refund',
        });
        console.log(result);
        this.userRepository.update(
          { email: newBoard[i].user.email },
          { point: newBoard[i].user.point + newBoard[i].price },
        );
        // user 포인트 업데이트 시켜주기
      }
      return newBoard;
    }
  }
}
