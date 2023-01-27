import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LogService } from './../../../helper/services/log.service';
import { ChangAgencyUserDTO } from '../dto/chang-agency-user.dto';
import { DataBase } from './../../../database/database.providers';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';

@Injectable()
export class UserAgencyService {
    private logger = new LogService(UserAgencyService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        @Inject(DataBase.UserAgencyDB) private readonly userAgencyDBRepository: typeof UserAgencyDB,
    ) {}

    async create(userAgencyDB: UserAgencyDB[], _t?: Transaction) {
        const tag = this.create.name;

        try {
            if (userAgencyDB.length === 0) {
                throw new Error('arg userAgencyDB null.');
            }

            const result = await this.userAgencyDBRepository.bulkCreate(JSON.parse(JSON.stringify(userAgencyDB)), {
                transaction: _t ? _t : null,
            });

            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeAgency(changAgencyUserDTO: ChangAgencyUserDTO) {
        const tag = this.changeAgency.name;
        try {
            // count คนดังกล่าวจาก user agency
            const count = await this.userAgencyDBRepository.count({
                where: {
                    userId: changAgencyUserDTO.userId,
                    agencyId: changAgencyUserDTO.agencyId,
                },
            });

            let userAgencyDB: UserAgencyDB = null;
            if (count > 1) {
                // ลบทั้งหมด
                this.userAgencyDBRepository.destroy({
                    where: {
                        userId: changAgencyUserDTO.userId,
                    },
                });
            } else {
                userAgencyDB = await this.userAgencyDBRepository.findOne({
                    where: {
                        userId: changAgencyUserDTO.userId,
                        agencyId: changAgencyUserDTO.agencyId,
                    },
                });

                if (userAgencyDB) {
                    return userAgencyDB;
                }
            }

            userAgencyDB = new UserAgencyDB();
            userAgencyDB.agencyId = changAgencyUserDTO.agencyId;
            userAgencyDB.userId = changAgencyUserDTO.userId;
            await userAgencyDB.save();

            return userAgencyDB;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
