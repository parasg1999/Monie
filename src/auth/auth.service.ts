import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(body: AuthDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          password: hash,
        },
      });

      return await this.signToken(user.id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('The credentials are taken');
      }

      throw error;
    }
  }

  async login(body: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) throw new BadRequestException(`Bad credentials`);

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);

    if (!isPasswordMatch) throw new BadRequestException(`Bad credentials`);

    return await this.signToken(user.id);
  }

  async signToken(userId: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
    };

    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '1y',
        secret: this.config.get('JWT_SECRET'),
      }),
    };
  }
}
