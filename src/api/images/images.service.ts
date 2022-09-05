import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    private readonly fileService: FileService,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  createImage({ board, image }) {
    //넘겨받은 image url를 DB에 저장
    return image.map((ele) => {
      return this.imageRepository.save({
        url: ele,
        board,
      });
    });
  }

  async deleteImage({ url }) {
    //Google bucket에서 넘겨받은 파일들 삭제
    await this.fileService.delete({ url });

    //image 데이터 softDelete
    url.forEach(async (ele) => {
      const result = await this.imageRepository.delete({ url: ele.url });
      if (!result.affected) {
        throw new NotFoundException(
          '이미지가 정상적으로 삭제되지 못하였습니다.',
        );
      }
    });

    return true;
  }
}
