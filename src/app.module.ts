import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './typeorm/entities/Place';
import { PlacesModule } from './places/places.module';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './typeorm/entities/Category';
import { UsersModule } from './users/users.module';
import { User } from './typeorm/entities/User';
import { AuthModule } from './auth/auth.module';
import { RefreshToken } from './typeorm/entities/RefreshToken';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'btt',
      entities: [Place,Category,User,RefreshToken],
      synchronize: true,
    }),
    PlacesModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
