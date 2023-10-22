import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>) {
    const response = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    return response;
  }



  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() req: any) {
    const userId = req.user.id; 
  
    await this.authService.deleteRefreshTokenByUserId(userId);

    return { message: 'Logged out successfully' };
  }

}
