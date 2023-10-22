import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { AuthService } from 'src/auth/services/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]), // Ajoutez RefreshToken ici
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
