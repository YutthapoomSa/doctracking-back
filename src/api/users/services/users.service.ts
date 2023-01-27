import {
    CACHE_MANAGER,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    OnApplicationBootstrap,
    UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { sign } from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { FindOptions, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { UserTokenDB } from '../../../database/entity/user-token.entity';
import { UserDB } from '../../../database/entity/user.entity';
import { ConvertImageService } from '../../../helper/services/convert-image.service';
import { EncryptionService } from '../../../helper/services/encryption.service';
import { LogService } from '../../../helper/services/log.service';
import { ConfigService } from '../../../shared/config/config.service';
import { JwtPayload } from '../auth/jwt-payload.model';
import { UserLoginRefreshToKenReqDto } from '../dto/user-login-refreshToken.dto';
import { UserLoginRequestDTO } from '../dto/user-login.dto';
import { DataBase } from './../../../database/database.providers';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { PaginationService } from './../../../helper/services/pagination/pagination.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { AgencyService } from './../../agency/services/agency.service';
import { UserPaginationDTO, UserPaginationResDTO } from './../dto/pagination-user.dto';
import { CacheUsersService } from './cache-users.service';
@Injectable()
export class UsersService implements OnApplicationBootstrap {
    private readonly jwtPrivateKey: string;
    private logger = new LogService(UsersService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(DataBase.UserDB) private readonly usersRepository: typeof UserDB,
        @Inject(DataBase.UserTokenDB) private readonly userTokenRepository: typeof UserTokenDB,
        @Inject(DataBase.UserDB) private readonly userRepository: typeof UserDB,

        private readonly configService: ConfigService,
        private encryptionService: EncryptionService,
        private convertImageService: ConvertImageService,
        private paginationService: PaginationService,

        @Inject(forwardRef(() => CacheUsersService))
        private cacheUsersService: CacheUsersService,
        @Inject(forwardRef(() => AgencyService))
        private agencyService: AgencyService,
    ) {
        this.jwtPrivateKey = this.configService.jwtConfig.privateKey;
    }
    async onApplicationBootstrap() {
        // const result = await this.findOne_ref_agency('34e2abcb-4135-4c82-9d77-ccfcf972527c');
        // this.logger.debug(`onApplicationBootstrap -> `, result);
        // await this.changePassword();
    }

    // [function]─────────────────────────────────────────────────────────────────

    async findOne(id: string): Promise<UserDB> {
        const tag = this.findOne.name;
        try {
            const resultGetCache = await this.cacheUsersService.getCacheUser(id);
            if (resultGetCache) return resultGetCache;

            const user = await this.usersRepository.findByPk<UserDB>(id);
            if (!user) throw new HttpException('User with given id not found', HttpStatus.NOT_FOUND);

            user.image = this.convertImageService.getLinkImage(user.image);

            await this.cacheUsersService.setCacheUser(user);

            return user;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne_ref_agency(_id: string): Promise<UserDB> {
        const tag = this.findOne_ref_agency.name;
        try {
            console.log('findOne');

            const user = await this.usersRepository.findOne({
                attributes: {
                    exclude: ['password'],
                },
                where: {
                    id: _id,
                },
                include: [
                    // {
                    //     model: AgencyDB,
                    //     through: {
                    //         attributes: [],
                    //     },
                    // },
                    {
                        model: UserAgencyDB,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [
                            {
                                model: AgencyDB,
                                attributes: ['id', 'agencyName'],
                            },
                        ],
                    },
                ],
            });
            // this.logger.debug('user -> ', user);
            if (!user) throw new HttpException('User with given id not found', HttpStatus.NOT_FOUND);
            return user;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async isEmail(_email: string): Promise<boolean> {
        const tag = this.isEmail.name;
        try {
            const findEmail = await this.usersRepository.findOne({
                where: {
                    email: _email,
                },
            });
            return findEmail ? true : false;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async genPassword(password: string) {
        const tag = this.genPassword.name;
        try {
            const _salt = this.encryptionService.encode(password);

            return {
                salt: _salt,
                hashPass: _salt,
            };
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(body: UserLoginRequestDTO) {
        const tag = this.login.name;
        try {
            const user = await this.usersRepository.findOne({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: {
                    username: body.username,
                },
            });

            if (!user) {
                throw new HttpException('Invalid username or email or password.', HttpStatus.BAD_REQUEST);
            }

            const decodePassword = await this.encryptionService.decode(user.password);
            if (decodePassword === body.password) {
                // genToken
                const _accessToken = await this.signToken(user, '30d');
                const _refreshToken = await this.signToken(user, '1d');
                const _expire = moment().add(30, 'd');

                // ─────────────────────────────────────────────────────────────────
                // add token to DB for verify
                const tokenDB = new UserTokenDB();
                tokenDB.accessToken = _accessToken.jit;
                tokenDB.refreshToken = _refreshToken.jit;
                tokenDB.expire = _expire.toISOString();
                tokenDB.userId = user.id;
                await tokenDB.save();

                user.image = this.convertImageService.getLinkImage(user.image);

                const _user = user.toJSON();
                delete _user.password;

                return {
                    user: _user,
                    accessToken: _accessToken.token,
                    refreshToken: _refreshToken.token,
                    expire: _expire.toDate(),
                    agency: await this.agencyService.findAll_by_userId(_user.id),
                };
            } else {
                throw new HttpException('Invalid username or password.', HttpStatus.BAD_REQUEST);
            }

            // findOne_by_userId

            // const _isMatch = await bcrypt.compare(body.password, user.password);

            // if (!_isMatch) {
            //     throw new HttpException('Invalid email or password.', HttpStatus.BAD_REQUEST);
            // }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshToken(user: UserDB, body: UserLoginRefreshToKenReqDto) {
        const tag = this.refreshToken.name;
        try {
            this.logger.debug(`${tag} -> body : `, body);

            // ────────────────────────────────────────────────────────────────────────────────
            const decodedAccessToken: JwtPayload = jwt_decode(body.accessToken);
            this.logger.debug(`${tag} -> decodedAccessToken : `, decodedAccessToken);
            // console.log(decoded);
            const decodedAccessToken2 = this.encryptionService.decode(decodedAccessToken.jit);
            this.logger.debug(`${tag} -> decodedAccessToken2 : `, decodedAccessToken2);

            // ────────────────────────────────────────────────────────────────────────────────
            const decodedRefreshToken: JwtPayload = jwt_decode(body.refreshToken);
            this.logger.debug(`${tag} -> decodedRefreshToken : `, decodedRefreshToken);
            // console.log(decoded);
            const decodedRefreshToken2 = this.encryptionService.decode(decodedRefreshToken.jit);
            this.logger.debug(`${tag} -> decodedRefreshToken2 : `, decodedRefreshToken2);

            // ────────────────────────────────────────────────────────────────────────────────

            const res = {
                resCode: ResStatus.success,
                resData: {},
                msg: '',
            };

            const result = await this.userTokenRepository.findOne({
                where: {
                    userId: user.id,
                    refreshToken: decodedRefreshToken2,
                    accessToken: decodedAccessToken2,
                },
            });

            if (!result) {
                const value = await this.cacheManager.get(`a_token${decodedAccessToken2}`);
                if (value) {
                    await this.cacheManager.del(`a_token${decodedAccessToken2}`);
                    throw new HttpException('Invalid refresh token.', HttpStatus.UNAUTHORIZED);
                } else {
                    throw new HttpException('Invalid test1.', HttpStatus.BAD_REQUEST);
                }
            }

            // genToken
            const _accessToken = await this.signToken(user, '1h');
            const _refreshToken = await this.signToken(user, '1d');
            // const _expire = moment().add(1, 'd').toISOString();
            let _expire = moment().add(1, 'd');
            _expire = _expire.add(5, 'm');

            // ─────────────────────────────────────────────────────────────────
            // add token to DB for verify
            const tokenDB = new UserTokenDB();

            tokenDB.accessToken = _accessToken.jit;
            tokenDB.refreshToken = _refreshToken.jit;
            tokenDB.expire = _expire.toISOString();
            tokenDB.userId = user.id;
            await tokenDB.save();

            this.logger.debug('save');
            res.resData = Object.assign(res.resData, { accessToken: _accessToken.token });
            res.resData = Object.assign(res.resData, { refreshToken: _refreshToken.token });
            res.resData = Object.assign(res.resData, { expire: _expire });

            await result.destroy();

            return res;
        } catch (error: any) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            // console.error(error)
            // checkErrorStatus(error)
            if (!!error && !!error.status && error.status === 401) {
                throw new UnauthorizedException();
            } else {
                throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    // ────────────────────────────────────────────────────────────────────────────────

    async verifyAccessToken(jit: string) {
        const tag = this.verifyAccessToken.name;
        try {
            const value = await this.cacheManager.get(`a_token${jit}`);
            if (value) {
                return true;
            }
            const count = await this.userTokenRepository.count({
                where: { accessToken: jit },
            });
            const isCount = count > 0;
            if (isCount) {
                await this.cacheManager.set(`a_token${jit}`, isCount, { ttl: 60 * 5 });
            }
            return isCount;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyRefreshToken(jit: string) {
        const tag = this.verifyRefreshToken.name;
        try {
            // const value = await this.cacheManager.get(`a_token${jit}`);
            // if (value) return true;

            const count = await this.userTokenRepository.count({
                where: { refreshToken: jit },
            });
            const isCount = count > 0;
            if (isCount) {
                // await this.cacheManager.set(`a_token${jit}`, isCount, { ttl: 10 });
            }
            return isCount;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkUserName(_username: string) {
        const count = await this.usersRepository.count({
            where: {
                username: _username,
            },
        });
        return count > 0;
    }

    async signToken(user: UserDB, expires?: string) {
        const _jit = uuidv4();
        const enDeCodeId = this.encryptionService.encode(user.id.toString());
        const enDeCodeJit = this.encryptionService.encode(_jit);
        const enDeCodeRole = this.encryptionService.encode(user.role);
        const payload: JwtPayload = {
            id: enDeCodeId,
            role: enDeCodeRole,
            jit: enDeCodeJit,
        };
        const _expires = expires || '1y';
        return {
            token: sign(payload, this.jwtPrivateKey, { expiresIn: _expires }),
            jit: _jit,
        };
    }

    async getAllUserId(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            const result = await this.usersRepository.findAll({ attributes: ['id'] });
            return resolve(result.map((x) => x.id));
        });
    }

    async paginationUser(paginationDTO: UserPaginationDTO): Promise<UserPaginationResDTO> {
        const tag = this.paginationUser.name;
        try {
            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };

            const findOption: FindOptions<UserDB> = {
                where: {
                    isDelete: false,
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: UserAgencyDB,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [
                            {
                                model: AgencyDB,
                                attributes: ['id', 'agencyName'],
                            },
                        ],
                    },
                ],
            };

            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.userRepository.count(findOption);

            // คำนวณชุดข้อมูล
            const padding = this.paginationService.paginationCal(
                resData.totalItems,
                paginationDTO.perPages,
                paginationDTO.page,
            );

            Object.assign(findOption, { order: [['createdAt', 'DESC']] });

            resData.totalPages = padding.totalPages;

            Object.assign(findOption, { offset: padding.skips });
            Object.assign(findOption, { limit: padding.limit });

            const _result = await this.userRepository.findAll(findOption);

            // this.logger.debug('user pagination data -> ', _result);
            resData.itemsPerPage = _result.length;

            return new UserPaginationResDTO(
                ResStatus.success,
                '',
                _result,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadUserImage(image: Express.Multer.File[], _userId: string) {
        const tag = this.uploadUserImage.name;
        try {
            const findUserById = await this.userRepository.findOne({
                where: {
                    id: _userId,
                },
            });
            this.logger.debug('image -> ', image);
            if (!findUserById) throw new HttpException(`cannot find user by id`, HttpStatus.INTERNAL_SERVER_ERROR);
            this.logger.debug('user id data -> ', findUserById);
            if (!!image) {
                for (const item of image) {
                    findUserById.image = item.filename;
                    await findUserById.save();
                }
            }

            return findUserById.image;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setFlexDelete(_userId: string) {
        const tag = this.setFlexDelete.name;
        try {
            const result = await this.userRepository.update(
                {
                    isDelete: true,
                },
                {
                    where: {
                        id: _userId,
                    },
                },
            );

            return result[0] > 0;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll_by_ids(ids: string[], _attributes?: string[]) {
        const tag = this.findAll_by_ids.name;
        try {
            if (!!!ids && ids.length === 0) {
                return [];
            }

            const findOption: FindOptions<UserDB> = {
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
            };

            Object.assign(findOption, { attributes: _attributes });

            return await this.userRepository.findAll(findOption);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async changePassword() {
        const tag = this.changePassword.name;
        try {
            const password = '1234';
            const allUser = await this.userRepository.findAll();
            for (const item of allUser) {
                item.password = this.encryptionService.encode(password);
                await item.save();
                console.log(item.username);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // [Cron]─────────────────────────────────────────────────────────────────

    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    cronLoginToken() {
        this.logger.debug(`cron -> EVERY_DAY_AT_11PM`);
        const _moment = moment().toISOString();
        this.userTokenRepository.destroy({
            where: {
                expire: {
                    [Op.lte]: _moment,
                },
            },
        });
    }
}
