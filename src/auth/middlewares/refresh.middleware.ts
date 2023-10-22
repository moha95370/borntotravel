// refresh.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class RefreshMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (accessToken) {
      try {
        const decodedToken: any =
          this.authService.decodeAccessToken(accessToken);

        // Check if token is about to expire
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeToExpiration = expirationTime - currentTime;

        if (timeToExpiration < 120000) {
          const userId = decodedToken.id; // Assuming the token payload has an 'id' field

          // Retrieve the stored refresh token from the database
          const storedRefreshToken =
            await this.authService.getRefreshTokenByUserId(userId);

          if (storedRefreshToken) {
            // Generate new access token using the stored refresh token
            const newAccessToken = await this.authService.refreshAccessToken(
              storedRefreshToken.refreshToken,
            );

            // Send the new access token in the response
            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
          }
        }
      } catch (error) {
        // Token is invalid or expired, continue with the original request
      }
    }

    next();
  }
}
