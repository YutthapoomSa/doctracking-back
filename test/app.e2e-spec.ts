import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from './../src/shared/config/config.service';
import {
    createUserDto1,
    createUserDto2,
    createUserDto3,
    createUserDto4,
    createUserDto5,
    userLoginRequestDto1,
    userLoginRequestDto2,
    userLoginRequestDto3,
    userLoginResponseDto1,
} from './test-data';

describe('/', () => {
    let app: INestApplication;
    let sequelize: Sequelize;
    let userId: string;
    let token: string;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                {
                    provide: 'SEQUELIZE',
                    useFactory: (configService: ConfigService) => {
                        sequelize = new Sequelize(configService.sequelizeOrmConfig);

                        // sequelize.addModels([UserSiteDBRole, Post]);

                        return sequelize;
                    },
                    inject: [ConfigService],
                },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('/users', () => {
        describe('POST /register', () => {
            it('should return 400 if email is not valid', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto3)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return 400 if birthday is not ISO 8601 date string', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto4)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return 400 if gender is not a valid enum value', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto5)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return 400 if any of the required fields is missing', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto2)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return 201 if user is created', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto1)
                    .expect(HttpStatus.CREATED)
                    .expect((res) => {
                        userId = res.body.id;
                        userLoginResponseDto1.id = res.body.id;
                        userLoginResponseDto1.token = res.body.token;
                        expect(res.body).toEqual(userLoginResponseDto1);
                    });
            });

            it('should return 409 if user with given email already exists', () => {
                return request(app.getHttpServer())
                    .post('/users/register')
                    .send(createUserDto1)
                    .expect(HttpStatus.CONFLICT);
            });
        });

        describe('POST /login', () => {
            it('should return 200 and jwt token', () => {
                return request(app.getHttpServer())
                    .post('/users/login')
                    .send(userLoginRequestDto1)
                    .expect(HttpStatus.OK)
                    .expect((res) => {
                        token = res.body.token;
                        userLoginResponseDto1.id = res.body.id;
                        userLoginResponseDto1.token = token;
                        expect(res.body).toEqual(userLoginResponseDto1);
                    });
            });

            it('should return 400 when user with given email not found', () => {
                return request(app.getHttpServer())
                    .post('/users/login')
                    .send(userLoginRequestDto2)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return 400 when wrong password inserted', () => {
                return request(app.getHttpServer())
                    .post('/users/login')
                    .send(userLoginRequestDto3)
                    .expect(HttpStatus.BAD_REQUEST);
            });
            it('should return 400 when no data sent', () => {
                return request(app.getHttpServer()).post('/users/login').send({}).expect(HttpStatus.BAD_REQUEST);
            });
        });
    });

    afterAll(async (done) => {
        await app.close();
        await sequelize.drop();
        sequelize.close();
        done();
    });
});
