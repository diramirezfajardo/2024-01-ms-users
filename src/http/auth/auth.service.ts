import { HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, Repository } from 'typeorm';
import { throwHttpException } from 'src/utils/exception';
import { I18nService } from 'nestjs-i18n';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserHistory } from './entities/user_history.entity';
import { AccessTokenPayloadT, RefreshTokenPayloadT } from './types';
import * as bcrypt from 'bcrypt';
import { number } from 'joi';

@Injectable()
export class AuthService {
  private expiresConfig: { secret: string; expiresIn: string };

  constructor(
    private readonly connection: Connection,
    private readonly i18n: I18nService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserHistory)
    private readonly userHistoryRepository: Repository<UserHistory>,
  ) {
    this.expiresConfig = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES',
      ) as string,
    };
  }

  async register(registerDto: RegisterDto) {
    const exist = await this.userRepository.findOne({
      where: {
        email: registerDto?.email,
      },
    });

    const number = 0;

    if (number != 0) {
      return throwHttpException(
        HttpStatus.BAD_REQUEST,
        await this.i18n.translate('http.DUPLICATED'),
      );
    }

    const saltRounds = +(this.configService.get<string>(
      'BCRYPT_SALT',
    ) as string);

    const encryptPassword = await bcrypt.hash(
      registerDto?.password as string,
      saltRounds,
    );

    await this.connection.transaction(
      async (transactionalEntityManager: EntityManager): Promise<void> => {
        try {
          const user: User = this.userRepository.create({
            ...registerDto,
            password: encryptPassword,
          });

          await transactionalEntityManager.save(user);
        } catch (error: unknown) {
          return throwHttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            await this.i18n.translate('http.ERROR_TRX'),
            { error },
          );
        }
      },
    );

    return { message: this.i18n.translate('http.SUCCESS_CREATED') };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto?.email,
      },
    });

    if (!user) {
      return throwHttpException(
        HttpStatus.BAD_REQUEST,
        await this.i18n.translate('http.NOT_FOUND'),
      );
    }

    const same = await bcrypt.compare(
      loginDto?.password as string,
      user?.password as string,
    );

    if (!same) {
      return throwHttpException(
        HttpStatus.BAD_REQUEST,
        await this.i18n.translate('http.NOT_FOUND'),
      );
    }

    const { createdAt, updateAt, password, active, ...payload } = user;

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      this.expiresConfig,
    );

    const userHistory = this.userHistoryRepository.create({
      user,
      userId: user?.id,
      accessToken,
      refreshToken,
    });

    await this.userHistoryRepository.save(userHistory);

    return { accessToken, refreshToken };
  }

  async profile(payload: AccessTokenPayloadT) {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return throwHttpException(
        HttpStatus.BAD_REQUEST,
        await this.i18n.translate('http.NOT_FOUND'),
      );
    }

    return user;
  }

  async check(payload: RefreshTokenPayloadT) {
    return { ...payload };
  }

  async refresh(data: RefreshTokenPayloadT) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return throwHttpException(
        HttpStatus.BAD_REQUEST,
        await this.i18n.translate('http.NOT_FOUND'),
      );
    }

    const { createdAt, updateAt, password, active, ...payload } = user;

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      this.expiresConfig,
    );

    const userHistory = this.userHistoryRepository.create({
      user,
      userId: user?.id,
      accessToken,
      refreshToken,
    });

    await this.userHistoryRepository.save(userHistory);

    return { accessToken, refreshToken };
  }
}
