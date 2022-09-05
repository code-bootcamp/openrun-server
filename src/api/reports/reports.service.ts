import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { report } from 'process';
import { identity } from 'rxjs';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Report, REPORT_TYPE_ENUM } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService,
  ) {}

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

  async findAll({ email }) {
    const result = await this.reportRepository.find({
      where: { user: { email } },
    });
    return result;
  }
  //개발 유저가 스스로 삭제 할 수 있을지 / 관리자가 삭제 할 수 있을지
  async delete({ reportId }) {
    const result = await this.reportRepository.softDelete({ id: reportId });
    return result.affected ? true : false;
  }
}
