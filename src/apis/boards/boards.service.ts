import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { Runner } from '../runners/entities/runner.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { FileService } from '../file/file.service';
import { IWhereQuery } from 'src/commons/types/type';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>,
    private readonly userService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly paymentHistoriesService: PaymentHistoriesService,
    private readonly connection: DataSource,
    private readonly filesService: FileService,
  ) {}

  //게시물 등록, 등록할 때 transaction 발동
  async create({ createBoardInput, email }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const {
        category, //
        image,
        location,
        price,
      } = createBoardInput;

      const resultUser = await this.userService.findOne({
        email,
      });
      // 게시물 작성 시 기입한 금액보다 보유 포인트 부족할 경우 에러 발동
      if (resultUser.point < price) {
        throw new UnprocessableEntityException('포인트가 부족합니다');
      }
      // 보유 포인트가 충분할 경우 포인트 차감(업데이트)
      const resultPoint = await this.userService.updatePoint({
        resultUser,
        price,
        flag: false,
      });
      //예상치 못한 에러가 발생할 경우 포인트 업데이트 중단 및 에러 발동
      if (!resultPoint.affected)
        throw new NotFoundException('포인트 업데이트에 실패하였습니다.');

      //게시물 등록시 기재한 위치정보 DB에 저장
      const resultLocation = await queryRunner.manager.save(Location, {
        ...location,
      });
      //DB에 저장된 카테고리 불러오기
      const resultCategory = await this.categoriesService.findOne({
        categoryName: category,
      });
      //마감날짜 계산 = 이벤트 날짜 + 이벤트 시간
      let dueDate = new Date(
        `${createBoardInput.eventDay} ${createBoardInput.eventTime}`,
      );
      //이벤트 날짜나 이벤트 시간이 기입 되지 않을 경우 default값 2023년으로 주기
      if (!createBoardInput.eventDay || !createBoardInput.eventTime) {
        dueDate = new Date('2023');
      }
      // 행사 날짜 입력시  이미 지난 날짜를 입력 할 경우
      const today = new Date();
      if (dueDate < today)
        throw new ConflictException('행사 날짜가 올바르지 않습니다.');

      // 이미지를 올리지 않을 시 default 이미지 주기
      let img: string;

      if (image) {
        if (!image[0]) {
          img = 'default.img';
        } else {
          img = image[0];
        }
      } else {
        img = 'default.img';
      }
      //모든 입력 정보 DB의 board table에 저장
      const result = await queryRunner.manager.save(Board, {
        ...createBoardInput,
        dueDate: dueDate,
        location: resultLocation,
        category: resultCategory,
        user: resultUser,
        image: img,
      });
      // 거래 내역과 관련된 정보 DB의 paymentHistory table에 저장
      await queryRunner.manager.save(PaymentHistory, {
        board: result,
        user: resultUser,
        price: price,
        title: result.title,
        status: result.user.id === resultUser.id ? 'seller' : 'runner',
      });
      await queryRunner.commitTransaction();
      return {
        ...result,
        image: img,
        location: resultLocation,
        category: resultCategory,
        user: resultUser,
      };
      //transaction error 발견할 시 에러 및 rollback
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new UnprocessableEntityException(error);
    } finally {
      await queryRunner.release();
    }
  }
  //게시물 수정
  async update({ boardId, updateBoardInput }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const newBoard = await this.boardRepository.findOne({
        where: { id: boardId },
        relations: {
          category: true,
          location: true,
          chatRoom: true,
          user: {
            bankAccount: true,
          },
        },
      });
      //위치정보 수정
      const { location } = updateBoardInput;

      const newLocation = await queryRunner.manager.save(Location, {
        ...newBoard.location,
        ...location,
      });
      //마감날짜 수정
      let dueDate = new Date(
        `${updateBoardInput.eventDay} ${updateBoardInput.eventTime}`,
      );
      // 마감날짜 수정시 이벤트 날짜, 이벤트 시간을 입력하지 않으면 변경전 마감날짜로 입력
      if (!updateBoardInput.eventDay || !updateBoardInput.eventTime) {
        dueDate = newBoard.dueDate;
      }
      //DB에 저장된 카테고리 불러오기
      let category = await this.categoryRepository.findOne({
        where: { name: updateBoardInput.category },
      });
      //카테고리를 입력하지 않을시 변경전 카테고리로 입력
      if (!updateBoardInput.category) {
        category = newBoard.category;
      }

      const result = {
        ...newBoard,
        id: boardId,
        ...updateBoardInput,
        image:
          updateBoardInput.image && updateBoardInput.image.length >= 1
            ? updateBoardInput.image[0]
            : newBoard.image,
        dueDate: dueDate,
        category: category,
        location: newLocation,
      };
      //업데이트된 데이터 DB에 저장
      const boardResult = await queryRunner.manager.save(Board, result);
      //새로운 이미지 입력 할 시 기존 이미지 삭제
      if (updateBoardInput.image && updateBoardInput.image.length >= 1) {
        await this.filesService.delete({
          url: newBoard.image,
        });
      }

      await queryRunner.commitTransaction();
      return boardResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  //상태가 '모집중'인 게시물 '진행중'으로  변경
  async updateStatus({ board }) {
    const result = await this.boardRepository.save({
      ...board,
      status: BOARD_STATUS_ENUM.INPROGRESS,
    });
    return result;
  }
  //상태가 '진행중'인 게시물 '완료' 로 변경
  async updateToFinish({ board }) {
    const result = await this.boardRepository.save({
      ...board,
      status: BOARD_STATUS_ENUM.FINISHED,
    });
    return result;
  }

  //한개의 게시물 조회
  async findOne({ boardId }) {
    const resultBoard = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        chatRoom: true,
        category: true,
      },
    });
    return resultBoard;
  }
  //최신순으로 조회
  async findAllbyCurrent({ page, direcion, category }) {
    const today = new Date();

    //where query문 생성
    const whereQuery: IWhereQuery = {
      //마감날짜가 today를 지나면 조회가 안되도록 설정
      dueDate: MoreThan(today),
    };
    if (category !== 'ALL') {
      whereQuery.category = { name: category };
    }
    if (direcion !== '전체' && direcion) {
      whereQuery.location = { address: Like(`${direcion}%`) };
    }

    const resultBoards = await this.boardRepository.find({
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        chatRoom: true,
        category: true,
      },
      //정열기준은 updatedAt, 상태가 '모집중','진행중'인 게시물 만 조회
      order: { updatedAt: 'DESC' },
      where: [
        { status: BOARD_STATUS_ENUM.INPROGRESS, ...whereQuery },
        { status: BOARD_STATUS_ENUM.RECRUITING, ...whereQuery },
      ],
      take: 12,
      skip: page ? (page - 1) * 12 : 0,
    });
    return resultBoards;
  }

  //마감 임박순으로 조회
  async findAllbyLimit({ page, direcion, category }) {
    const today = new Date();

    //where query문 생성
    const whereQuery = {
      dueDate: MoreThan(today),
    };
    if (category !== 'ALL') {
      whereQuery['category'] = { name: category };
    }
    if (direcion !== '전체' && direcion) {
      whereQuery['location'] = { address: Like(`${direcion}%`) };
    }

    const resultBoards = await this.boardRepository.find({
      relations: {
        category: true,
        location: true,
        chatRoom: true,
        user: true,
      },
      order: { dueDate: 'ASC' },
      // where: whereQuery,
      where: [
        { status: BOARD_STATUS_ENUM.INPROGRESS, ...whereQuery },
        { status: BOARD_STATUS_ENUM.RECRUITING, ...whereQuery },
      ],
      take: 12,
      skip: page ? (page - 1) * 12 : 0,
    });
    return resultBoards;
  }
  //유저가 작성한 모든 게시물 조회
  async findAllbyUser({ email, page }) {
    const user = await this.userService.findOne({
      email,
    });

    const boards = await this.boardRepository.find({
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        chatRoom: true,
        category: true,
      },
      where: { user: { email: user.email } },
      order: { updatedAt: 'DESC' },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });

    const result = await Promise.all(
      boards.map((el) => {
        return new Promise(async (resolve) => {
          const count = await this.runnerRepository.count({
            where: { board: { id: el.id } },
          });
          resolve({ ...el, runnerTotal: count });
        });
      }),
    );

    return result;
  }
  //유저가 작성한 진행중인 게시물 조회
  findBoardProcessing({ email, page }) {
    return this.boardRepository.find({
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        chatRoom: true,
        category: true,
      },
      where: { user: { email: email }, status: BOARD_STATUS_ENUM.INPROGRESS },
      order: { updatedAt: 'ASC' },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
  }
  //찜 많이 받은 순으로 조회
  findBestOfBoards({ category }) {
    const today = new Date();

    if (!category) category = 'FASHION';
    return this.boardRepository.find({
      where: {
        status: BOARD_STATUS_ENUM.RECRUITING,
        category: { name: category },
        dueDate: MoreThan(today),
      },
      order: { interestCount: 'DESC' },
      take: 5,
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        chatRoom: true,
        category: true,
      },
    });
  }
  //게시물 삭제
  async delete({ boardId }) {
    //queryRunner 선언
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    //1.PaymentHistory에 남겨진 Board를 찾아 연결(relation) 끊어줌
    const paymentHistories =
      await this.paymentHistoriesService.findAllByBoardId({
        boardId,
      });
    if (paymentHistories.length > 0) {
      paymentHistories.forEach(async (ele) => {
        await this.paymentHistoriesService.deleteOnlyBoardId({
          id: ele.id,
        });
      });
    }

    try {
      //2.현재 선택된 Board 정보 찾기
      const board = await queryRunner.manager.findOne(Board, {
        where: { id: boardId },
        relations: {
          user: {
            bankAccount: true,
          },
          location: true,
          chatRoom: true,
          category: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      //3.Board의 Location정보 삭제
      await queryRunner.manager.softDelete(Location, {
        id: board.location.id,
      });

      //4.Board 삭제
      const result = await queryRunner.manager.softDelete(Board, {
        id: boardId,
      });

      //6.Image bucket에서 삭제
      if (board.image !== 'default.img') {
        await this.filesService.delete({ url: board.image });
      }

      //Transaction 종료
      await queryRunner.commitTransaction();

      return result.affected ? true : false;
    } catch (error) {
      //RollBack 수행
      await queryRunner.rollbackTransaction();

      // paymentHistory 원상복구
      if (paymentHistories.length > 0) {
        paymentHistories.forEach(async (ele) => {
          await this.paymentHistoriesService.updateOnlyBoardId({
            id: ele.id,
            boardId,
          });
        });
      }

      throw new NotFoundException(`ERROR!!! ${status}`);
    } finally {
      await queryRunner.release();
    }
  }
  //엘라스틱 서치
  elasticResult({ result }) {
    return result.map((ele) => {
      const createdAt = new Date(ele['_source'].createdAt);
      const duedate = new Date(ele['_source'].dueDate);
      //바뀐 날짜 패턴을 기존 형태로 변경(오차 1초 미만)
      const updatedAt = new Date(ele['_source'].updatedAt * 1000.019481);
      //검색 시 띄워줄 데이터
      return this.boardRepository.create({
        id: ele['_source'].id,
        title: ele['_source'].title,
        contents: ele['_source'].contents,
        price: ele['_source'].price,
        status: ele['_source'].status,
        createdAt: createdAt,
        dueDate: duedate,
        updatedAt: updatedAt,

        location: {
          address: ele['_source'].address,
          addressDetail: ele['_source'].addressDetail,
        },
        image: ele['_source'].image,
        category: {
          name: ele['_source'].name,
        },
        user: {
          nickName: ele['_source'].nickName,
        },
      });
    });
  }
  //게시물 신고 및 상태 변경
  async updateStatusReporting({ boardId }) {
    const findBoard = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    this.boardRepository.update(
      {
        id: boardId,
      },
      {
        ...findBoard,
        status: BOARD_STATUS_ENUM.REPORTING,
      },
    );
  }
  //게시물 '거래완료'로 상태 변경
  async updateStatusCompleted({ boardId }) {
    const findBoard = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    return this.boardRepository.update(
      {
        id: boardId,
      },
      {
        ...findBoard,
        status: BOARD_STATUS_ENUM.COMPLETED,
      },
    );
  }
}
