import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
// import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
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

    private readonly elasticSearchService: ElasticsearchService,
  ) {}
  // 크론탭 사용
  @Cron('* * * * *')
  async refreshBoard() {
    //마감기간이 넘어간 board가 있는지 확인
    const today = new Date();
    const newBoard = await this.boardRepository.find({
      where: {
        status: BOARD_STATUS_ENUM.RECRUITING, //
        dueDate: LessThan(today),
      },

      relations: ['user'],
    });

    // 거래 완료, 신고 진행중인 게시물은 상태 변경
    const newBoard2 = await this.boardRepository.find({
      where: [
        { status: BOARD_STATUS_ENUM.COMPLETED },
        { status: BOARD_STATUS_ENUM.REPORTING },
        {
          status: BOARD_STATUS_ENUM.INPROGRESS, //
          dueDate: LessThan(today),
        },
      ],
    });
    //크론탭을 통한 신고 진행중, 거래완료된 게시물 검색 , 조회된 데이터가 있으면 board 테이블에서 삭제
    if (newBoard2.length >= 1) {
      for (let i = 0; i < newBoard2.length; i++) {
        await this.elasticSearchService.deleteByQuery({
          index: 'board',
          query: {
            match: {
              _id: newBoard2[i].id,
            },
          },
        });
      }
    }
    //조회된 데이터가 없다면 리턴
    if (newBoard.length === 0) {
      return;
    }
    // 조회된 데이터들은 상태 변경
    for (let i = 0; i < newBoard.length; i++) {
      this.boardRepository.update(
        { id: newBoard[i].id },
        { status: BOARD_STATUS_ENUM.ENDED },
      );
      // 크론탬을 통한 마감날짜가 오늘을 넘긴 게시물 검색 및 삭제
      await this.elasticSearchService.deleteByQuery({
        index: 'board',
        query: {
          match: {
            _id: newBoard[i].id,
          },
        },
      });
      // 수정된 데이터 저장
      await this.paymentHistory.save({
        board: newBoard[i],
        user: newBoard[i].user,
        price: newBoard[i].price,
        title: newBoard[i].title,
        status: 'refund',
      });
      // payment 포인트 업데이트

      this.userRepository.update(
        { email: newBoard[i].user.email },
        { point: newBoard[i].user.point + newBoard[i].price },
      );
    }
  }
}
