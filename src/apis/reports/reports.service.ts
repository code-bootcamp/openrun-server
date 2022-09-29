import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { UsersService } from '../users/users.service';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
  ) {}
  //신고할 게시물 찾기 및 생성
  async create({ createReportInput, email }) {
    const { boardId, ...report } = createReportInput;

    const resultUser = await this.usersService.findOne({
      email,
    });

    const resultBoard = await this.boardsService.findOne({
      boardId: boardId,
    });

    const result = await this.reportRepository.save({
      ...report,
      user: resultUser,
      board: resultBoard,
    });

    return result;
  }
  //신고된 게시물 조회
  async findAll({}) {
    const result = await this.reportRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['board'],
    });
    return result;
  }

  //개발 유저가 스스로 삭제 할 수 있을지 / 관리자가 삭제 할 수 있을지
  async delete({ reportId }) {
    const result = await this.reportRepository.softDelete({ id: reportId });
    return result.affected ? true : false;
  }
}
