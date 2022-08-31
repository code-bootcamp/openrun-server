import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { Board } from './entities/board.entity';
import { Location } from '../locations/entities/location.entity';
// import { Tag } from '../tags/entities/tag.entity';
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
    private readonly locationRepository: Repository<Location>, // @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>, // @InjectRepository(Category) // private readonly categoryRepository: Repository<Category>
  ) {}

  //게시물 등록
  async create({ createBoardInput }) {
    const { imgUrl, location, ...board } = createBoardInput;
    const resultLocation = await this.locationRepository.save({
      ...location,
    });
    const result = await this.boardRepository.save({
      ...board,
      location: resultLocation,
    });
    const arr = [];
    for (let i = 0; i < imgUrl.length; i++) {
      const temp = await this.imageRepository.save({
        url: imgUrl[i],
        board: result.id,
      });
      arr.push(temp.url);
    }
    return { ...result, imgUrl: arr };
  }

  async findAll() {
    return await this.boardRepository.find({
      //   relations: [],
    });
  }
  // findOne({}) {
  //   return this.boardRepository.findOne({
  //     where: { id:  },
  //   });
  // }
}

// fetchBoard 나와야할 것들
// 제목, 이미지, 날짜, 시간, 유저 아이디, 찜 , 위치정보, 태그,
