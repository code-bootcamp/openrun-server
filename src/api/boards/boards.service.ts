import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { Board, BOARD_STATUS_ENUM } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
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

    const result = await this.boardRepository.save({
      ...createBoardInput,
      location: resultLocation,
      category: resultCategory,
      user: resultUser,
    });

    const arr = [];
    for (let i = 0; i < image.length; i++) {
      const temp = await this.imageRepository.save({
        url: image[i],
        board: result.id,
      });

      arr.push(temp);
    }

    return {
      ...result,
      image: arr,
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
    const result = await this.boardRepository.softDelete({ id: boardId });
    return result.affected ? true : false;
  }
}
