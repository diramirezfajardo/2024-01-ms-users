import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { AccessTokenPayloadT, RefreshTokenPayloadT } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    try {
      return this.authService.register(registerDto);
    } catch (e: unknown) {
      console.log({ e });
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (e: unknown) {
      console.log({ e });
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/check')
  @UseGuards(AuthGuard)
  check(@Request() req: Record<string, unknown>) {
    try {
      const payload = req.user as RefreshTokenPayloadT;

      return this.authService.check(payload);
    } catch (e: unknown) {
      console.log({ e });
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/refresh')
  @UseGuards(RefreshGuard)
  refresh(@Request() req: Record<string, unknown>) {
    try {
      const payload = req.user as RefreshTokenPayloadT;

      return this.authService.refresh(payload);
    } catch (e: unknown) {
      console.log({ e });
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  profile(@Request() req: Record<string, unknown>) {
    try {
      const payload = req.user as AccessTokenPayloadT;

      return this.authService.profile(payload);
    } catch (e: unknown) {
      console.log({ e });
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('')
  @HttpCode(200)
  helthcheck() {
    return;
  }
}
