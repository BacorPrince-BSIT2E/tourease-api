import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

export type UserResponse = Pick<
  User,
  'userId' | 'fullName' | 'email' | 'userRole' | 'dateRegistered'
>;

// Implements registration, profile management, and safe user projections.
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    if (await this.usersRepository.findByEmail(createUserDto.email)) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    try {
      return this.toUserResponse(
        await this.usersRepository.create(createUserDto, passwordHash),
      );
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findOne(userId: number): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserResponse(user);
  }

  async findByEmailForAuthentication(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      updateUserDto.email &&
      updateUserDto.email !== user.email &&
      (await this.usersRepository.findByEmail(updateUserDto.email))
    ) {
      throw new ConflictException('Email already exists');
    }

    Object.assign(user, updateUserDto);
    try {
      return this.toUserResponse(await this.usersRepository.save(user));
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(userId: number): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.delete(userId);
  }

  private toUserResponse(user: User): UserResponse {
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      userRole: user.userRole,
      dateRegistered: user.dateRegistered,
    };
  }

  private isDuplicateEntry(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
