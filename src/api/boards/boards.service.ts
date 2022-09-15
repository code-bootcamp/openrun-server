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
import e from 'express';
// import { Category } from '../categories/entities/category.entity';

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
  ) {}

  //게시물 등록
  async create({ createBoardInput, email }) {
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

    const resultLocation = await this.locationRepository.save({
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

    const resultImage = await this.imagesService.createImage({
      image: img,
    });
    console.log('맵 아래');

    const result = await this.boardRepository.save({
      ...createBoardInput,
      dueDate: dueDate,
      location: resultLocation,
      category: resultCategory,
      user: resultUser,
      image: resultImage,
    });

    await this.paymentHistoriesService.create({
      board: result,
      user: resultUser,
      price: price,
      flag: false,
    });
    return {
      ...result,
      image: resultImage,
      location: resultLocation,
      category: resultCategory,
      user: resultUser,
    };
  }

  async update({ boardId, updateBoardInput }) {
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

    console.log(newBoard);

    const result = {
      ...newBoard,
      id: boardId,
      ...updateBoardInput,
      dueDate: dueDate,
      category: category,
    };
    return await this.boardRepository.save(result);
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
  async findAllbyCurrent({ page, direcion }) {
    const today = new Date();

    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { updatedAt: 'DESC' },
      where: {
        location: { address: Like(`%${direcion}%`) },
        dueDate: MoreThan(today),
      },
      take: 12,
      skip: page ? (page - 1) * 12 : 0,
    });
    return resultBoards;
  }
  async findAllbyLimit({ page, direcion }) {
    const today = new Date();
    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { dueDate: 'ASC' },
      where: {
        location: { address: Like(`%${direcion}%`) },
        dueDate: MoreThan(today),
      },
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
      relations: ['user'],
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

  async delete({ boardId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    //temporary for debug
    let status = '';

    try {
      status = '[1]board - findOne'; //for debug
      const board = await queryRunner.manager.findOne(Board, {
        where: { id: boardId },
        relations: ['image', 'location'],
        lock: { mode: 'pessimistic_write' },
      });

      status = '[2]location - softdelete'; //for debug
      await queryRunner.manager.softDelete(Location, {
        id: board.location.id,
      });

      status = '[3]board - softdelete'; //for debug
      const result = await queryRunner.manager.softDelete(Board, {
        id: boardId,
      });

      status = '[4]image - delete'; //for debug
      if (!board.image.url.includes('default.img')) {
        await this.imagesService.deleteImage({
          url: board.image,
        });
      }

      await queryRunner.commitTransaction();
      return result.affected ? true : false;
    } catch (error) {
      await queryRunner.rollbackTransaction();
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
}
