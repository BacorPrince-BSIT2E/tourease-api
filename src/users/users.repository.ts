import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// Encapsulates TypeORM access to user records.
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findById(userId: number): Promise<User | null> {
    return this.repository.findOneBy({ userId });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  create(userData: CreateUserDto, passwordHash: string): Promise<User> {
    const user = this.repository.create({
      fullName: userData.fullName,
      email: userData.email,
      passwordHash,
      userRole: 'Tourist',
    });
    return this.repository.save(user);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(userId: number): Promise<void> {
    await this.repository.delete(userId);
  }
}
