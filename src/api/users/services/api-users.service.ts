import {
    CACHE_MANAGER,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Sequelize } from 'sequelize-typescript';
import { UserTokenDB } from '../../../database/entity/user-token.entity';
import { UserDB, UserDBRole } from '../../../database/entity/user.entity';
import { ConvertImageService } from '../../../helper/services/convert-image.service';
import { EncryptionService } from '../../../helper/services/encryption.service';
import { LogService } from '../../../helper/services/log.service';
import { PaginationService } from '../../../helper/services/pagination/pagination.service';
import { ConfigService } from '../../../shared/config/config.service';
import { ChangAgencyUserDTO } from '../dto/chang-agency-user.dto';
import { CreateUserReqDTO } from '../dto/create-user-req.dto';
import { LoginUserResDTO } from '../dto/login-user.dto';
import { UserLoginRefreshToKenReqDto } from '../dto/user-login-refreshToken.dto';
import { UserLoginRequestDTO } from '../dto/user-login.dto';
import { DataBase } from './../../../database/database.providers';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { GlobalResDTO } from './../../global-dto/global-res.dto';
import { FindOneUserResDTO } from './../dto/find-one-user-res.dto';
import { CacheUsersService } from './cache-users.service';
import { UserAgencyService } from './user-agency.service';
import { UsersService } from './users.service';

@Injectable()
export class ApiUsersService implements OnApplicationBootstrap {
    private logger = new LogService(ApiUsersService.name);

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(DataBase.UserDB) private usersRepository: typeof UserDB,
        @Inject(DataBase.UserTokenDB) private userTokenRepository: typeof UserTokenDB,
        @Inject(DataBase.UserDB) private userRepository: typeof UserDB,
        @Inject('SEQUELIZE') private sequelize: Sequelize,

        private configService: ConfigService,
        private paginationService: PaginationService,
        private encryptionService: EncryptionService,
        private convertImageService: ConvertImageService,
        private userAgencyService: UserAgencyService,

        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,

        @Inject(forwardRef(() => CacheUsersService))
        private cacheUsersService: CacheUsersService,
    ) {}

    async onApplicationBootstrap() {
        await this.initSuperAdmin();
    }

    async api_findOne(id: string): Promise<FindOneUserResDTO> {
        const tag = this.api_findOne.name;
        try {
            return new FindOneUserResDTO(ResStatus.success, '', await this.usersService.findOne_ref_agency(id));
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_login(userLoginRequestDto: UserLoginRequestDTO): Promise<LoginUserResDTO> {
        const tag = this.api_login.name;
        try {
            const result = await this.usersService.login(userLoginRequestDto);

            return new LoginUserResDTO(
                ResStatus.success,
                '',
                result.user,
                result.accessToken,
                result.refreshToken,
                result.expire,
                result.agency,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_create(body: CreateUserReqDTO) {
        const tag = this.api_create.name;
        try {
            const email = await this.usersService.isEmail(body.email);
            if (email) {
                return new FindOneUserResDTO(ResStatus.fail, 'อีเมลนี้ถูกใช้ไปแล้ว', null);
            }

            const username = await this.usersService.checkUserName(body.username);
            if (username) {
                return new FindOneUserResDTO(ResStatus.fail, 'ชื่อผู้ใช้ถูกใช้ไปแล้ว', null);
            }

            // this.logger.debug(`${tag} -> body : `, body);

            // ─────────────────────────────────────────────────────────────────
            // const resultHash = await this.usersService.genPassword(body.password);
            // const _salt = resultHash.salt;
            // const _hashPass = resultHash.hashPass;

            const user = new UserDB();
            user.email = body.email.trim().toLowerCase();
            user.username = body.username.trim().toLowerCase();
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            // user.password = _hashPass;
            user.password = this.encryptionService.encode(body.password);
            user.gender = body.gender;
            user.phoneNumber = body.phoneNumber;
            user.role = body.role;
            await user.save();

            if (body.agencyId !== null && body.agencyId !== undefined) {
                const userAgencyDB = new UserAgencyDB();
                userAgencyDB.agencyId = body.agencyId;
                if (body.agencySecondaryId) {
                    userAgencyDB.agencySecondaryId = body.agencySecondaryId;
                } else {
                    userAgencyDB.agencySecondaryId = null;
                }
                userAgencyDB.userId = user.id;
                await this.userAgencyService.create([userAgencyDB]);
            }
            return new FindOneUserResDTO(ResStatus.success, '', user);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_update(id: string, body: CreateUserReqDTO) {
        const tag = this.api_create.name;
        try {
            const user = await this.userRepository.findByPk(id);

            if (!user) {
                return new FindOneUserResDTO(ResStatus.fail, 'ไม่พบข้อมูล', null);
            }

            if (body.password) {
                // const resultHash = await this.usersService.genPassword(body.password);
                // user.password = resultHash.hashPass;
                user.password = this.encryptionService.encode(body.password);
            }

            user.email = body.email.trim().toLowerCase();
            user.username = body.username.trim().toLowerCase();
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.gender = body.gender;
            user.phoneNumber = body.phoneNumber;
            user.role = body.role;
            await user.save();

            await this.cacheUsersService.removeCacheUser(user.id);
            return new FindOneUserResDTO(ResStatus.success, '', user);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_refreshToken(user: UserDB, createUserDto: UserLoginRefreshToKenReqDto) {
        const tag = this.api_refreshToken.name;
        try {
            return await this.usersService.refreshToken(user, createUserDto);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_changAgency(createUserDto: ChangAgencyUserDTO): Promise<FindOneUserResDTO> {
        const tag = this.api_changAgency.name;
        try {
            const result = await this.userAgencyService.changeAgency(createUserDto);
            return new FindOneUserResDTO(
                ResStatus.success,
                '',
                await this.usersService.findOne_ref_agency(result.userId),
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_delete(_userId: string): Promise<GlobalResDTO> {
        const tag = this.api_changAgency.name;
        try {
            const result = await this.usersService.setFlexDelete(_userId);
            return new GlobalResDTO(result ? ResStatus.success : ResStatus.fail, '');
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async initSuperAdmin() {
        const tag = this.initSuperAdmin.name;
        try {
            const result = await this.usersRepository.findOne({
                where: { username: 'superAdmin' },
            });
            if (!result) {
                const createUserReqDto = new CreateUserReqDTO();
                createUserReqDto.email = 'superAdmin@gmail.com';
                createUserReqDto.username = 'superAdmin';
                createUserReqDto.firstName = 'superAdmin';
                createUserReqDto.lastName = 'superAdmin';
                createUserReqDto.password = 'superAdmin';
                createUserReqDto.role = UserDBRole.superAdmin;
                await this.api_create(createUserReqDto);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
