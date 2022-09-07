import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { ImagesService } from '../images/images.service';
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
  ) {}

  //게시물 등록
  async create({ createBoardInput, email }) {
    const {
      category, //
      image,
      location,
      price,
      ...board
    } = createBoardInput;

    const resultUser = await this.userService.findOne({
      email,
    });
    // if (resultUser.point < price) {
    //   throw new UnprocessableEntityException('포인트가 부족합니다');
    // }

    // const resultCategory = await this.categoriesService.findOne({ name });

    //게시물 등록할 유저를 찾아와서 유저가 게시물 작성 할 때 입력할 포인트가 충분한지 확인 해줘야함.
    const curPoint = await this.userService.findOne({ email });

    console.log('=========================');
    console.log(curPoint);
    console.log('=========================');
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
    const result = {
      ...newBoard,
      id: boardId,
      ...updateBoardInput,
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
  async findAllbyCurrent() {
    const today = new Date();

    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { updatedAt: 'DESC' },
      where: {
        dueDate: MoreThan(today),
      },
    });
    console.log(resultBoards);
    return resultBoards;
  }
  async findAllbyLimit() {
    const today = new Date();
    const resultBoards = await this.boardRepository.find({
      relations: ['category', 'location', 'image', 'user'],
      order: { dueDate: 'ASC' },
      where: {
        dueDate: MoreThan(today),
      },
    });
    return resultBoards;
  }

  async delete({ boardId }) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['image', 'location'],
    });

    await this.locationRepository.softDelete({
      id: board.location.id,
    });

    const resultImage = await this.imagesService.deleteImages({
      url: board.image,
    });

    const result = await this.boardRepository.softDelete({ id: boardId });

    return result.affected ? true : false;
  }
}
