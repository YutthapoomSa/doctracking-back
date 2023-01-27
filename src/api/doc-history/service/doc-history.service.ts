import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateDocHistoryDtoReq } from '../dto/create-doc-history.dto';
import { UpdateDocHistoryDto } from '../dto/update-doc-history.dto';
import { DataBase } from './../../../database/database.providers';
import { DocHistoryDB } from './../../../database/entity/doc-history.entity';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { DocumentDB } from './../../../database/entity/document.entity';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { LogService } from './../../../helper/services/log.service';
import { ApiDocHistoryService } from './api-doc-history.service';

@Injectable()
export class DocHistoryService {
    private logger = new LogService(ApiDocHistoryService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        @Inject(DataBase.DocHistoryDB) private readonly docHistoryRepository: typeof DocHistoryDB,
        @Inject(DataBase.DocumentDB) private readonly docRepository: typeof DocumentDB,
        @Inject(DataBase.DocumentRoutingDB) private readonly docRoutingRepository: typeof DocumentRoutingDB,
        @Inject(DataBase.UserAgencyDB) private readonly userAgencyRepository: typeof UserAgencyDB,
    ) {}
    // [function]────────────────────────────────────────────────────────────────────────────────

    async create(
        userId: string,
        createDocHistoryDto: CreateDocHistoryDtoReq,
        _t?: Transaction,
        documentRoutingId?: string,
        agencyIdOrAgencySecondaryId?: string,
        _status?: DocHistoryDBStatus,
    ) {
        const tag = this.create.name;
        try {
            this.logger.debug('createDocHistoryDto -> ', createDocHistoryDto.documentId);

            let findDocRouting: DocumentRoutingDB;
            if (documentRoutingId) {
                const docRouting = await this.docRoutingRepository.findOne({
                    where: {
                        id: documentRoutingId,
                    },
                });
                if (!docRouting) throw Error(`cannot find document routing`);
                docRouting.status = _status;
                if (_status === DocHistoryDBStatus.receive) {
                    docRouting.isSuccess = true;
                    await docRouting.save();
                }
                await docRouting.save();
                this.logger.debug('docRouting -> ', docRouting);
            } else {
                if (createDocHistoryDto.agencyIdRecipient && createDocHistoryDto.agencySecondaryIdRecipient) {
                    findDocRouting = await this.docRoutingRepository.findOne({
                        where: {
                            documentId: createDocHistoryDto.documentId,
                            agencyIdRecipient: createDocHistoryDto.agencyIdRecipient,
                            agencySecondaryIdRecipient: createDocHistoryDto.agencySecondaryIdRecipient,
                        },
                    });
                    if (agencyIdOrAgencySecondaryId === findDocRouting.agencySecondaryIdRecipient) {
                        findDocRouting.isSuccess = true;
                        await findDocRouting.save();
                    }
                }
                if (createDocHistoryDto.agencyIdRecipient) {
                    findDocRouting = await this.docRoutingRepository.findOne({
                        where: {
                            documentId: createDocHistoryDto.documentId,
                            agencyIdRecipient: createDocHistoryDto.agencyIdRecipient,
                        },
                    });
                    if (agencyIdOrAgencySecondaryId === findDocRouting.agencyIdRecipient) {
                        findDocRouting.isSuccess = true;
                        await findDocRouting.save();
                    }
                }
                if (createDocHistoryDto.agencyIdSender && createDocHistoryDto.agencySecondaryIdSender) {
                    findDocRouting = await this.docRoutingRepository.findOne({
                        where: {
                            documentId: createDocHistoryDto.documentId,
                            agencyIdSender: createDocHistoryDto.agencyIdSender,
                            agencySecondaryIdSender: createDocHistoryDto.agencySecondaryIdSender,
                        },
                    });
                }
                if (createDocHistoryDto.agencyIdSender) {
                    findDocRouting = await this.docRoutingRepository.findOne({
                        where: {
                            documentId: createDocHistoryDto.documentId,
                            agencyIdSender: createDocHistoryDto.agencyIdSender,
                        },
                    });
                }

                if (!findDocRouting) throw Error(`cannot find document routing`);
                findDocRouting.status = _status;
                await findDocRouting.save();
                this.logger.debug('findOneRouting -> ', findDocRouting);
            }
            // const docHistory: DocHistoryDB[] = [];
            // for (const docHistoryFile of createDocHistoryDto) {
            const docHistories = new DocHistoryDB();
            {
                docHistories.userId = userId;
                docHistories.status = createDocHistoryDto.status;
                docHistories.comment = createDocHistoryDto.comment;
                docHistories.agencyIdSender = createDocHistoryDto.agencyIdSender
                    ? createDocHistoryDto.agencyIdSender
                    : null;
                docHistories.agencyIdRecipient = createDocHistoryDto.agencyIdRecipient
                    ? createDocHistoryDto.agencyIdRecipient
                    : null;
                docHistories.documentRoutingId = documentRoutingId ? documentRoutingId : findDocRouting.id;
                docHistories.agencySecondaryIdRecipient = createDocHistoryDto.agencySecondaryIdRecipient
                    ? createDocHistoryDto.agencySecondaryIdRecipient
                    : null;
                docHistories.agencySecondaryIdSender = createDocHistoryDto.agencySecondaryIdSender
                    ? createDocHistoryDto.agencySecondaryIdSender
                    : null;
                await docHistories.save({ transaction: _t ? _t : null });
            }
            return docHistories;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(_id: string, updateDocHistoryDto: UpdateDocHistoryDto) {
        const tag = this.update.name;
        try {
            const DocHistoryUpdate = await this.docHistoryRepository.update(
                {
                    status: updateDocHistoryDto.status,
                    comment: updateDocHistoryDto.comment,
                    agencyIdSender: updateDocHistoryDto.agencyIdSenders,
                    agencyIdRecipient: updateDocHistoryDto.agencyIdRecipient,
                },
                {
                    where: {
                        id: _id,
                    },
                },
            );

            if (DocHistoryUpdate[0] === 0) {
                throw new Error('not found');
            }
            return await this.findOne(_id);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string) {
        const tag = this.findOne.name;
        try {
            const result = await this.docHistoryRepository.findByPk(id);

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

    async findAll(_documentId: string) {
        const tag = this.findAll.name;
        try {
            const result = await this.docHistoryRepository.findAll({
                where: {
                    documentRoutingId: _documentId,
                },
            });
            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAcceptDoc(userId: string, createDocHistory: CreateDocHistoryDtoReq[], _t?: Transaction) {
        const tag = this.createAcceptDoc.name;
        try {
            const arrResult: DocHistoryDB[] = [];
            for (const item of createDocHistory) {
                const userAgencyIdOrSecondary = await this.checkUserIsAgencySecondary(userId);
                await this.create(userId, item, _t, item.documentRoutingId, userAgencyIdOrSecondary, item.status);

                const result = await this.docRepository.update(
                    {
                        // status: item.status,
                    },
                    {
                        where: {
                            id: item.documentId,
                        },
                        transaction: _t ? _t : null,
                    },
                );
            }

            return arrResult;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkUserIsAgencySecondary(_userId: string) {
        const tag = this.checkUserIsAgencySecondary.name;
        try {
            const userAgency = await this.userAgencyRepository.findOne({
                where: {
                    userId: _userId,
                },
            });
            if (!!userAgency.agencySecondary) {
                console.log('agency secondary -> ', userAgency.agencySecondaryId);
                return userAgency.agencySecondaryId;
            } else {
                console.log('agency secondary -> ', userAgency.agencyId);
                return userAgency.agencyId;
            }
        } catch (error) {
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
