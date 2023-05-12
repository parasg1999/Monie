import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3455);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3455');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'parasg1999@gmail.com',
      password: 'password123',
    };

    describe('Register', () => {
      it('Should be able to register', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('Should be able to login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(authDto)
          .expectStatus(200);
      });
    });
  });

  describe('Auth', () => {
    describe('Get Current User', () => {});
    describe('Edit Profile', () => {});
  });
});
