import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { TourGuideQueryDto } from './dto/tour-guide-query.dto';
import { UpdateTourGuideDto } from './dto/update-tour-guide.dto';
import { TourGuidesService } from './tour-guides.service';

// Exposes public tour-guide browsing and role-protected management endpoints.
@Controller('tour-guides')
export class TourGuidesController {
  constructor(private readonly tourGuides: TourGuidesService) {}

  @Public()
  @Get()
  findAll(@Query() query: TourGuideQueryDto) {
    return this.tourGuides.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) guideId: number) {
    return this.tourGuides.findOne(guideId);
  }

  @Roles('Staff', 'Admin')
  @Post()
  create(@Body() dto: CreateTourGuideDto) {
    return this.tourGuides.create(dto);
  }

  @Roles('Staff', 'Admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) guideId: number,
    @Body() dto: UpdateTourGuideDto,
  ) {
    return this.tourGuides.update(guideId, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) guideId: number) {
    return this.tourGuides.remove(guideId);
  }
}
