import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create({ name }) {
    const result = await this.categoryRepository.save({ name });

    return result;
  }

  async findOne({ categoryName }) {
    const selectCategory = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });
    return selectCategory;
  }

  async findAll() {
    const resultCategorys = await this.categoryRepository.find({});
    return resultCategorys;
  }
}
