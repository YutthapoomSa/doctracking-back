import { forwardRef, HttpException, HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import moment from 'moment';
import { CreateDocumentDTOReq, CreateDocumentResDTOAll } from '../dto/create-document.dto';
import { AgencyService } from './../../../api/agency/services/agency.service';
import { UserDB, UserDBRole } from './../../../database/entity/user.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { LogService } from './../../../helper/services/log.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { ApproveDocumentDTOReq } from './../dto/approve-document.dto';
import { CreateDocumentResDTO } from './../dto/create-document.dto';
import { CreateForwardOrReturnDocumentDtoReq } from './../dto/create-forward-return.dto';
import { FindOneDocumentArrayResDTO } from './../dto/find-one-document-arrat.dto';
import { FindOneDocumentResDTO } from './../dto/fine-one-document-res.dto';
import {
    SummaryDocumentDTOReq,
    SummaryDocumentDTORes,
    SummaryDocumentDTOResResData2,
    SummaryDocumentDTOResResDataSummaryAll
} from './../dto/summary-document.dto';
import { UpdateDocumentDto } from './../dto/update-document.dto';
import { DocumentApproveService } from './document-approve.service';
import { DocumentService } from './document.service';

@Injectable()
export class ApiDocumentService implements OnApplicationBootstrap {
    private logger = new LogService(ApiDocumentService.name);

    constructor(
        private documentService: DocumentService,
        @Inject(forwardRef(() => AgencyService))
        private agencyService: AgencyService,

        @Inject(forwardRef(() => DocumentApproveService))
        private documentApproveService: DocumentApproveService,
    ) { }

    async onApplicationBootstrap() {
        // const result = await this.api_summary(null, {
        //     agencyId: '65c2ee7b-b8ba-4d04-a561-edf6f5d85285',
        //     startAt: '2022-09-01',
        //     endAt: '2022-09-19',
        // });
        // this.logger.debug(`api_summary -> `, result);
    }

    // [function]────────────────────────────────────────────────────────────────────────────────

    async api_create(user: UserDB, createDocumentDto: CreateDocumentDTOReq): Promise<CreateDocumentResDTO> {
        const tag = this.api_create.name;
        try {
            const resultDocument = await this.documentService.create(user, createDocumentDto);
            return new CreateDocumentResDTO(ResStatus.success, '', resultDocument);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // [function]────────────────────────────────────────────────────────────────────────────────

    async api_create_duplicate(user: UserDB, createDocumentDto: CreateDocumentDTOReq[]): Promise<CreateDocumentResDTOAll> {
        const tag = this.api_create_duplicate.name;
        try {
            const arrAfterCreate = [];
            for (const item of createDocumentDto) {
                const resultDocument = await this.documentService.create(user, item);
                arrAfterCreate.push(resultDocument)
            }
            return new CreateDocumentResDTOAll(ResStatus.success, '', arrAfterCreate);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────
    async api_approve(user: UserDB, body: ApproveDocumentDTOReq): Promise<FindOneDocumentResDTO> {
        const tag = this.api_create.name;
        try {
            const resultDocument = await this.documentApproveService.updateApprove(
                user.id,
                body.documentId,
                body.status,
            );
            const resultDocument2 = await this.documentService.findOneDocument(body.documentId);
            if (resultDocument2) {
                return new FindOneDocumentResDTO(ResStatus.success, '', resultDocument2);
            } else {
                return new FindOneDocumentResDTO(ResStatus.fail, 'not found', null);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────
    async api_find_one_document(user: UserDB, id: string): Promise<FindOneDocumentResDTO> {
        const tag = this.api_find_one_document.name;
        try {
            const resultDocument = await this.documentService.findOneDocument(id);
            this.logger.debug(`${tag} -> `, resultDocument);
            if (resultDocument) {
                return new FindOneDocumentResDTO(ResStatus.success, '', resultDocument);
            } else {
                return new FindOneDocumentResDTO(ResStatus.fail, 'not found', null);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async api_update(user: UserDB, id: string, updateDocumentDto: UpdateDocumentDto) {
        const tag = this.api_update.name;
        try {
            let res: CreateDocumentResDTO = null;
            await this.documentService
                .update(user, id, updateDocumentDto)
                .then((response) => {
                    res = new CreateDocumentResDTO(ResStatus.success, 'อัพเดตข้อมูลเสร็จสิ้น', response);
                })
                .catch((error) => {
                    res = new CreateDocumentResDTO(ResStatus.fail, 'กรุณาตรวจสอบความถูกต้องของข้อมูล', null);
                });

            return res;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async api_remove(id: string) {
        const tag = this.api_remove.name;
        try {
            return await this.documentService
                .remove(id)
                .then((response) => {
                    return new CreateDocumentResDTOAll(ResStatus.success, 'ลบเสร็จสิ้น', null);
                })
                .catch((error) => {
                    return new CreateDocumentResDTOAll(ResStatus.fail, 'Remove Not Success', null);
                });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────────

    async api_summary(user: UserDB, body: SummaryDocumentDTOReq): Promise<SummaryDocumentDTORes> {
        const tag = this.api_summary.name;
        try {
            let agencyId = body.agencyId;

            if (user.role !== UserDBRole.superAdmin) {
                const result1 = await this.agencyService.findOne_by_userId(user.id);
                agencyId = result1.id;
            }

            const obj: any = {
                total: 0,
            };
            const keys = Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]);
            for (const iterator of keys) {
                obj[iterator] = await this.documentService.countByStatus_by_date(
                    agencyId,
                    iterator,
                    body.startAt,
                    body.endAt,
                );
            }
            const _data = new SummaryDocumentDTOResResDataSummaryAll();
            try {
                _data.create = obj.create;
                _data.noEvent = obj.noEvent;
                _data.reject = obj.reject;
                _data.success = obj.success;
                _data.unsuccessful = obj.unsuccessful;
                _data.processing = obj.processing;
                _data.total =
                    _data.create + _data.noEvent + _data.reject + _data.success + _data.unsuccessful + _data.processing;
            } catch (error) {
                throw new Error(error);
            }

            // ─────────────────────────────────────────────────────────────────

            const _startAt = moment(body.startAt);
            const _endAt = moment(body.endAt);

            if (_startAt.isAfter(_endAt)) {
                throw new Error('date incorrect.');
            }

            let diff = _endAt.diff(_startAt, 'day');

            let result: any[] = await this.documentService.countByStatus_by_date2(
                agencyId,
                _startAt.format('YYYY-MM-DD HH:mm:ss'),
                _endAt.format('YYYY-MM-DD HH:mm:ss'),
            );

            result = JSON.parse(JSON.stringify(result));

            const findData = (year: string, month: string, day: string, status: DocHistoryDBStatus) => {
                let count = 0;

                for (const iterator of result) {
                    if (
                        iterator.year === +year &&
                        iterator.month === +month &&
                        iterator.day === +day &&
                        `${iterator.status}` === status
                    ) {
                        count++;
                    }
                }

                return count;
            };

            const _data1 = [
                {
                    date: '',
                    data: {
                        total: 0,
                        success: 0,
                        unsuccessful: 0,
                        reject: 0,
                        create: 0,
                        noEvent: 0,
                        processing: 0,
                    },
                },
            ];
            _data1.length = 0;

            if (diff === 0) {
                diff = 1;
            }
            for (let index = 0; index < diff; index++) {
                const _date = moment(_startAt).add(index, 'd');
                const _year = _date.format('YYYY');
                const _month = _date.format('MM');
                const _day = _date.format('DD');

                _data1.push({
                    date: _date.format('YYYY-MM-DD'),
                    data: {
                        total: 0,
                        success: findData(_year, _month, _day, DocHistoryDBStatus.success),
                        unsuccessful: findData(_year, _month, _day, DocHistoryDBStatus.unsuccessful),
                        reject: findData(_year, _month, _day, DocHistoryDBStatus.reject),
                        create: findData(_year, _month, _day, DocHistoryDBStatus.create),
                        noEvent: findData(_year, _month, _day, DocHistoryDBStatus.noEvent),
                        processing: findData(_year, _month, _day, DocHistoryDBStatus.processing),
                    },
                });

                const x = _data1[_data1.length - 1];

                _data1[_data1.length - 1].data.total =
                    x.data.success +
                    x.data.unsuccessful +
                    x.data.reject +
                    x.data.create +
                    x.data.noEvent +
                    x.data.processing;
            }

            const data2: SummaryDocumentDTOResResData2[] = [];

            for (const iterator of _data1) {
                data2.push({
                    date: iterator.date,
                    data: iterator.data,
                });
            }

            return new SummaryDocumentDTORes(ResStatus.success, '', _data, data2);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async api_find_one_document_array(user: UserDB, ids: string) {
        const tag = this.api_find_one_document_array.name;
        try {
            const resultDocument = await this.documentService.findOneDocumentArray(user, ids);
            if (resultDocument) {
                return new FindOneDocumentArrayResDTO(ResStatus.success, '', resultDocument);
            } else {
                return new FindOneDocumentArrayResDTO(ResStatus.fail, 'not found', null);
            }
            return resultDocument;
        } catch (error) {
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────

    async api_find_one_document_by_status(user: UserDB, id: string, status: string): Promise<FindOneDocumentResDTO> {
        const tag = this.api_find_one_document_by_status.name;
        try {
            const resultDocument = await this.documentService.findOneDocumentByStatus(id, status);
            // this.logger.debug(`${tag} -> `, resultDocument);
            if (resultDocument) {
                return new FindOneDocumentResDTO(ResStatus.success, '', resultDocument);
            } else {
                return new FindOneDocumentResDTO(ResStatus.fail, 'not found', null);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    async api_forward_or_return_document(user: UserDB, body: CreateForwardOrReturnDocumentDtoReq[]) {
        const tag = this.api_forward_or_return_document.name;
        try {
            const resultForwardOrReturn = await this.documentService.forwardOrReturnDocument(user, body);
            if (resultForwardOrReturn) {
                // return new FindOneDocumentResDTO(ResStatus.success, '', resultDocument);
                return resultForwardOrReturn;
            } else {
                // return new FindOneDocumentResDTO(ResStatus.fail, 'not found', null);
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
