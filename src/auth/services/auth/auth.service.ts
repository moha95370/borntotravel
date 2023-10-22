import * as jwt from 'jsonwebtoken';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { decodePassword } from 'src/utils/bcrypt';
import { jwtConstants } from 'src/auth/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { Repository } from 'typeorm';
import { createRefreshTokenDto } from 'src/auth/dtos/createRefreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user || !decodePassword(pass, user.password)) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      pseudo: user.pseudo,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    const refreshToken = this.generateRefreshToken(tokenPayload);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  generateRefreshToken(createRefreshTokenDto: createRefreshTokenDto): string {
    const payload = {
      id: createRefreshTokenDto.id,
      email: createRefreshTokenDto.email,
    };

    return jwt.sign(payload, jwtConstants.refreshSecret, {
      expiresIn: jwtConstants.refreshExpiration,
    });
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    try {
      const newRefreshToken = this.refreshTokenRepository.create({
        userId: userId,
        refreshToken: refreshToken,
      });
      return await this.refreshTokenRepository.save(newRefreshToken);
    } catch (error) {
      throw new BadRequestException('Could not create token');
    }
  }

  async deleteRefreshTokenByUserId(userId: number) {
    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { userId: userId },
      });

      if (!refreshToken) {
        throw new NotFoundException(
          `refreshToken with userId ${userId} not found`,
        );
      }

      const result = await this.refreshTokenRepository.delete(refreshToken.id);

      if (!result) {
        throw new NotFoundException(
          `refreshToken with userId ${userId} not found`,
        );
      }

      return result;
    } catch (error) {
      throw new BadRequestException('Could not delete refresh token');
    }
  }

  async getRefreshTokenByUserId(
    userId: number,
  ): Promise<RefreshToken | undefined> {
    try {
      return await this.refreshTokenRepository.findOne({
        where: { userId: userId },
      });
    } catch (error) {
      throw new BadRequestException('Could not retrieve refresh token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const refreshTokenPayload: any = jwt.verify(
        refreshToken,
        jwtConstants.refreshSecret,
      );
      const user = await this.usersService.findUserById(refreshTokenPayload.id);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const accessTokenPayload = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        pseudo: user.pseudo,
      };

      const newAccessToken = jwt.sign(accessTokenPayload, jwtConstants.secret, {
        expiresIn: jwtConstants.refreshExpiration,
      });

      return newAccessToken;
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  decodeAccessToken(accessToken: string): any {
    try {
      return jwt.verify(accessToken, jwtConstants.secret);
    } catch (error) {
      throw new BadRequestException('Invalid access token');
    }
  }
}
