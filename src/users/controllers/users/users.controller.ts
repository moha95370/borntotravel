import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { RefreshMiddleware } from 'src/auth/middlewares/refresh.middleware';
import { ChangePasswordDto } from 'src/users/dtos/ChangePassword.dto';
import { comparePasswords } from 'src/utils/bcrypt';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get()
  getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @UseGuards(AuthGuard, RefreshMiddleware)
  @Get('email/:email')
  getUserByEmail(@Param('email') userEmail: string) {
    return this.userService.findUserDataProfile(userEmail);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  @UseGuards(AuthGuard, RefreshMiddleware)
  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) userIdFromRequest: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ): Promise<any> {
    const userIdFromToken = req.user.id;

    if (userIdFromToken == userIdFromRequest) {
      try {
        await this.userService.updateUser(userIdFromRequest, updateUserDto);
        return { message: 'User account updated successfully' };
      } catch (error) {
        throw new NotFoundException('User not found');
      }
    } else {
      throw new UnauthorizedException(
        'You are not authorized to delete this account',
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put('change-password/:id')
  async changePasswordById(
    @Param('id', ParseIntPipe) userIdFromRequest: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<any> {
    const userIdFromToken = req.user.id;
  
    const { oldPassword, newPassword } = changePasswordDto;
  
    if (userIdFromToken == userIdFromRequest) {
      try {
        const user = await this.userService.findUserById(userIdFromRequest);
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        const isPasswordValid = await comparePasswords(
          oldPassword,
          user.password,
        );
  
        if (!isPasswordValid) {
          throw new BadRequestException('Invalid old password');
        }
  
        await this.userService.changePassword(
          userIdFromRequest,
          oldPassword,
          newPassword,
        );
  
        return { message: 'Password changed successfully' };
      } catch (error) {
        throw new InternalServerErrorException(error.message); 
      }
    } else {
      throw new UnauthorizedException(
        'You are not authorized to change this password',
      );
    }
  }
  
  

  @UseGuards(AuthGuard, RefreshMiddleware)
  @Delete(':id')
  async deleteUserAccount(
    @Request() req: any,
    @Param('id', ParseIntPipe) userIdFromRequest: number,
  ): Promise<any> {
    const userIdFromToken = req.user.id;

    if (userIdFromToken == userIdFromRequest) {
      try {
        const refreshToken = await this.authService.getRefreshTokenByUserId(
          userIdFromToken,
        );

        if (refreshToken) {
          await this.authService.deleteRefreshTokenByUserId(
            refreshToken.userId,
          );
        }

        await this.userService.deleteUser(userIdFromToken);

        return { message: 'User account deleted successfully' };
      } catch (error) {
        throw new NotFoundException('User not found');
      }
    } else {
      throw new UnauthorizedException(
        'You are not authorized to delete this account',
      );
    }
  }
}
