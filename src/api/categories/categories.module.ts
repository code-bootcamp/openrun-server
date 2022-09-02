import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],

  providers: [
    CategoriesResolver, //
    CategoriesService,
  ],
})
export class CategoriesModule {}
