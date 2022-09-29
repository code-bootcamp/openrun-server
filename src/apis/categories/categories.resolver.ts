import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Resolver()
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService, //
  ) {}
  //카테고리 목록 조회
  @Query(() => [Category])
  fetchCategories() {
    return this.categoriesService.findAll();
  }
  //카테고리 생성
  @Mutation(() => Category)
  createCategory(
    @Args('name') name: string, //
  ) {
    const newCategory = this.categoriesService.create({ name });
    return newCategory;
  }
}
