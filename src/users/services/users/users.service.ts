import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { User } from 'src/typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserParams, UpdateUserParams } from 'src/utils/type';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findAllUsers() {
    return this.userRepository.find();
  }

  async findUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findUserByEmail(email: string): Promise<Partial<User> | undefined> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }

  async findUserDataProfile(email: string): Promise<Partial<User> | undefined> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });
      const { password, createdAt, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData;
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }

  async createUser(userDetails: CreateUserParams) {
    const email = userDetails.email;
    const password = userDetails.password;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'This mail is already used, please enter a valid one',
      );
    }

    try {
      const encodedPassword = encodePassword(password);
      const newUser = this.userRepository.create({
        ...userDetails,
        password: encodedPassword,
        createdAt: new Date(),
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new BadRequestException('Could not create user');
    }
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    try {
      const result = this.userRepository.update(
        { id },
        { ...updateUserDetails },
      );
      if (!result) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException('Could not update user');
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id } });


    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = comparePasswords(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const encodedNewPassword = encodePassword(newPassword);
    user.password = encodedNewPassword;

    await this.userRepository.save(user);
  }

  deleteUser(id: number) {
    try {
      const result = this.userRepository.delete({ id });
      if (!result) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new BadRequestException('Could not delete user');
    }
  }
}
