import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  UpdateCategoryDto,
  createCategoryDto,
} from 'src/categories/dtos/CreateCategory.dto';
import { CategoriesService } from 'src/categories/services/categories/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Get()
  async getCategories() {
    const categories = await this.categoryService.findCategories();
    return categories;
  }

  @Post()
  createCategory(@Body() createCategoryDto: createCategoryDto) {
    this.categoryService.createCategory(createCategoryDto);
  }

  @Put(':id')
  async updateCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateCategoryDto: UpdateCategoryDto,
  ) {
    await this.categoryService.updateCategory(id, UpdateCategoryDto);
  }
}
