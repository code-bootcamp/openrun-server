import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, MoreThan, Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ImagesService } from '../images/images.service';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { Runner } from '../runners/entities/runner.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { FileService } from '../file/file.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Runner)
    private readonly runnerRepository: Repository<Runner>,
    private readonly userService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly imagesService: ImagesService,
    private readonly paymentHistoriesService: PaymentHistoriesService,
    private readonly connection: DataSource,
    private readonly filesService: FileService,
  ) {}

  //게시물 등록
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
      // if (resultUser.point < price) {
      //   throw new UnprocessableEntityException('포인트가 부족합니다');
      // }

      // const resultCategory = await this.categoriesService.findOne({ name });

      const resultPoint = await this.userService.updatePoint({
        resultUser,
        price,
        flag: false,
      });
      if (!resultPoint.affected)
        throw new NotFoundException('포인트 업데이트에 실패하였습니다.');

      const resultLocation = await queryRunner.manager.save(Location, {
        ...location,
      });

      const resultCategory = await this.categoriesService.findOne({
        categoryName: category,
      });

      let dueDate = new Date(
        `${createBoardInput.eventDay} ${createBoardInput.eventTime}`,
      );

      if (!createBoardInput.eventDay || !createBoardInput.eventTime) {
        dueDate = new Date('2023');
      }

      let img;

      if (image) {
        if (!image[0]) {
          img = 'default.img';
        } else {
          img = image[0];
        }
      } else {
        img = 'default.img';
      }

      const resultImage = await queryRunner.manager.save(Image, {
        url: img,
      });

      const result = await queryRunner.manager.save(Board, {
        ...createBoardInput,
        dueDate: dueDate,
        location: resultLocation,
        category: resultCategory,
        user: resultUser,
        image: resultImage,
      });

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
        image: resultImage,
        location: resultLocation,
        category: resultCategory,
        user: resultUser,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

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
          user: true,
          image: true,
        },
      });

      const { image } = updateBoardInput;

      let img;

      if (image) {
        if (!image[0]) {
          img = 'default.img';
        } else {
          img = image[0];
        }
      } else {
        img = 'default.img';
      }

      const newImage = await queryRunner.manager.save(Image, {
        ...newBoard.image,
        url: img,
      });

      let dueDate = new Date(
        `${updateBoardInput.eventDay} ${updateBoardInput.eventTime}`,
      );

      if (!updateBoardInput.eventDay || !updateBoardInput.eventTime) {
        dueDate = newBoard.dueDate;
      }

      let category = await this.categoryRepository.findOne({
        where: { name: updateBoardInput.category },
      });

      if (!updateBoardInput.category) {
        category = newBoard.category;
      }

      const result = {
        ...newBoard,
        id: boardId,
        ...updateBoardInput,
        dueDate: dueDate,
        category: category,
        image: newImage,
      };
      const boardResult = await queryRunner.manager.save(Board, result);

      if (img !== 'default.img')
        await this.filesService.delete({
          url: newBoard.image.url,
        });

      await queryRunner.commitTransaction();

      return boardResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus({ board }) {
    const result = await this.boardRepository.save({
      ...board,
      status: BOARD_STATUS_ENUM.INPROGRESS,
    });
    return result;
  }
  async updateToFinish({ board }) {
    const result = await this.boardRepository.save({
      ...board,
      status: BOARD_STATUS_ENUM.FINISHED,
    });
    return result;
  }

  //상세페이지
  async findOne({ boardId }) {
    const resultBoard = await this.boardRepository.findOne({
      where: { id: boardId },

      relations: {
        category: true,
        user: true,
        location: true,
        image: true,
      },
    });
    return resultBoard;
  }
  async findAllbyCurrent({ page, direcion, category }) {
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
      relations: ['category', 'location', 'image', 'user'],
      order: { updatedAt: 'DESC' },
      // where: {
      //   location: { address: Like(`%${direcion}%`) },
      //   dueDate: MoreThan(today),
      //   category: category,
      // },
      where: whereQuery,
      take: 12,
      skip: page ? (page - 1) * 12 : 0,
    });
    return resultBoards;
  }
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

    // let whereQuery = {};
    // if (category !== 'ALL') {
    //   whereQuery = {
    //     location: { address: Like(`${direcion}%`) },
    //     dueDate: MoreThan(today),
    //     category: {
    //       name: category,
    //     },
    //   };
    // } else {
    //   whereQuery = {
    //     location: { address: Like(`${direcion}%`) },
    //     dueDate: MoreThan(today),
    //   };
    // }

    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { dueDate: 'ASC' },
      where: whereQuery,
      take: 12,
      skip: page ? (page - 1) * 12 : 0,
    });
    return resultBoards;
  }

  async findAllbyUser({ email, page }) {
    const user = await this.userService.findOne({
      email,
    });

    const boards = await this.boardRepository.find({
      relations: ['user', 'image'],
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

  findBoardProcessing({ email }) {
    return this.boardRepository.find({
      relations: {
        user: {
          bankAccount: true,
        },
        location: true,
        image: true,
        chatRoom: true,
        category: true,
      },
      where: { user: { email: email }, status: BOARD_STATUS_ENUM.INPROGRESS },
      order: { updatedAt: 'ASC' },
    });
  }

  async delete({ boardId }) {
    //queryRunner 선언
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    //temporary for debug
    let status = '';

    //1.PaymentHistory에 남겨진 Board를 찾아 연결(relation) 끊어줌
    status = '[1]paymentHistory - deleteBoardId'; //for debug
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
      status = '[2]board - findOne'; //for debug
      const board = await queryRunner.manager.findOne(Board, {
        where: { id: boardId },
        relations: ['image', 'location'],
        lock: { mode: 'pessimistic_write' },
      });

      //3.Board의 Location정보 삭제
      status = '[3]location - softdelete'; //for debug
      await queryRunner.manager.softDelete(Location, {
        id: board.location.id,
      });

      //4.Board 삭제
      status = '[4]board - delete'; //for debug
      const result = await queryRunner.manager.softDelete(Board, {
        id: boardId,
      });

      //5.Image 삭제
      status = '[5]image - softdelete'; //for debug
      await queryRunner.manager.softDelete(Image, {
        id: board.image.id,
      });

      //6.Image bucket에서 삭제
      status = '[6]file - delete'; //for debug
      if (!board.image.url.includes('default.img')) {
        await this.filesService.delete({ url: board.image.url });
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

  elasticResult({ result }) {
    return result.map((ele) => {
      const createdAt = new Date(ele['_source'].createdAt);
      const duedate = new Date(ele['_source'].dueDate);
      const updatedAt = new Date(ele['_source'].updatedAt * 1000.019481);

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
        image: {
          url: ele['_source'].url,
        },
        category: {
          name: ele['_source'].name,
        },
        user: {
          nickName: ele['_source'].nickName,
        },
      });
    });
  }

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
