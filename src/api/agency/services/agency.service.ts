import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FindOptions, Op, Sequelize, Transaction } from 'sequelize';
import { CreateAgencyDTOReq } from '../dto/create-agency.dto';
import { AgencyPaginationDTO } from '../dto/pagination-agency.dto';
import { UpdateAgencyDto } from '../dto/update-agency.dto';
import { DocumentService } from './../../../api/document/service/document.service';
import { DataBase } from './../../../database/database.providers';
import { AgencySecondaryDB } from './../../../database/entity/agency-secondary.entity';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { UserDB, UserDBRole } from './../../../database/entity/user.entity';
import { LogService } from './../../../helper/services/log.service';
import { PaginationService } from './../../../helper/services/pagination/pagination.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { CreateAgencySecondaryDTOReq } from './../dto/create-agency-secondary.dto';
import { AgencyPaginationResDTO } from './../dto/pagination-agency.dto';

@Injectable()
export class AgencyService {
    private logger = new LogService(AgencyService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        @Inject(DataBase.AgencyDB) private readonly agencyRepository: typeof AgencyDB, // @Inject(DataBase.UserDB) private readonly userRepository: typeof UserDB,
        @Inject(DataBase.AgencySecondaryDB)
        private agencySecondaryRepository: typeof AgencySecondaryDB,
        @Inject(DataBase.UserAgencyDB)
        private readonly userAgencyRepository: typeof UserAgencyDB,
        @Inject(forwardRef(() => DocumentService))
        private documentService: DocumentService,
        private paginationService: PaginationService,
    ) {}

    // [function]─────────────────────────────────────────────────────────────────

    async isCheckAgency(_agencyId: string, _userId: string) {
        const tag = this.isCheckAgency.name;
        try {
            const count = await this.agencyRepository.count({
                where: {
                    id: _agencyId,
                },
                include: [
                    {
                        model: UserDB,
                        required: true,
                        where: {
                            id: _userId,
                        },
                    },
                ],
            });
            return count > 0;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async create(user: UserDB, createAgencyDto: CreateAgencyDTOReq, _t?: Transaction) {
        this.logger.debug(createAgencyDto);
        const tag = this.create.name;
        try {
            if (UserDBRole.superAdmin !== user.role && UserDBRole.manager !== user.role) {
                throw new Error('Not Role Permission');
            }

            const count = await this.agencyRepository.count({
                where: {
                    agencyName: createAgencyDto.agencyName,
                    agencyCode: createAgencyDto.agencyCode,
                },
            });

            if (count > 0) {
                throw new Error('Agency already exists');
            }

            const _data = new AgencyDB();
            _data.agencyCode = createAgencyDto.agencyCode;
            _data.agencyName = createAgencyDto.agencyName;
            _data.abbreviationName = createAgencyDto.abbreviationName;
            await _data.save({ transaction: _t ? _t : null });
            return _data;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async update(_id: string, updateAgencyDto: UpdateAgencyDto) {
        const tag = this.update.name;
        try {
            // ─────────────────────────────────────────────────────────────────
            const resultUpdate = await this.agencyRepository.update(
                {
                    agencyName: updateAgencyDto.agencyName,
                    abbreviationName: updateAgencyDto.abbreviationName,
                    agencyCode: updateAgencyDto.agencyCode,
                },
                {
                    where: {
                        id: _id,
                    },
                },
            );
            const findAllAgencySecondary = await this.agencyRepository.findOne({
                include: [
                    {
                        model: AgencySecondaryDB,
                        where: {
                            agencyId: _id,
                        },
                    },
                ],
            });
            for (const item of updateAgencyDto.agencySecondaryLists) {
                Object.assign(item, { isDelete: false });
                if (!!item.id) {
                    await this.agencySecondaryRepository.update(
                        {
                            agencyCode: item.agencyCode,
                            abbreviationName: item.abbreviationName,
                            agencyName: item.agencyName,
                        },
                        {
                            where: {
                                agencyId: _id,
                                id: item.id,
                            },
                        },
                    );
                }
                // add dynamic start logic
                else if (item.id === null) {
                    const createAgencySecondary = new AgencySecondaryDB();
                    createAgencySecondary.agencyName = item.agencyName;
                    createAgencySecondary.agencyCode = item.agencyCode;
                    createAgencySecondary.abbreviationName = item.abbreviationName;
                    createAgencySecondary.agencyId = _id;
                    await createAgencySecondary.save();
                }
                // add dynamic end logic
                else {
                    item.isDelete = true;
                }
            }

            // compare dto update with db
            const resultCompare = findAllAgencySecondary.agencySecondaryLists.filter(
                (res1) => !updateAgencyDto.agencySecondaryLists.some((res2) => res1.id === res2.id),
            );
            this.logger.debug('resultCompare -> ', resultCompare);

            // delete dynamic start logic
            // let findNotUpdate;
            // updateAgencyDto.agencySecondaryLists.filter((res) => {
            //     this.logger.debug('update agency dto list -> ', res);
            //     findNotUpdate = findAllAgencySecondary.agencySecondaryLists.filter((res2) => {
            //         if (res2.id !== res.id) {
            //             this.logger.debug('update agency dto list in if -> ', res2);
            //             return res.id;
            //         }
            //     });
            // });
            // this.logger.debug('FIND -> ', findNotUpdate);

            const arrIdDelete = [];
            for (const item of resultCompare) {
                arrIdDelete.push(item.id);
            }

            const findItemForDelete = await this.agencySecondaryRepository.findAll({
                where: {
                    id: arrIdDelete,
                },
            });
            this.logger.debug('findItemForDelete -> ', findItemForDelete);

            for (const deleteItem of findItemForDelete) {
                await deleteItem.destroy();
            }

            // delete dynamic end logic
            if (resultUpdate[0] === 0) {
                throw new Error('not found');
            }
            return await this.findOne(_id);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async findOne(id: string) {
        const tag = this.findOne.name;
        try {
            const result = await this.agencyRepository.findByPk(id);

            if (!result) {
                throw new Error('not found');
            }

            return result;
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

            const findOption: FindOptions<AgencyDB> = {
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
            };

            Object.assign(findOption, { attributes: _attributes });

            const result = await this.agencyRepository.findAll(findOption);

            if (!result) throw new Error('not found');

            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne_by_userId(_userId: string) {
        const tag = this.findOne_by_userId.name;
        try {
            const result = await this.userAgencyRepository.findOne({
                where: {
                    userId: _userId,
                },
                include: [
                    {
                        model: AgencyDB,
                    },
                ],
            });
            // const result = await this.agencyRepository.findOne({
            //     include: [
            //         {
            //             attributes: ['id'],
            //             model: UserDB,
            //             where: {
            //                 id: userId,
            //             },
            //             through: {
            //                 attributes: [],
            //             },
            //         },
            //     ],
            // });

            if (!result) {
                throw new Error('not found');
            }

            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll_by_userId(_userId: string) {
        const tag = this.findAll_by_userId.name;
        try {
            const result = await this.userAgencyRepository.findAll({
                where: {
                    userId: _userId,
                },
                attributes: ['id'],
                include: [
                    {
                        model: AgencyDB,
                    },
                    {
                        model: AgencySecondaryDB,
                    },
                ],
            });
            // const result = await this.agencyRepository.findAll({
            //     include: [
            //         {
            //             attributes: ['id'],
            //             model: UserDB,
            //             where: {
            //                 id: userId,
            //             },
            //             through: {
            //                 attributes: [],
            //             },
            //         },
            //     ],
            // });

            if (!result) {
                throw new Error('not found');
            }
            this.logger.debug(`${tag} -> `, result);
            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(_id: string) {
        const tag = this.remove.name;
        try {
            return await this.agencyRepository.destroy({
                where: {
                    id: _id,
                },
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paginationAgency(paginationDTO: AgencyPaginationDTO): Promise<AgencyPaginationResDTO> {
        const tag = this.paginationAgency.name;
        try {
            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };

            const findOption: FindOptions = {
                order: [['createdAt', 'DESC']],
                // include: [
                //     {
                //         model: AgencySecondaryDB,
                //         attributes: { exclude: ['createdAt', 'updatedAt'] },
                //     },
                // ],
            };

            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.agencyRepository.count(findOption);

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

            const _result = await this.agencyRepository.findAll(findOption);
            const agencyIds = [];
            for (const item of _result) {
                agencyIds.push(item.id);
            }

            const _result2 = await this.agencyRepository.findAll({
                where: {
                    id: {
                        [Op.in]: agencyIds,
                    },
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: AgencySecondaryDB,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                ],
            });
            resData.itemsPerPage = _result2.length;

            return new AgencyPaginationResDTO(
                ResStatus.success,
                '',
                _result2,
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

    async getAllAgency() {
        const tag = this.getAllAgency.name;
        try {
            const resultFindAllAgency = await this.agencyRepository.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: [
                    {
                        model: AgencySecondaryDB,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                ],
            });
            // const resultNameAndId = [];
            // for (const item of resultFindAllAgency) {
            //     for (const item2 of item.agencySecondaryLists) {
            //         resultNameAndId.push({
            //             id: item.id,
            //             agencyName: item.agencyName,
            //             agencySecondary: [
            //                 {
            //                     id: item2.id,
            //                     agencySecondaryName: item2.agencyName,
            //                 },
            //             ],
            //         });
            //     }
            // }
            return resultFindAllAgency;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAgencySecondary(user: UserDB, _agencyId: string) {
        const tag = this.getAllAgencySecondary.name;
        try {
            const findAllAgencySecondary = await this.agencySecondaryRepository.findAll({
                where: {
                    agencyId: _agencyId,
                },
            });
            return findAllAgencySecondary;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAgencySecondary(user: UserDB, createAgencyDto: CreateAgencySecondaryDTOReq, _t?: Transaction) {
        const tag = this.createAgencySecondary.name;
        try {
            if (UserDBRole.superAdmin !== user.role && UserDBRole.manager !== user.role) {
                throw new Error('Not Role Permission');
            }

            const count = await this.agencySecondaryRepository.count({
                where: {
                    agencyName: createAgencyDto.agencyName,
                    agencyCode: createAgencyDto.agencyCode,
                },
            });

            if (count > 0) {
                throw new Error('Agency already exists');
            }
            const _data = new AgencySecondaryDB();
            _data.agencyCode = createAgencyDto.agencyCode;
            _data.agencyName = createAgencyDto.agencyName;
            _data.abbreviationName = createAgencyDto.abbreviationName;
            _data.agencyId = createAgencyDto.agencyId;
            await _data.save({ transaction: _t ? _t : null });
            return _data;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAgency(user: UserDB, agencyId: string) {
        const tag = this.getAgency.name;
        try {
            const findAgency = await this.agencyRepository.findOne({
                where: {
                    id: agencyId,
                },
                include: [
                    {
                        model: AgencySecondaryDB,
                        order: [['createdAt', 'ASC']],
                    },
                ],
            });
            return findAgency;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
