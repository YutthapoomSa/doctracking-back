import { faker } from '@faker-js/faker';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import moment from 'moment';
import sequelize, { FindOptions, Includeable, Op, Sequelize, Transaction, WhereOptions } from 'sequelize';
import { CreateDocumentDTOReq } from '../dto/create-document.dto';
import { DocumentSummaryPaginationDTO } from '../dto/pagination-summary-document.dto';
import { AgencyService } from './../../../api/agency/services/agency.service';
import { UsersService } from './../../../api/users/services/users.service';
import { DataBase } from './../../../database/database.providers';
import { AgencySecondaryDB } from './../../../database/entity/agency-secondary.entity';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { DocFileDB } from './../../../database/entity/doc-file.entity';
import { DocHistoryDB } from './../../../database/entity/doc-history.entity';
import { DocumentApproveDB } from './../../../database/entity/document-approve.entity';
import { DocumentExternalClerkDB } from './../../../database/entity/document-external-clerk.entity';
import { DocumentInternalClerkDB } from './../../../database/entity/document-internal-clerk.entity';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { LogBeforeDB } from './../../../database/entity/log-before.entity';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { UserDB, UserDBRole } from './../../../database/entity/user.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { LogService } from './../../../helper/services/log.service';
import { PaginationService } from './../../../helper/services/pagination/pagination.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { CreateDocHistoryDtoReq } from './../../doc-history/dto/create-doc-history.dto';
import { DocHistoryService } from './../../doc-history/service/doc-history.service';
import { ArchiveDocumentCreatePaginationDTO, ArchiveDocumentCreateResDTO } from './../dto/archive-document-create.dto';
import { ArchiveDocumentPaginationDTO, ArchiveDocumentResDTO } from './../dto/archive-document.dto';
import { CreateForwardOrReturnDocumentDtoReq } from './../dto/create-forward-return.dto';
import { DocumentInPaginationDTO } from './../dto/pagination-document-in.dto';
import { DocumentPaginationResDTO } from './../dto/pagination-document.dto';
import { DocumentPaginationDTOV2, DocumentPaginationResDTOV2 } from './../dto/pagination-documentv2.dto';
import { PaginationLogBeforeDTO, PaginationLogBeforeResDTO } from './../dto/pagination-log-before.dto';
import { PaginationSearchDocumentDTO, PaginationSearchDocumentResDTO } from './../dto/pagination-search-document.dto';
import { SummaryDocumentDTOReq } from './../dto/summary-document.dto';
import { UpdateDocumentDto } from './../dto/update-document.dto';
import { DocumentApproveService } from './document-approve.service';

@Injectable()
export class DocumentService implements OnApplicationBootstrap {
    private logger = new LogService(DocumentService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelizes: Sequelize,
        @Inject(DataBase.DocumentDB) private readonly documentRepository: typeof DocumentDB,
        @Inject(DataBase.UserAgencyDB) private readonly userAgencyRepository: typeof UserAgencyDB,
        @Inject(DataBase.DocumentRoutingDB) private readonly docRoutingRepository: typeof DocumentRoutingDB,
        // @Inject(DataBase.DocFileDB) private readonly docFileRepository: typeof DocFileDB,
        // @Inject(DataBase.UserDB) private readonly userRepository: typeof UserDB,
        @Inject(DataBase.AgencyDB) private readonly agencyDBRepository: typeof AgencyDB,
        @Inject(DataBase.DocumentExternalClerkDB)
        private readonly docExternalDBRepository: typeof DocumentExternalClerkDB,
        @Inject(DataBase.DocumentInternalClerkDB)
        private readonly docInternalDBRepository: typeof DocumentInternalClerkDB,
        @Inject(DataBase.DocFileDB)
        private readonly docFileDBRepository: typeof DocFileDB,
        @Inject(DataBase.LogBeforeDB)
        private readonly logBeforeDBRepository: typeof LogBeforeDB,
        // @Inject(DataBase.DocHistoryDB) private readonly docHistoryRepository: typeof DocHistoryDB,
        @Inject(forwardRef(() => AgencyService))
        private agencyService: AgencyService,

        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,

        @Inject(forwardRef(() => DocHistoryService))
        private docHistoryService: DocHistoryService,

        @Inject(forwardRef(() => DocumentApproveService))
        private documentApproveService: DocumentApproveService,

        private paginationService: PaginationService,
    ) { }

    async onApplicationBootstrap() {
        // const result = await this.autoGenDocNoExternal();
        // this.logger.debug('result -> ', result);
        // const result = await this.docRoutingRepository.findAll({
        //     where: {
        //         routingTrackNumber: null,
        //     },
        // });
        // for (const item of result) {
        //     item.routingTrackNumber = uuidv4();
        //     await item.save();
        // }
        // const result = await this.documentPagination({
        //     perPages: 10,
        //     page: 1,
        //     search: '',
        // });
        // this.logger.debug(`api_summary -> `, result);
        // const result = await this.paginationDocumentIn(null, {
        //     perPages: 10,
        //     page: 1,
        //     search: '',
        //     agencyId: '65c2ee7b-b8ba-4d04-a561-edf6f5d85285',
        //     startAt: '2022-09-01',
        //     endAt: '2022-09-30',
        //     status: [DocHistoryDBStatus.sendOut],
        //     isAgencyCheckLast: false,
        //     isCheckAgencyIdSender: true,
        //     isCheckAgencyIdRecipient: false,
        //     isCheckApprove: true,
        // });
        // // const result = await this.findOneDocument('062d2bb9-46ea-4a3d-ad85-251855278129');
        // this.logger.debug(`api_summary -> `, result);
        // this.fakeDoc();
    }

    // [function]────────────────────────────────────────────────────────────────────────────────

    async create(user: UserDB, createDocumentDto: CreateDocumentDTOReq, _t?: Transaction) {
        const tag = this.create.name;
        try {
            const resultUserAgency = await this.agencyService.findOne_by_userId(user.id);
            if (!resultUserAgency) throw new Error('no agency');

            const getDocNo = await this.autoGenDocNo(); // gen. no doc

            const sender = createDocumentDto.sender.agencyIdSender ? createDocumentDto.sender.agencyIdSender : null;
            const agencySecondarySender = createDocumentDto.sender.agencySecondarySender
                ? createDocumentDto.sender.agencySecondarySender
                : null;

            const _document = new DocumentDB();
            _document.name = createDocumentDto.name;
            _document.priority = createDocumentDto.priority;
            _document.barcode = new Date().getTime().toString();
            _document.documentType = createDocumentDto.documentType;
            _document.userId = user.id;
            _document.agencyId = sender;
            _document.detail = createDocumentDto.detail;
            _document.governmentDocNo = createDocumentDto.governmentDocNo;
            _document.docNo = ` ${getDocNo}`;
            _document.formDoc = createDocumentDto.formDoc;
            _document.toDoc = createDocumentDto.toDoc;
            _document.externalAgencyName = createDocumentDto.externalAgencyName;
            _document.isCancel = false;
            _document.isExternal = createDocumentDto.isExternal;
            _document.externalDate = createDocumentDto.externalDate;
            await _document.save({ transaction: _t ? _t : null });
            if (createDocumentDto.isExternal) {
                const getDocNoExternal = await this.autoGenDocNoExternal();
                this.logger.debug('getDocNoExternal -> ', getDocNoExternal)
                const externalClerk = new DocumentExternalClerkDB();
                externalClerk.documentId = _document.id;
                externalClerk.isStatusDone = false;
                externalClerk.docNo = `${getDocNoExternal}`;
                await externalClerk.save();
            } else {
                const getDocNoInternal = await this.autoGenDocNoInternal();
                const internalClerk = new DocumentInternalClerkDB();
                internalClerk.documentId = _document.id;
                internalClerk.isStatusDone = false;
                internalClerk.docNo = `${getDocNoInternal}`;
                await internalClerk.save();
            }
            for (const iterator of createDocumentDto.recipients) {
                const agencyIdRecipient = iterator.agencyIdRecipient ? iterator.agencyIdRecipient : null;
                const agencySecondaryIdRecipient = iterator.agencySecondaryIdRecipient
                    ? iterator.agencySecondaryIdRecipient
                    : null;

                const createDocRouting = new DocumentRoutingDB();
                createDocRouting.documentId = _document.id;
                createDocRouting.agencyIdSender = sender;
                createDocRouting.agencySecondaryIdSender = agencySecondarySender;
                createDocRouting.agencyIdRecipient = agencyIdRecipient;
                createDocRouting.agencySecondaryIdRecipient = agencySecondaryIdRecipient;
                createDocRouting.status = DocHistoryDBStatus.create;
                await createDocRouting.save();

                const createDocHistoryDtoReq = new CreateDocHistoryDtoReq();
                createDocHistoryDtoReq.agencyIdSender = sender;
                createDocHistoryDtoReq.agencySecondaryIdSender = agencySecondarySender;
                createDocHistoryDtoReq.agencyIdRecipient = agencyIdRecipient;
                createDocHistoryDtoReq.agencySecondaryIdRecipient = agencySecondaryIdRecipient;
                createDocHistoryDtoReq.comment = null;
                createDocHistoryDtoReq.documentId = _document.id;
                createDocHistoryDtoReq.status = DocHistoryDBStatus.create;
                await this.docHistoryService.create(
                    user.id,
                    createDocHistoryDtoReq,
                    null,
                    createDocRouting.id,
                    null,
                    DocHistoryDBStatus.create,
                );

                if (createDocumentDto.isStatusSendOut) {
                    const createDocHistoryDtoReq2 = new CreateDocHistoryDtoReq();
                    createDocHistoryDtoReq.agencyIdSender = sender;
                    createDocHistoryDtoReq.agencySecondaryIdSender = agencySecondarySender;
                    createDocHistoryDtoReq2.agencyIdRecipient = agencyIdRecipient;
                    createDocHistoryDtoReq2.agencySecondaryIdRecipient = agencySecondaryIdRecipient;
                    createDocHistoryDtoReq2.comment = null;
                    createDocHistoryDtoReq2.documentId = _document.id;
                    createDocHistoryDtoReq2.status = DocHistoryDBStatus.sendOut;
                    await this.docHistoryService.create(
                        user.id,
                        createDocHistoryDtoReq,
                        null,
                        createDocRouting.id,
                        null,
                        DocHistoryDBStatus.sendOut,
                    );
                    createDocRouting.status = DocHistoryDBStatus.sendOut;
                    await createDocRouting.save({ transaction: _t ? _t : null });
                    await _document.save({ transaction: _t ? _t : null });
                }
            }

            return _document;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async documentPagination(
        user: UserDB,
        paginationDTO: DocumentPaginationDTOV2,
        agencyRecipientId: string,
        agencySecondaryRecipientId: string,
        agencySenderId: string,
        agencySecondarySenderId: string,
        documentExternalIds: number[],
        documentInternalIds: number[],
    ): Promise<DocumentPaginationResDTOV2> {
        const tag = this.documentPagination.name;
        try {
            this.logger.debug('#step 1  -> ค้นหา ข้อมูล user');
            const findUserDetail = await this.userAgencyRepository.findOne({
                attributes: ['id'],
                where: {
                    userId: user.id,
                },
                include: [
                    {
                        attributes: ['id'],
                        model: AgencyDB,
                    },
                    {
                        attributes: ['id'],
                        model: AgencySecondaryDB,
                    },
                ],
            });

            const option2: WhereOptions<DocumentRoutingDB> = {};

            switch (user.role) {
                case UserDBRole.superAdmin:
                    break;

                case UserDBRole.admin:
                case UserDBRole.manager:
                case UserDBRole.user:
                    if (!!findUserDetail.agencyId) {
                        if (!!findUserDetail.agencySecondaryId) {
                            Object.assign(option2, { agencySecondaryIdSender: findUserDetail.agencySecondaryId });
                        }
                        Object.assign(option2, { agencyIdSender: findUserDetail.agencyId });
                    }
                    this.logger.warn('option3 -> ', option2);
                    break;
            }

            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };

            if (agencyRecipientId) {
                Object.assign(option2, { agencyIdRecipient: agencyRecipientId });
            }

            if (agencySecondaryRecipientId) {
                Object.assign(option2, { agencySecondaryIdRecipient: agencySecondaryRecipientId });
            }

            // ─────────────────────────────────────────────────────
            const whereOptionDocumentExternalClerk: Includeable[] = [];

            if (paginationDTO.isExternal) {
                if (!!documentExternalIds && documentExternalIds.length > 0) {
                    whereOptionDocumentExternalClerk.push({
                        attributes: ['id'],
                        model: DocumentExternalClerkDB,
                        where: {
                            docNo: {
                                [Op.in]: documentExternalIds,
                            },
                        },
                        required: true,
                    });
                }
            } else {
                if (!!documentInternalIds && documentInternalIds.length > 0) {
                    whereOptionDocumentExternalClerk.push({
                        attributes: ['id'],
                        model: DocumentInternalClerkDB,
                        where: {
                            docNo: {
                                [Op.in]: documentExternalIds,
                            },
                        },
                        required: true,
                    });
                }
            }

            // ─────────────────────────────────────────────────────

            let findAllDocument: DocumentDB[] = null;
            if (
                paginationDTO.isExternal === true &&
                paginationDTO.isExternal !== null &&
                paginationDTO.isExternal !== undefined
            ) {
                if (paginationDTO.startAt && paginationDTO.endAt) {
                    whereOptionDocumentExternalClerk.push({
                        attributes: ['id'],
                        model: DocumentRoutingDB,
                        where: option2,
                    });
                    whereOptionDocumentExternalClerk.push({
                        model: DocumentExternalClerkDB,
                        required: true,
                    });
                    this.logger.debug('whereOptionDocumentExternalClerk -> ', whereOptionDocumentExternalClerk);

                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        where: {
                            createdAt: {
                                [Op.gte]: `${paginationDTO.startAt} 00:00:00`,
                                [Op.lte]: `${paginationDTO.endAt} 23:59:59`,
                            },
                        },
                        order: [['createdAt', 'DESC']],
                        include: whereOptionDocumentExternalClerk,
                    });
                } else {
                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                attributes: ['id'],
                                model: DocumentRoutingDB,
                                where: option2,
                            },
                            {
                                model: DocumentExternalClerkDB,
                                required: true,
                            },
                        ],
                    });
                }
            } else if (
                paginationDTO.isExternal === false &&
                paginationDTO.isExternal !== null &&
                paginationDTO.isExternal !== undefined
            ) {
                if (paginationDTO.startAt && paginationDTO.endAt) {
                    whereOptionDocumentExternalClerk.push({
                        attributes: ['id'],
                        model: DocumentRoutingDB,
                        where: option2,
                    });
                    whereOptionDocumentExternalClerk.push({
                        model: DocumentInternalClerkDB,
                        required: true,
                    });
                    this.logger.debug('whereOptionDocumentExternalClerk -> ', whereOptionDocumentExternalClerk);

                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        where: {
                            createdAt: {
                                [Op.gte]: `${paginationDTO.startAt} 00:00:00`,
                                [Op.lte]: `${paginationDTO.endAt} 23:59:59`,
                            },
                        },
                        order: [['createdAt', 'DESC']],
                        include: whereOptionDocumentExternalClerk,
                    });
                } else {
                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                attributes: ['id'],
                                model: DocumentRoutingDB,
                                where: option2,
                            },
                            {
                                model: DocumentInternalClerkDB,
                                required: true,
                            },
                        ],
                    });
                }
            } else {
                if (paginationDTO.startAt && paginationDTO.endAt) {
                    whereOptionDocumentExternalClerk.push({
                        attributes: ['id'],
                        model: DocumentRoutingDB,
                        where: option2,
                    });
                    this.logger.debug('whereOptionDocumentExternalClerk -> ', whereOptionDocumentExternalClerk);

                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        where: {
                            createdAt: {
                                [Op.gte]: `${paginationDTO.startAt} 00:00:00`,
                                [Op.lte]: `${paginationDTO.endAt} 23:59:59`,
                            },
                        },
                        order: [['createdAt', 'DESC']],
                        include: whereOptionDocumentExternalClerk,
                    });
                } else {
                    findAllDocument = await this.documentRepository.findAll({
                        attributes: ['id'],
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                attributes: ['id'],
                                model: DocumentRoutingDB,
                                where: option2,
                            },
                        ],
                    });
                }
            }

            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = findAllDocument.length;
            // คำนวณชุดข้อมูล
            const padding = this.paginationService.paginationCal(
                resData.totalItems,
                paginationDTO.perPages,
                paginationDTO.page,
            );

            resData.totalPages = padding.totalPages;

            const arrDocIds = [];
            for (const item of findAllDocument) {
                arrDocIds.push(item.id);
            }
            this.logger.debug('arrDocIds -> ', arrDocIds);
            let _result2: DocumentDB[];
            if (!!option2) {
                if (
                    paginationDTO.isExternal === true &&
                    paginationDTO.isExternal !== null &&
                    paginationDTO.isExternal !== undefined
                ) {
                    this.logger.debug('if result2');

                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        include: [
                            {
                                model: DocumentRoutingDB,
                            },
                            {
                                model: DocumentExternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                required: true,
                            },
                            // {
                            //     model: DocumentInternalClerkDB,
                            //     attributes: { exclude: ['createdAt', 'updatedAt'] },
                            // },
                        ],
                        order: [['createdAt', 'DESC']],
                    });
                } else if (
                    paginationDTO.isExternal === false &&
                    paginationDTO.isExternal !== null &&
                    paginationDTO.isExternal !== undefined
                ) {
                    this.logger.debug('if result2');

                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        include: [
                            {
                                model: DocumentRoutingDB,
                            },
                            // {
                            //     model: DocumentExternalClerkDB,
                            //     attributes: { exclude: ['createdAt', 'updatedAt'] },
                            // },
                            {
                                model: DocumentInternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                required: true,
                            },
                        ],
                        order: [['createdAt', 'DESC']],
                    });
                } else {
                    this.logger.debug('if result2');

                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        include: [
                            {
                                model: DocumentRoutingDB,
                            },
                            {
                                model: DocumentExternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                            },
                            {
                                model: DocumentInternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                            },
                        ],
                        order: [['createdAt', 'DESC']],
                    });
                }
            } else {
                if (
                    paginationDTO.isExternal === true &&
                    paginationDTO.isExternal !== null &&
                    paginationDTO.isExternal !== undefined
                ) {
                    this.logger.debug('else result2');
                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                model: DocumentExternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                required: true,
                            },
                            // {
                            //     model: DocumentInternalClerkDB,
                            //     attributes: { exclude: ['createdAt', 'updatedAt'] },
                            // },
                        ],
                    });
                } else if (
                    paginationDTO.isExternal === false &&
                    paginationDTO.isExternal !== null &&
                    paginationDTO.isExternal !== undefined
                ) {
                    this.logger.debug('else result2');
                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        order: [['createdAt', 'DESC']],
                        include: [
                            // {
                            //     model: DocumentExternalClerkDB,
                            //     attributes: { exclude: ['createdAt', 'updatedAt'] },
                            // },
                            {
                                model: DocumentInternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                required: true,
                            },
                        ],
                    });
                } else {
                    this.logger.debug('else result2');
                    _result2 = await this.documentRepository.findAll({
                        where: {
                            id: {
                                [Op.in]: arrDocIds,
                            },
                            isCancel: false,
                        },
                        offset: padding.skips,
                        limit: padding.limit,
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                model: DocumentExternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                            },
                            {
                                model: DocumentInternalClerkDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                            },
                        ],
                    });
                }
            }

            resData.itemsPerPage = _result2.length;
            // this.logger.debug('_result2 -> ', _result2);
            // user ─────────────────────────────────────────────────────────────────────────────────
            let userIds: string[] = [];
            let agencyId: string[] = [];
            if (_result2.length > 0) {
                for (const iterator of _result2) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }

                    if (iterator.agencyId) {
                        agencyId.push(iterator.agencyId);
                    }
                }
            }

            userIds = [...new Set(userIds)];
            agencyId = [...new Set(agencyId)];

            const resultUser = await this.userService.findAll_by_ids(userIds, ['id', 'firstName', 'lastName']);
            const resultAgency = await this.agencyService.findAll_by_ids(agencyId, ['id', 'agencyName']);
            const arrIdRecipients = [];
            for (const item of _result2) {
                for (const item2 of item.documentRoutingLists) {
                    arrIdRecipients.push(item2.agencyIdRecipient);
                }
            }
            const uniqArrIdRecipients = [...new Set(arrIdRecipients)];
            const namesAgency = await this.agencyDBRepository.findAll({
                attributes: ['id', 'agencyName'],
                where: {
                    id: uniqArrIdRecipients,
                },
            });
            // this.logger.debug('_result2 -> ', _result2);
            return new DocumentPaginationResDTOV2(
                ResStatus.success,
                '',
                _result2,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
                resultUser,
                resultAgency,
                namesAgency,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────
    async paginationDocumentSummary(
        user: UserDB,
        paginationDTO: DocumentSummaryPaginationDTO,
    ): Promise<DocumentPaginationResDTO> {
        const tag = this.paginationDocumentSummary.name;
        try {
            let _agencyId = paginationDTO.agencyId;

            if (user.role !== UserDBRole.superAdmin) {
                const result = await this.agencyService.findOne_by_userId(user.id);
                _agencyId = result.id;
            }

            const _startAt = moment(paginationDTO.startAt).format('YYYY-MM-DD 00:00:00');
            const _endAt = moment(paginationDTO.endAt).format('YYYY-MM-DD 23:59:59');

            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };

            const findOption: FindOptions<DocumentDB> = {
                where: {
                    createdAt: {
                        [Op.gte]: _startAt,
                        [Op.lte]: _endAt,
                    },
                    agencyId: _agencyId,
                    isCancel: false,
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: {
                                [Op.in]: paginationDTO.status,
                            },
                        },
                    },
                ],
            };

            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.documentRepository.count(findOption);

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

            const _result = await this.documentRepository.findAll(findOption);

            resData.itemsPerPage = _result.length;

            // user ─────────────────────────────────────────────────────────────────────────────────
            const userIds: string[] = [];
            const agencyId: string[] = [];
            if (_result.length > 0) {
                for (const iterator of _result) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }

                    if (iterator.agencyId) {
                        agencyId.push(iterator.agencyId);
                    }
                }
            }

            const resultUser = await this.userService.findAll_by_ids(userIds);
            const resultAgency = await this.agencyService.findAll_by_ids(userIds);

            return new DocumentPaginationResDTO(
                ResStatus.success,
                '',
                _result,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
                resultUser,
                resultAgency,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // ────────────────────────────────────────────────────────────────────────────────
    async paginationDocumentIn(
        user: UserDB,
        paginationDTO: DocumentInPaginationDTO,
    ): Promise<DocumentPaginationResDTOV2> {
        const tag = this.paginationDocumentIn.name;
        try {
            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };
            const _startAt = moment(paginationDTO.startAt).format('YYYY-MM-DD 00:00:00');
            const _endAt = moment(paginationDTO.endAt).format('YYYY-MM-DD 23:59:59');

            const agencyId = paginationDTO.agencyId;

            if (paginationDTO.status.length === 0) {
                throw new Error('status length 0');
            }

            let option1 = {};
            if (paginationDTO.isCheckAgencyIdRecipient) {
                option1 = {
                    agencyIdRecipient: agencyId,
                };
            }

            if (paginationDTO.isCheckAgencyIdSender) {
                option1 = {
                    agencyIdSender: agencyId,
                };
            }
            // success = 'success',
            // unsuccessful = 'unsuccessful',
            // processing = 'processing',
            // receive = 'receive',
            // sendOut = 'sendOut',
            // reject = 'reject',
            // create = 'create',
            // noEvent = 'noEvent',
            let whereCondition: FindOptions<DocumentDB> = {
                attributes: ['id'],
                where: {
                    // status: {
                    //     [Op.or]: paginationDTO.status,
                    // },
                    createdAt: {
                        [Op.gte]: _startAt,
                        [Op.lte]: _endAt,
                    },
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: {
                                [Op.or]: paginationDTO.status,
                            },
                        },
                        include: [
                            {
                                attributes: ['createdAt', 'agencyIdRecipient', 'agencyIdSender', 'status'],
                                model: DocHistoryDB,
                                required: true,
                                where: option1,
                            },
                            {
                                model: AgencyDB,
                                as: 'agencyRecipient',
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                include: [
                                    {
                                        model: AgencySecondaryDB,
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            if (paginationDTO.isReceiveDocument) {
                if (paginationDTO.isCheckApprove === true) {
                    const findAgencyIdByUserId = await this.userAgencyRepository.findOne({
                        where: {
                            userId: user.id,
                        },
                    });
                    this.logger.debug('findAgencyIdByUserId -> ', findAgencyIdByUserId);
                    whereCondition = {
                        attributes: ['id'],
                        where: {
                            // status: {
                            //     [Op.or]: paginationDTO.status,
                            // },
                            createdAt: {
                                [Op.gte]: _startAt,
                                [Op.lte]: _endAt,
                            },
                        },
                        include: [
                            {
                                model: DocumentRoutingDB,
                                where: {
                                    agencyIdRecipient: findAgencyIdByUserId.agencyId,
                                    agencySecondaryIdRecipient: findAgencyIdByUserId.agencySecondaryId
                                        ? findAgencyIdByUserId.agencySecondaryId
                                        : null,
                                    status: DocHistoryDBStatus.sendOut,
                                },
                                include: [
                                    {
                                        attributes: ['createdAt', 'agencyIdRecipient', 'agencyIdSender', 'status'],
                                        model: DocHistoryDB,
                                        required: true,
                                        where: option1,
                                    },
                                    {
                                        model: AgencyDB,
                                        as: 'agencyRecipient',
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        include: [
                                            {
                                                model: AgencySecondaryDB,
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                model: DocumentApproveDB,
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                            },
                        ],
                    };
                } else {
                    const findAgencyIdByUserId = await this.userAgencyRepository.findOne({
                        where: {
                            userId: user.id,
                        },
                    });
                    this.logger.debug('findAgencyIdByUserId -> ', findAgencyIdByUserId);
                    whereCondition = {
                        attributes: ['id'],
                        where: {
                            // status: {
                            //     [Op.or]: paginationDTO.status,
                            // },
                            createdAt: {
                                [Op.gte]: _startAt,
                                [Op.lte]: _endAt,
                            },
                        },
                        include: [
                            {
                                model: DocumentRoutingDB,
                                where: {
                                    agencyIdRecipient: findAgencyIdByUserId.agencyId,
                                    agencySecondaryIdRecipient: findAgencyIdByUserId.agencySecondaryId
                                        ? findAgencyIdByUserId.agencySecondaryId
                                        : null,
                                    status: DocHistoryDBStatus.sendOut,
                                },
                                include: [
                                    {
                                        attributes: ['createdAt', 'agencyIdRecipient', 'agencyIdSender', 'status'],
                                        model: DocHistoryDB,
                                        required: true,
                                        where: option1,
                                    },
                                    {
                                        model: AgencyDB,
                                        as: 'agencyRecipient',
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        include: [
                                            {
                                                model: AgencySecondaryDB,
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    };
                }
            } else {
                whereCondition = whereCondition;
            }

            // if (paginationDTO.isCheckApprove === true) {
            //     // approve true
            //     whereCondition = {
            //         attributes: ['id'],
            //         where: {
            //             // status: {
            //             //     [Op.or]: paginationDTO.status,
            //             // },
            //             createdAt: {
            //                 [Op.gte]: _startAt,
            //                 [Op.lte]: _endAt,
            //             },
            //         },
            //         include: [
            //             {
            //                 model: DocumentRoutingDB,
            //                 include: [
            //                     {
            //                         attributes: ['createdAt', 'agencyIdRecipient', 'agencyIdSender', 'status'],
            //                         model: DocHistoryDB,
            //                         required: true,
            //                         where: option1,
            //                     },
            //                 ],
            //             },
            //             {
            //                 model: DocumentApproveDB,
            //                 attributes: { exclude: ['createdAt', 'updatedAt'] },
            //             },
            //         ],
            //     };
            // }
            const results = await this.documentRepository.findAll(whereCondition);
            let docIds: string[] = [];
            this.logger.debug('results -> ', results);

            if (results) {
                let isFind = false;
                let isStatusMatch = false;

                const isCheckLast = (status: DocHistoryDBStatus) => {
                    return paginationDTO.status.some((x) => x === status);
                };

                const isSome = (docHis: DocHistoryDB[]) => {
                    return paginationDTO.status.some((x) => {
                        return docHis.some((x2) => x === x2.status);
                    });
                };

                for (const iterator of results) {
                    for (const iterator2 of iterator.documentRoutingLists) {
                        if (iterator2.docHistoryLists.length === 0) continue;

                        iterator2.docHistoryLists.sort(
                            (a, b) => Date.parse(`${a.createdAt}`) - Date.parse(`${b.createdAt}`),
                        );

                        const lastData = iterator2.docHistoryLists[iterator2.docHistoryLists.length - 1];
                        this.logger.debug('condition -> ', paginationDTO);

                        if (paginationDTO.isCheckAgencyIdRecipient) {
                            if (paginationDTO.isAgencyCheckLast) {
                                isStatusMatch = isCheckLast(lastData.status);
                                isFind = lastData.agencyIdRecipient === agencyId;
                            } else {
                                isStatusMatch = isSome(iterator2.docHistoryLists);
                                isFind = iterator2.docHistoryLists.some((x) => x.agencyIdRecipient === agencyId);
                            }
                            if (isFind && isStatusMatch) docIds.push(iterator.id);
                        }
                        this.logger.debug('isStatusMatch -> ', isStatusMatch);

                        if (paginationDTO.isCheckAgencyIdSender) {
                            if (paginationDTO.isAgencyCheckLast) {
                                isStatusMatch = isCheckLast(lastData.status);
                                isFind = lastData.agencyIdSender === agencyId;
                            } else {
                                this.logger.debug(`${tag} -> docHistoryLists : `, iterator2.docHistoryLists);

                                isStatusMatch = isSome(iterator2.docHistoryLists);
                                isFind = iterator2.docHistoryLists.some((x) => x.agencyIdSender === agencyId);
                            }
                            this.logger.debug(`${tag} -> isStatusMatch : `, isStatusMatch);
                            this.logger.debug(`${tag} -> isFind : `, isFind);
                            if (isFind && isStatusMatch) docIds.push(iterator.id);
                        }
                    }
                }
            }

            docIds = [...new Set(docIds)];
            this.logger.debug('docIds -> ', docIds);
            if (docIds.length === 0) {
                return new DocumentPaginationResDTOV2(
                    ResStatus.success,
                    '',
                    [],
                    resData.totalItems,
                    resData.itemsPerPage,
                    resData.totalPages,
                    resData.currentPage,
                    null,
                    null,
                );
            }

            const findOption: FindOptions<DocumentDB> = {
                where: {
                    id: {
                        [Op.in]: docIds,
                    },
                },
                // include: [
                //     {
                //         model: DocumentRoutingDB,
                //         include: [
                //             {
                //                 model: DocHistoryDB,
                //                 include: [
                //                     {
                //                         attributes: { exclude: ['createdAt', 'updatedAt'] },
                //                         model: AgencyDB,
                //                         as: 'agencySender',
                //                     },
                //                     {
                //                         attributes: { exclude: ['createdAt', 'updatedAt'] },
                //                         model: AgencyDB,
                //                         as: 'agencyRecipient',
                //                     },
                //                 ],
                //             },
                //         ],
                //     },
                // ],
            };
            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.documentRepository.count(findOption);
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

            const _result = await this.documentRepository.findAll(findOption);
            const arrDocIds = [];
            for (const item of _result) {
                arrDocIds.push(item.id);
            }
            const _result2 = await this.documentRepository.findAll({
                where: {
                    id: {
                        [Op.in]: arrDocIds,
                    },
                    isCancel: false,
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: DocumentRoutingDB,
                        include: [
                            {
                                model: DocHistoryDB,
                                include: [
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencySender',
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencyRecipient',
                                    },
                                ],
                            },
                            {
                                model: AgencyDB,
                                as: 'agencyRecipient',
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                include: [
                                    {
                                        model: AgencySecondaryDB,
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            this.logger.debug('_result -> ', _result);
            resData.itemsPerPage = _result2.length;
            // user ─────────────────────────────────────────────────────────────────────────────────
            const userIds: string[] = [];
            const agencyIds: string[] = [];
            if (_result2.length > 0) {
                for (const iterator of _result2) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }
                    if (iterator.agencyId) {
                        agencyIds.push(iterator.agencyId);
                    }
                }
            }
            const resultUser = await this.userService.findAll_by_ids(userIds);
            const resultAgency = await this.agencyService.findAll_by_ids(userIds);
            return new DocumentPaginationResDTOV2(
                ResStatus.success,
                '',
                _result2,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
                resultUser,
                resultAgency,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async update(user: UserDB, _id: string, body: UpdateDocumentDto) {
        const tag = this.update.name;
        const _t = await this.sequelizes.transaction();
        try {
            const documentUpdate = await this.documentRepository.findOne({
                where: {
                    id: _id,
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                    },
                ],
            });
            if (!documentUpdate) throw new Error('not found.');
            let isEdit;
            for (const item of documentUpdate.documentRoutingLists) {
                if (item.status !== DocHistoryDBStatus.create) {
                    isEdit = false;
                } else {
                    isEdit = true;
                }
            }
            if (isEdit) {
                documentUpdate.name = body.name;
                documentUpdate.priority = body.priority;
                documentUpdate.documentType = body.documentType;
                documentUpdate.detail = body.detail;
                documentUpdate.governmentDocNo = body.governmentDocNo;
                documentUpdate.formDoc = body.formDoc;
                documentUpdate.toDoc = body.toDoc;
                documentUpdate.externalDate = body.externalDate;
                await documentUpdate.save({ transaction: _t });
                const findAllFiles = await this.docFileDBRepository.findAll({
                    where: {
                        documentId: documentUpdate.id
                    }
                })
                const arrFiles = []
                for (const item of findAllFiles) {
                    arrFiles.push(item.fileName)
                }


                const isFindRouterFromBody = (
                    _agencySender: string,
                    _agencySecondarySender: string,
                    _agencyIdRecipient: string,
                    _agencySecondaryIdRecipient: string,
                ) => {
                    _agencySender = _agencySender ? _agencySender : null;
                    _agencySecondarySender = _agencySecondarySender ? _agencySecondarySender : null;
                    _agencyIdRecipient = _agencyIdRecipient ? _agencyIdRecipient : null;
                    _agencySecondaryIdRecipient = _agencySecondaryIdRecipient ? _agencySecondaryIdRecipient : null;
                    for (const iterator of body.recipients) {
                        if (
                            body.sender.agencyIdSender === _agencySender &&
                            body.sender.agencySecondarySender === _agencySecondarySender &&
                            iterator.agencyIdRecipient === _agencyIdRecipient &&
                            iterator.agencySecondaryIdRecipient === _agencySecondaryIdRecipient
                        ) {
                            return true;
                        }
                    }

                    return false;
                };

                const isFindRouterFormDB = (
                    _agencySender: string,
                    _agencySecondarySender: string,
                    _agencyIdRecipient: string,
                    _agencySecondaryIdRecipient: string,
                ) => {
                    _agencySender = _agencySender ? _agencySender : null;
                    _agencySecondarySender = _agencySecondarySender ? _agencySecondarySender : null;
                    _agencyIdRecipient = _agencyIdRecipient ? _agencyIdRecipient : null;
                    _agencySecondaryIdRecipient = _agencySecondaryIdRecipient ? _agencySecondaryIdRecipient : null;
                    for (const iterator of documentUpdate.documentRoutingLists) {
                        if (
                            body.sender.agencyIdSender === _agencySender &&
                            body.sender.agencySecondarySender === _agencySecondarySender &&
                            iterator.agencyIdRecipient === _agencyIdRecipient &&
                            iterator.agencySecondaryIdRecipient === _agencySecondaryIdRecipient
                        ) {
                            return true;
                        }
                    }

                    return false;
                };
                // ตรวจสอบ ข้อมูล จาก DB
                if (!!documentUpdate.documentRoutingLists && documentUpdate.documentRoutingLists.length > 0) {
                    for (const iterator of documentUpdate.documentRoutingLists) {
                        const isCheck = isFindRouterFromBody(
                            iterator.agencyIdSender,
                            iterator.agencySecondaryIdSender,
                            iterator.agencyIdRecipient,
                            iterator.agencySecondaryIdRecipient,
                        );
                        if (!isCheck) {
                            await iterator.destroy({ transaction: _t });
                        }
                    }
                }

                // ตรวจสอบข้อมูลใน db กับ body ว่ามีมั้ย ถ้าไม่มีให้เพิ่มข้อมููลเข้าไปใหม่
                const arr = [];
                if (!!body.recipients && body.recipients.length > 0) {
                    for (const item of body.recipients) {
                        const isCheck = isFindRouterFormDB(
                            body.sender.agencyIdSender,
                            body.sender.agencySecondarySender,
                            item.agencyIdRecipient,
                            item.agencySecondaryIdRecipient,
                        );
                        this.logger.debug('iterator -> ', item);
                        if (!isCheck) {
                            this.logger.debug('isCheck -> ', isCheck);
                            const createNewRouting = new DocumentRoutingDB();
                            createNewRouting.agencyIdRecipient = item.agencyIdRecipient;
                            createNewRouting.agencySecondaryIdRecipient = item.agencySecondaryIdRecipient;
                            createNewRouting.agencyIdSender = body.sender.agencyIdSender;
                            createNewRouting.agencySecondaryIdSender = body.sender.agencySecondarySender;
                            createNewRouting.status = DocHistoryDBStatus.create;
                            createNewRouting.documentId = _id;
                            createNewRouting.isSuccess = false;
                            await createNewRouting.save({ transaction: _t ? _t : null });
                            const createNewHistory = new DocHistoryDB();
                            createNewHistory.agencyIdRecipient = item.agencyIdRecipient;
                            createNewHistory.agencySecondaryIdRecipient = item.agencySecondaryIdRecipient;
                            createNewHistory.agencyIdSender = body.sender.agencyIdSender;
                            createNewHistory.agencySecondaryIdSender = body.sender.agencySecondarySender;
                            createNewHistory.comment = '';
                            createNewHistory.status = DocHistoryDBStatus.create;
                            createNewHistory.documentRoutingId = createNewRouting.id;
                            createNewHistory.userId = user.id;
                            createNewHistory.isAcceptAndReturn = false;
                            await createNewHistory.save({ transaction: _t ? _t : null });
                        }
                    }
                }
                this.logger.debug('arr -> ', arr);

                const newLogBefore = new LogBeforeDB();
                newLogBefore.name = documentUpdate.name;
                newLogBefore.detail = documentUpdate.detail;
                newLogBefore.governmentDocNo = documentUpdate.governmentDocNo;
                newLogBefore.docNo = documentUpdate.docNo;
                newLogBefore.formDoc = documentUpdate.formDoc;
                newLogBefore.toDoc = documentUpdate.toDoc;
                newLogBefore.priority = documentUpdate.priority;
                newLogBefore.barcode = documentUpdate.barcode;
                newLogBefore.documentType = documentUpdate.documentType;
                newLogBefore.isCancel = documentUpdate.isCancel;
                newLogBefore.isExternal = documentUpdate.isExternal;
                newLogBefore.externalAgencyName = documentUpdate.externalAgencyName;
                newLogBefore.externalDate = documentUpdate.externalDate;
                newLogBefore.documentId = documentUpdate.id;
                newLogBefore.userId = user.id;
                newLogBefore.files = JSON.stringify(arrFiles);
                await newLogBefore.save({ transaction: _t });
                await _t.commit();
            } else {
                throw new HttpException(`cannot edit cuz routing status not create`, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return await this.findOne(_id);
        } catch (error) {
            await _t.rollback();
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async findOne(id: string) {
        const tag = this.findOne.name;
        try {
            const result = await this.documentRepository.findByPk(id);

            if (!result) {
                throw new Error('ไม่มีข้อมูล');
            }

            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async remove(_id: string) {
        const tag = this.remove.name;
        try {
            // const result = await this.documentRepository.destroy({
            //     where: {
            //         id: _id,
            //     },
            // });
            const result = await this.documentRepository.findByPk(_id);
            result.isCancel = true;
            await result.save();
            return result;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // ────────────────────────────────────────────────────────────────────────────────

    async summary(body: SummaryDocumentDTOReq) {
        const tag = this.summary.name;
        try {
            //
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async findOneDocument(documentId: string) {
        const tag = this.findOneDocument.name;
        try {
            const findDocument = await this.documentRepository.findOne({
                where: {
                    [Op.or]: [
                        {
                            id: documentId,
                        },
                        {
                            barcode: documentId,
                        },
                        {
                            governmentDocNo: documentId,
                        },
                    ],
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                        include: [
                            {
                                model: AgencyDB,
                                as: 'agencyRecipient',
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                include: [
                                    {
                                        model: AgencySecondaryDB,
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    },
                                ],
                            },
                            {
                                model: AgencyDB,
                                as: 'agencySender',
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                include: [
                                    {
                                        model: AgencySecondaryDB,
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    },
                                ],
                            },
                            {
                                attributes: { exclude: ['agencyIdSender', 'agencyIdRecipient'] },

                                model: DocHistoryDB,
                                include: [
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencySender',
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencyRecipient',
                                    },
                                    {
                                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                                        model: UserDB,
                                        include: [
                                            {
                                                model: UserAgencyDB,
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                include: [
                                                    {
                                                        model: AgencyDB,
                                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                        include: [
                                                            {
                                                                model: AgencySecondaryDB,
                                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencySecondaryDB,
                                        as: 'agencySecondarySender',
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencySecondaryDB,
                                        as: 'agencySecondaryRecipient',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        attributes: {
                            exclude: ['agencyId', 'userId', 'documentId', 'createdAt', 'updatedAt'],
                        },
                        model: DocumentApproveDB,
                        include: [
                            {
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                model: AgencyDB,
                            },
                            {
                                attributes: ['id', 'firstName', 'lastName'],
                                model: UserDB,
                            },
                        ],
                    },

                    {
                        model: DocFileDB,
                    },
                    {
                        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                        model: UserDB,
                    },
                ],
            });
            if (findDocument.documentRoutingLists && findDocument.documentRoutingLists.length > 0) {
                for (const item of findDocument.documentRoutingLists) {
                    item.docHistoryLists.sort((a, b) => Date.parse(`${b.createdAt}`) - Date.parse(`${a.createdAt}`));
                }
            }
            this.logger.debug('findDocument -> ', findDocument);
            // if (findDocument) {
            //     findDocument.docHistoryLists.sort(
            //         (a, b) => Date.parse(`${a.createdAt}`) - Date.parse(`${b.createdAt}`),
            //     );
            // }
            return findDocument;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countByStatus_by_date(
        _agencyId: string,
        docHistoryDBStatus: DocHistoryDBStatus,
        startAt: string,
        endAt: string,
    ) {
        const tag = this.countByStatus_by_date.name;
        try {
            const _startAt = moment(startAt).format('YYYY-MM-DD 00:00:00');
            const _endAt = moment(endAt).format('YYYY-MM-DD 23:59:59');
            return await this.documentRepository.count({
                where: {
                    createdAt: {
                        [Op.gte]: _startAt,
                        [Op.lte]: _endAt,
                    },
                    agencyId: _agencyId,
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: docHistoryDBStatus,
                        },
                    },
                ],
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countByStatus_by_date2(_agencyId: string, startAt: string, endAt: string) {
        const tag = this.countByStatus_by_date2.name;
        try {
            const _startAt = moment(startAt).format('YYYY-MM-DD 00:00:00');
            const _endAt = moment(endAt).format('YYYY-MM-DD 23:59:59');
            return await this.documentRepository.findAll({
                attributes: [
                    [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
                    [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                    [sequelize.fn('DAY', sequelize.col('createdAt')), 'day'],
                    // 'status',
                ],
                where: {
                    // status: docHistoryDBStatus,
                    createdAt: {
                        [Op.gte]: _startAt,
                        [Op.lte]: _endAt,
                    },
                    agencyId: _agencyId,
                },
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fakeDoc() {
        const tag = this.create.name;
        try {
            for (let index = 0; index < 50; index++) {
                const _document = new DocumentDB();
                _document.name = faker.word.adjective();
                _document.priority = EnumPriorityDocumentDB.very_urgent;
                _document.barcode = new Date().getTime().toString();
                _document.documentType = EnumDocTypeDocumentDB.external;
                _document.userId = '37ec3e7e-17f6-4ed3-aa7e-aeddfa7dd040';
                _document.agencyId = 'ab3de1a6-1d0a-4dc5-83ba-b853e929e59e';
                _document.detail = faker.lorem.paragraph(1);
                _document.governmentDocNo = faker.random.locale();
                await _document.save();
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async autoGenDocNoExternal() {
        const tag = this.autoGenDocNoExternal.name;
        try {
            const startOfYear = moment().startOf('year').format('YYYY-MM-DD 00:00:00');
            const endOfYear = moment().endOf('year').format('YYYY-MM-DD 23:59:59');
            const lastDocNo = await this.docExternalDBRepository.findOne({
                where: {
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lte]: endOfYear,
                    },
                },
                order: [['docNo', 'DESC'], ['createdAt', 'DESC']],
            });
            this.logger.debug('startOfYear -> ', startOfYear)
            this.logger.debug('endOfYear -> ', endOfYear)
            this.logger.debug('lastDocNo -> ', lastDocNo)
            return !lastDocNo ? 0 : Number(lastDocNo.docNo) + 1;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async autoGenDocNoInternal() {
        const tag = this.autoGenDocNoInternal.name;
        try {
            const startOfYear = moment().startOf('year').format('YYYY-MM-DD 00:00:00');
            const endOfYear = moment().endOf('year').format('YYYY-MM-DD 23:59:59');
            const lastDocNo = await this.docInternalDBRepository.findOne({
                where: {
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lte]: endOfYear,
                    },
                },
                order: [['docNo', 'DESC'], ['createdAt', 'DESC']],
            });
            return !lastDocNo ? 0 : Number(lastDocNo.docNo) + 1;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async autoGenDocNo() {
        const tag = this.autoGenDocNo.name;
        try {
            const startOfYear = moment().startOf('year').format('YYYY-MM-DD 00:00:00');
            const endOfYear = moment().endOf('year').format('YYYY-MM-DD 23:59:59');

            const lastDocument = await this.documentRepository.findOne({
                where: {
                    createdAt: {
                        [Op.gte]: startOfYear,
                        [Op.lte]: endOfYear,
                    },
                },
                order: [['createdAt', 'DESC']],
            });

            return !lastDocument ? 0 : Number(lastDocument.docNo) + 1;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOneDocumentArray(user: UserDB, ids: string) {
        const tag = this.findOneDocumentArray.name;
        try {
            const arrIdDoc = ids.split(',');
            const findDocumentArray = await this.documentRepository.findAll({
                where: {
                    id: arrIdDoc,
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                    },
                ],
                order: [['docNo', 'DESC']],
            });
            return findDocumentArray;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async findOneDocumentByStatus(documentId: string, _status: string) {
        const tag = this.findOneDocumentByStatus.name;
        try {
            this.logger.debug(`${tag} _status -> `, _status);
            const findDocument = await this.documentRepository.findOne({
                where: {
                    [Op.or]: [
                        {
                            id: documentId,
                        },
                        {
                            barcode: documentId,
                        },
                        {
                            governmentDocNo: documentId,
                        },
                    ],
                },
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: _status,
                        },
                        include: [
                            {
                                attributes: { exclude: ['agencyIdSender', 'agencyIdRecipient'] },

                                model: DocHistoryDB,
                                include: [
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencySender',
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencyDB,
                                        as: 'agencyRecipient',
                                    },
                                    {
                                        attributes: ['id', 'firstName', 'lastName'],
                                        model: UserDB,
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencySecondaryDB,
                                        as: 'agencySecondarySender',
                                    },
                                    {
                                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        model: AgencySecondaryDB,
                                        as: 'agencySecondaryRecipient',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        attributes: {
                            exclude: ['agencyId', 'userId', 'documentId', 'createdAt', 'updatedAt'],
                        },
                        model: DocumentApproveDB,
                        include: [
                            {
                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                model: AgencyDB,
                            },
                            {
                                attributes: ['id', 'firstName', 'lastName'],
                                model: UserDB,
                            },
                        ],
                    },

                    {
                        model: DocFileDB,
                    },
                    {
                        attributes: ['id', 'firstName', 'lastName'],
                        model: UserDB,
                    },
                ],
            });
            if (findDocument) {
                this.logger.debug('in if condition');
                for (const item of findDocument.documentRoutingLists) {
                    item.docHistoryLists.sort((a, b) => Date.parse(`${a.createdAt}`) - Date.parse(`${b.createdAt}`));
                }
            }

            // if (findDocument) {
            //     findDocument.docHistoryLists.sort(
            //         (a, b) => Date.parse(`${a.createdAt}`) - Date.parse(`${b.createdAt}`),
            //     );
            // }

            this.logger.debug(`${tag} result ->`, findDocument);
            return findDocument;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paginationSearchDocument(
        user: UserDB,
        paginationDTO: PaginationSearchDocumentDTO,
        agency: string,
        agencySecondary: string,
    ) {
        const tag = this.paginationSearchDocument.name;
        try {
            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
                datas: [],
            };
            const option: WhereOptions = {};
            if (agencySecondary && agency) {
                Object.assign(option, { agencySecondaryIdSender: agencySecondary });
                Object.assign(option, { agencyIdSender: agency });
            } else if (agency) {
                Object.assign(option, { agencyIdSender: agency });
            }
            // isSearch
            const option2: WhereOptions = {};
            // let _dataLike;
            if (paginationDTO.search) {
                const searchArr = paginationDTO.search.split(',');
                this.logger.debug('searchArr -> ', searchArr);
                Object.assign(option2, {
                    [Op.or]: [
                        {
                            governmentDocNo: searchArr,
                        },
                        {
                            name: searchArr,
                        },
                        {
                            docNo: searchArr,
                        },
                    ],
                });

                // option2 = {
                //     [Op.or]: [
                //         {
                //             governmentDocNo: paginationDTO.search,
                //         },
                //         {
                //             name: paginationDTO.search,
                //         },
                //         {
                //             docNo: paginationDTO.search,
                //         },
                //     ],

                // };

                // const dataLike = this.paginationService.genSqlLike(['governmentDocNo'], paginationDTO.search);
                // if (dataLike) {
                //     // findOption = Object.assign.(findOption, dataLike);
                //     this.logger.debug('dataLike -> ', dataLike);
                //     this.logger.debug('paginationDTO.search -> ', paginationDTO.search);
                //     // Object.assign(option2, dataLike);
                //     _dataLike = dataLike;
                //     // findAllDocument = Object.assign(findAllDocument, dataLike);
                // }
            }
            this.logger.debug('option2 -> ', option2);
            this.logger.debug('paginationDTO.search -> ', paginationDTO.search);
            // let findOption: FindOptions;
            let findAllDocument: DocumentDB[];
            if (paginationDTO.startAt && paginationDTO.endAt) {
                if (!!option) {
                    findAllDocument = await this.documentRepository.findAll({
                        order: [['createdAt', 'DESC']],
                        where: {
                            [Op.and]: [
                                {
                                    createdAt: {
                                        [Op.gte]: `${paginationDTO.startAt} 00:00:00`,
                                        [Op.lte]: `${paginationDTO.endAt} 23:59:59`,
                                    },
                                },
                                option2,
                            ],
                        },
                        include: [
                            {
                                model: UserDB,
                                attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                            },
                            {
                                model: DocumentRoutingDB,
                                where: option,
                            },
                        ],
                    });
                    // findOption = {};
                } else {
                    findAllDocument = await this.documentRepository.findAll({
                        order: [['createdAt', 'DESC']],
                        where: {
                            [Op.and]: [
                                {
                                    createdAt: {
                                        [Op.gte]: `${paginationDTO.startAt} 00:00:00`,
                                        [Op.lte]: `${paginationDTO.endAt} 23:59:59`,
                                    },
                                },
                                option2,
                            ],
                        },
                        include: [
                            {
                                model: UserDB,
                                attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                            },
                            {
                                model: DocumentRoutingDB,
                                // where: option
                            },
                        ],
                    });
                    // findOption = {};
                }
            } else {
                if (!!option) {
                    findAllDocument = await this.documentRepository.findAll({
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                model: UserDB,
                                attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                            },
                            {
                                model: DocumentRoutingDB,
                                where: option,
                            },
                        ],
                    });
                    // findOption = {};
                } else {
                    findAllDocument = await this.documentRepository.findAll({
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                model: UserDB,
                                attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
                            },
                            {
                                model: DocumentRoutingDB,
                                // where: option
                            },
                        ],
                    });
                    // findOption = {};
                }
            }
            this.logger.debug('findAllDocument -> ', findAllDocument);
            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            // resData.totalItems = await this.documentRepository.count(findOption);
            resData.totalItems = findAllDocument.length;

            // คำนวณชุดข้อมูล
            const padding = this.paginationService.paginationCal(
                resData.totalItems,
                paginationDTO.perPages,
                paginationDTO.page,
            );

            // Object.assign(findOption, { order: [['createdAt', 'DESC']] });

            resData.totalPages = padding.totalPages;

            // Object.assign(findOption, { offset: padding.skips });
            // Object.assign(findOption, { limit: padding.limit });

            // const _result = await this.documentRepository.findAll(findOption);
            // resData.itemsPerPage = _result.length;

            resData.datas = findAllDocument;
            const userIds: any[] = [];
            if (findAllDocument.length > 0) {
                for (const iterator of findAllDocument) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }
                }
            }
            const resultUser = await this.userService.findAll_by_ids(userIds);
            const arrDocIds = [];
            for (const item of findAllDocument) {
                arrDocIds.push(item.id);
            }
            // this.logger.debug('_dataLike -> ', _dataLike);
            let _result2: DocumentDB[];
            if (!!option) {
                _result2 = await this.documentRepository.findAll({
                    where: {
                        id: {
                            [Op.in]: arrDocIds,
                        },
                        // governmentDocNo: {
                        //     like: _dataLike,
                        // },
                    },
                    include: [
                        {
                            model: DocumentRoutingDB,
                            where: option,
                        },
                    ],
                    limit: padding.limit,
                    offset: padding.skips,
                });
            } else {
                _result2 = await this.documentRepository.findAll({
                    where: {
                        id: {
                            [Op.in]: arrDocIds,
                        },
                        // governmentDocNo: {
                        //     like: _dataLike,
                        // },
                    },
                    include: [
                        {
                            model: DocumentRoutingDB,
                        },
                    ],
                    limit: padding.limit,
                    offset: padding.skips,
                });
            }
            resData.itemsPerPage = _result2.length;

            // return resData;
            return new PaginationSearchDocumentResDTO(
                ResStatus.success,
                '',
                _result2,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
                resultUser,
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    async forwardOrReturnDocument(user: UserDB, body: CreateForwardOrReturnDocumentDtoReq[]) {
        const tag = this.forwardOrReturnDocument.name;
        try {
            //
            const res = {
                resCode: ResStatus.success,
                resData: {},
                msg: '',
            };
            for (const item of body) {
                // case 1 forward document use same function
                // case 2 return document use same function
                const findDocumentRouting = await this.docRoutingRepository.findOne({
                    where: {
                        id: item.documentRoutingId,
                    },
                });
                console.log('findDocumentRouting -> ', JSON.parse(JSON.stringify(findDocumentRouting)));
                const _newDocumentForward = new DocumentRoutingDB();
                _newDocumentForward.routingTrackNumber = findDocumentRouting.routingTrackNumber;
                _newDocumentForward.isSuccess = false;
                _newDocumentForward.status = DocHistoryDBStatus.sendOut;
                _newDocumentForward.documentId = item.documentId;
                _newDocumentForward.agencyIdSender = item.agencyIdSender ? item.agencyIdSender : null;
                _newDocumentForward.agencySecondaryIdSender = item.agencySecondaryIdSender
                    ? item.agencySecondaryIdSender
                    : null;
                _newDocumentForward.agencyIdRecipient = item.agencyIdRecipient ? item.agencyIdRecipient : null;
                _newDocumentForward.agencySecondaryIdRecipient = item.agencySecondaryIdRecipient
                    ? item.agencySecondaryIdRecipient
                    : null;
                await _newDocumentForward.save();
                const _newHistory = new DocHistoryDB();
                _newHistory.status = DocHistoryDBStatus.sendOut;
                _newHistory.comment = item.comment;
                _newHistory.documentRoutingId = _newDocumentForward.id;
                _newHistory.userId = user.id;
                _newHistory.agencyIdSender = item.agencyIdSender ? item.agencyIdSender : null;
                _newHistory.agencyIdRecipient = item.agencyIdRecipient ? item.agencyIdRecipient : null;
                _newHistory.agencySecondaryIdSender = item.agencySecondaryIdSender
                    ? item.agencySecondaryIdSender
                    : null;
                _newHistory.agencySecondaryIdRecipient = item.agencySecondaryIdRecipient
                    ? item.agencySecondaryIdRecipient
                    : null;
                _newHistory.isAcceptAndReturn = false;
                await _newHistory.save();

                res.resData = Object.assign(res.resData, { newDocumentForward: _newDocumentForward });
                res.resData = Object.assign(res.resData, { newHistory: _newHistory });
            }
            return res;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    async archiveDocument(paginationDTO: ArchiveDocumentPaginationDTO, user: UserDB) {
        const tag = this.archiveDocument.name;
        try {
            const findUserDetail = await this.userAgencyRepository.findOne({
                include: [
                    {
                        model: UserDB,
                        where: {
                            id: user.id,
                        },
                    },
                ],
            });

            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
                datas: [],
            };
            let findOption: FindOptions = {
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: DocHistoryDBStatus.receive,
                            isSuccess: true,
                            agencyIdRecipient: findUserDetail.agencyId,
                            agencySecondaryIdRecipient: findUserDetail.agencySecondaryId
                                ? findUserDetail.agencySecondaryId
                                : null,
                        },
                    },
                ],
            };
            // isSearch
            if (paginationDTO.search) {
                const dataLike = this.paginationService.genSqlLike(['governmentDocNo', 'name'], paginationDTO.search);
                if (dataLike) {
                    findOption = Object.assign(findOption, dataLike);
                }
            }
            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.documentRepository.count(findOption);

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

            // return findUserDetail;

            // const result = await this.documentRepository.findAll({
            //     include: [
            //         {
            //             model: DocumentRoutingDB,
            //             where: {
            //                 status: DocHistoryDBStatus.receive,
            //                 isSuccess: true,
            //                 agencyIdRecipient: findUserDetail.agencyId,
            //                 agencySecondaryIdRecipient: findUserDetail.agencySecondaryId
            //                     ? findUserDetail.agencySecondaryId
            //                     : '',
            //             },
            //         },
            //     ],
            // });

            const _result = await this.documentRepository.findAll(findOption);
            resData.itemsPerPage = _result.length;
            resData.datas = _result;
            // this.logger.debug('_result -> ', _result);
            const arrDocIds = [];
            for (const item of _result) {
                arrDocIds.push(item.id);
            }
            const _result2 = await this.documentRepository.findAll({
                where: {
                    id: {
                        [Op.in]: arrDocIds,
                    },
                    isCancel: false,
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: DocumentRoutingDB,
                    },
                    {
                        model: DocumentExternalClerkDB,
                    },
                    {
                        model: DocumentInternalClerkDB,
                    },
                ],
            });
            const userIds: any[] = [];
            if (_result2.length > 0) {
                for (const iterator of _result2) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }
                }
            }
            // return _result;
            return new ArchiveDocumentResDTO(
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

    // ─────────────────────────────────────────────────────────────────────

    async archiveDocumentCreate(paginationDTO: ArchiveDocumentCreatePaginationDTO, user: UserDB) {
        const tag = this.archiveDocumentCreate.name;
        try {
            const findUserDetail = await this.userAgencyRepository.findOne({
                include: [
                    {
                        model: UserDB,
                        where: {
                            id: user.id,
                        },
                    },
                ],
            });
            this.logger.debug('findUserDetail -> ', findUserDetail)
            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
                datas: [],
            };

            let findOption: FindOptions = {
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: DocumentRoutingDB,
                        where: {
                            status: DocHistoryDBStatus.create,
                            agencyIdRecipient: null,
                            agencySecondaryIdRecipient: null,
                            agencyIdSender: findUserDetail.agencyId,
                            // agencySecondaryIdSender: findUserDetail.agencySecondaryId
                            //     ? findUserDetail.agencySecondaryId
                            //     : null,
                        },
                    },
                ],
            };
            // isSearch
            if (paginationDTO.search) {
                const dataLike = this.paginationService.genSqlLike(['governmentDocNo', 'name'], paginationDTO.search);
                if (dataLike) {
                    findOption = Object.assign(findOption, dataLike);
                }
            }
            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.documentRepository.count(findOption);

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

            const _result = await this.documentRepository.findAll(findOption);
            resData.itemsPerPage = _result.length;
            resData.datas = _result;
            this.logger.debug('_result -> ', _result);
            const arrDocIds = [];
            for (const item of _result) {
                arrDocIds.push(item.id);
            }
            const _result2 = await this.documentRepository.findAll({
                where: {
                    id: {
                        [Op.in]: arrDocIds,
                    },
                    isCancel: false,
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: DocumentRoutingDB,
                    },
                    {
                        model: DocumentExternalClerkDB,
                    },
                    {
                        model: DocumentInternalClerkDB,
                    },
                ],
            });
            const userIds: any[] = [];
            if (_result2.length > 0) {
                for (const iterator of _result2) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }
                }
            }
            // return _result;
            return new ArchiveDocumentCreateResDTO(
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

    async paginationLogBefore(user: UserDB, paginationDTO: PaginationLogBeforeDTO) {
        const tag = this.paginationLogBefore.name;
        try {

            const _startAt = moment(paginationDTO.startAt).format('YYYY-MM-DD 00:00:00');
            const _endAt = moment(paginationDTO.endAt).format('YYYY-MM-DD 23:59:59');

            const resData = {
                totalItems: 0,
                itemsPerPage: 0,
                totalPages: 0,
                currentPage: paginationDTO.page,
            };
            let findOption: FindOptions<LogBeforeDB>
            if (paginationDTO.startAt && paginationDTO.endAt) {

                findOption = {
                    where: {
                        createdAt: {
                            [Op.gte]: _startAt,
                            [Op.lte]: _endAt,
                        },
                    },
                    include: [
                        {
                            model: UserDB,
                            attributes: { exclude: ['createdAt', 'updatedAt'] }
                        },
                    ],
                    order: ['DESC', 'createdAt']
                };
            } else {
                findOption = {
                    include: [
                        {
                            model: UserDB,
                            attributes: { exclude: ['createdAt', 'updatedAt'] }
                        }
                    ],
                    order: ['DESC', 'createdAt']
                };
            }

            // จำนวนข้อมูลทั้งหมด ตามเงื่อนไข
            resData.totalItems = await this.logBeforeDBRepository.count(findOption);

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

            const _result = await this.logBeforeDBRepository.findAll(findOption);

            resData.itemsPerPage = _result.length;

            // user ─────────────────────────────────────────────────────────────────────────────────
            const userIds: string[] = [];
            const docIds: string[] = [];
            if (_result.length > 0) {
                for (const iterator of _result) {
                    if (iterator.userId) {
                        userIds.push(iterator.userId);
                    }
                    docIds.push(iterator.documentId)
                }
            }


            const findAllExternalClerk = await this.docExternalDBRepository.findAll({
                where: {
                    documentId: docIds
                },
                attributes: ['docNo', 'documentId']
            })
            const findAllInternalClerk = await this.docInternalDBRepository.findAll({
                where: {
                    documentId: docIds
                },
                attributes: ['docNo', 'documentId']
            })
            this.logger.debug('findAllExternalClerk -> ', findAllExternalClerk)
            this.logger.debug('findAllInternalClerk -> ', findAllInternalClerk)
            const resultUser = await this.userService.findAll_by_ids(userIds);

            return new PaginationLogBeforeResDTO(
                ResStatus.success,
                '',
                _result,
                resData.totalItems,
                resData.itemsPerPage,
                resData.totalPages,
                resData.currentPage,
                resultUser,
                findAllExternalClerk,
                findAllInternalClerk
            );
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
