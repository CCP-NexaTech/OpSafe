import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

import { DATABASE_CONNECTION } from '../database/database.module';
import type { User } from '../types/database/users';
import type { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';
import type { MeResponseDto } from './dto/me-response.dto';
import { JwtUserClaims } from 'src/types/auth/JwtStrategy';

@Injectable()
export class AuthService {
  private readonly usersCollectionName = 'users';

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Db,
    private readonly jwtService: JwtService,
  ) {}

  private get usersCollection() {
    return this.database.collection<User>(this.usersCollectionName);
  }

  async me(userClaims: JwtUserClaims | undefined): Promise<MeResponseDto> {
    if (!userClaims) {
      throw new UnauthorizedException('Token não fornecido');
    }

    if (!ObjectId.isValid(userClaims.userId)) {
      throw new UnauthorizedException('Token inválido');
    }

    const userId = new ObjectId(userClaims.userId);

    const user = await this.usersCollection.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('Usuário está deletado');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Usuário não está ativo');
    }

    return {
      id: user._id.toHexString(),
      organizationId: (user.organizationId as ObjectId).toHexString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  private async validateUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.usersCollection.findOne({
      email: normalizedEmail,
      isDeleted: false,
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Usuário não está ativo');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Usuário não possui senha definida');
    }

    const isValid = await argon2.verify(user.passwordHash, password);

    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUserByEmailAndPassword(
      loginDto.email,
      loginDto.password,
    );

    const payload = {
      sub: user._id.toHexString(),
      organizationId: user.organizationId.toHexString(),
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const expiresIn = 3600;

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn,
      user: {
        id: user._id.toHexString(),
        organizationId: (user.organizationId as ObjectId).toHexString(),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };
  }
}
