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

  createImage({ image }) {
    //넘겨받은 image url를 DB에 저장
    return this.imageRepository.save({
      url: image,
    });
  }

  async deleteImage({ url }) {
    //image 데이터 hardDelete
    const result = await this.imageRepository.delete({ url });
    if (!result.affected) {
      throw new NotFoundException('이미지가 정상적으로 삭제되지 못하였습니다.');
    }

    //Google bucket에서 넘겨받은 파일 삭제
    await this.fileService.delete({ url });

    return true;
  }
}
