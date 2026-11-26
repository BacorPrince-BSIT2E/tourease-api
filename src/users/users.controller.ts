import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

// Exposes public registration and access-controlled user profile endpoints.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertOwnerOrAdmin(userId, request.user);
    return this.usersService.findOne(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertOwnerOrAdmin(userId, request.user);
    return this.usersService.update(userId, updateUserDto);
  }

  @Roles('Admin')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.remove(userId);
  }

  private assertOwnerOrAdmin(userId: number, user: JwtPayload): void {
    if (user.role !== 'Admin' && user.sub !== userId) {
      throw new ForbiddenException('You can only access your own account');
    }
  }
}
