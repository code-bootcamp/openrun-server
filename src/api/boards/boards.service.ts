import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThan, Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ImagesService } from '../images/images.service';
import { ChatRoom } from '../chat/entities/chatRoom.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
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
    private readonly userService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly imagesService: ImagesService,
    private readonly paymentHistoriesService: PaymentHistoriesService,
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

    console.log(resultPoint);

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
    console.log('===========', dueDate);

    const result = await this.boardRepository.save({
      ...createBoardInput,
      dueDate: dueDate,
      location: resultLocation,
      category: resultCategory,
      user: resultUser,
    });

    let img;

    if (!image) {
      img = ['default.img'];
    }

    const resultImage = await this.imagesService.createImages({
      board: result,
      image: image ? image : img,
    });
    console.log('맵 아래');

    const resultPaymentHistory = await this.paymentHistoriesService.create({
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
    });

    let dueDate = new Date(
      `${updateBoardInput.eventDay} ${updateBoardInput.eventTime}`,
    );

    if (!updateBoardInput.eventDay || !updateBoardInput.eventTime) {
      dueDate = newBoard.dueDate;
    }

    const result = {
      ...newBoard,
      id: boardId,
      ...updateBoardInput,
      dueDate: dueDate,
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
  async findAllbyCurrent({ page }) {
    const today = new Date();

    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { updatedAt: 'DESC' },
      where: {
        dueDate: MoreThan(today),
      },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
    console.log(resultBoards);
    return resultBoards;
  }
  async findAllbyLimit({ page }) {
    const today = new Date();
    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { dueDate: 'ASC' },
      where: {
        dueDate: MoreThan(today),
      },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
    return resultBoards;
  }

  async findAllbyUser({ email, page }) {
    const user = await this.userService.findOne({
      email,
    });
    console.log({ email });

    const result = await this.boardRepository.find({
      relations: ['user'],
      where: { user: { email: user.email } },
      order: { updatedAt: 'DESC' },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
    console.log(result);

    return result;
  }

  // async findLocation({ keyword }) {
  //   const result = await this.boardRepository.find({
  //     relations: ['category', 'location', 'image', 'user'],
  //     where: {},
  //   });

  //   console.log('============================');
  //   return result;
  // }

  async delete({ boardId }) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['image', 'location'],
    });

    await this.locationRepository.softDelete({
      id: board.location.id,
    });

    if (!board.image[0].url.includes('default.img')) {
      await this.imagesService.deleteImages({
        url: board.image,
      });
    }

    const result = await this.boardRepository.softDelete({ id: boardId });

    return result.affected ? true : false;
  }
}
