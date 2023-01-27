import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import moment from 'moment';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { UserDB } from './../../../database/entity/user.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { AppService } from './../../../helper/services/app.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';

// export class DocumentIdsReqFilter {
//     @IsOptional()
//     @IsArray()
//     @IsString({ each: true })
//     @Type(() => String)
//     @Transform(({ value }) => value.split(','))
//     documentId?: string[];
// }

// ─────────────────────────────────────────────────────────────────────────────

export class DocumentRoutingList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    documentId: string;
    @ApiProperty()
    agencyIdSender: string;
    @ApiProperty()
    agencyIdRecipient: string;
    @ApiProperty()
    agencySecondaryIdSender: string;
    @ApiProperty()
    agencySecondaryIdRecipient?: string;
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    updatedAt: string;

    @ApiProperty()
    isSuccess: boolean;

    @ApiProperty()
    status: string;

    @ApiProperty()
    agencyRecipientName: string;

    @ApiProperty()
    agencySecondaryRecipientName: string;

    @ApiProperty()
    isCollapse: boolean;
}

export class DocumentPaginationDTOV2 {
    @ApiProperty({
        example: '10',
    })
    @IsNotEmpty()
    @IsNumber()
    perPages: number;

    @ApiProperty({
        example: '1',
    })
    @IsNumber()
    @IsNotEmpty()
    page: number;

    @ApiProperty({
        example: '',
    })
    @IsString()
    search: string;

    @ApiProperty({
        example: moment().startOf('month').format('YYYY-MM-DD'),
    })
    startAt: string;

    @ApiProperty({
        example: moment().endOf('month').format('YYYY-MM-DD'),
    })
    endAt: string;

    @ApiProperty()
    @IsOptional()
    isExternal: boolean;
}
class User {
    @ApiProperty()
    id: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    phoneNumber: string;
}
class Agency {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
}

class DocumentExternalClerkList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    docNo: string;
    @ApiProperty()
    isStatusDone: boolean;
    @ApiProperty()
    documentId: string;
    @ApiProperty()
    documentInternalClerkId: string;
}
class DocumentInternalClerkList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    docNo: string;
    @ApiProperty()
    isStatusDone: boolean;
    @ApiProperty()
    documentId: string;
    @ApiProperty()
    documentExternalClerkId: string;
}
export class DocumentPaginationResDTOV2ResDatas {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({
        enum: Object.keys(EnumPriorityDocumentDB).map((k) => EnumPriorityDocumentDB[k]),
    })
    priority: string;

    @ApiProperty({
        enum: Object.keys(EnumDocTypeDocumentDB).map((k) => EnumDocTypeDocumentDB[k]),
    })
    documentType: string;

    @ApiProperty()
    detail: string;

    @ApiProperty()
    governmentDocNo: string;

    @ApiProperty()
    barcode: string;

    @ApiProperty()
    agencyId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    status: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiProperty({
        type: () => Agency,
    })
    agency: Agency;

    @ApiProperty({
        type: () => User,
    })
    user: User;

    @ApiProperty()
    agencySenderName: string;

    @ApiProperty()
    agencyRecipientName: string;

    @ApiProperty()
    docNo: string;

    @ApiProperty()
    formDoc: string;

    @ApiProperty()
    toDoc: string;

    @ApiProperty()
    documentRoutingLists: DocumentRoutingList[];

    @ApiProperty()
    currentRouting: number;

    @ApiProperty()
    totalRouting: number;

    @ApiProperty()
    isDocumentDone: boolean;

    @ApiProperty()
    actionLists: string[];

    @ApiProperty()
    externalDate: string;

    // @ApiProperty()
    // documentExternalClerkLists: DocumentExternalClerkList[];

    // @ApiProperty()
    // documentInternalClerkLists: DocumentInternalClerkList[];
}
export class DocumentPaginationResDTOResDataV2 {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [DocumentPaginationResDTOV2ResDatas],
    })
    datas: DocumentPaginationResDTOV2ResDatas[];
}

export class DocumentPaginationResDTOV2 {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => DocumentPaginationResDTOResDataV2,
        description: 'ข้อมูล',
    })
    resData: DocumentPaginationResDTOResDataV2;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resStatus: ResStatus,
        msg: string,
        data: DocumentDB[],
        totalItems: number,
        itemsPerPage: number,
        totalPages: number,
        currentPage: number,
        userDB: UserDB[],
        agencyDB: AgencyDB[],
        namesAgency?: AgencyDB[],
    ) {
        const appService = new AppService();
        const findActionLists = (namesAgencyLists: AgencyDB[], agencyIdRecipient: string): string => {
            let agencyName = '';
            // console.log('namesAgencyLists =>', namesAgencyLists);

            // namesAgencyLists.map((res1) =>
            //     documentRoutingLists.map((res2) => {
            //         if (res1.id === res2.agencyIdRecipient) {
            //             agencyName = res1.agencyName;
            //         } else {
            //             agencyName = '';
            //         }
            //     }),
            // );
            // console.log('agencyIdRecipient -> ', agencyIdRecipient);
            // console.log('namesAgencyLists -> ', JSON.parse(JSON.stringify(namesAgencyLists)));
            if (!!namesAgencyLists) {
                for (const item of namesAgencyLists) {
                    if (item.id === agencyIdRecipient) {
                        // console.log('agencyName -> ', item.agencyName);
                        agencyName = item.agencyName;
                    }
                }
            }

            return agencyName;
        };
        const currentRouting = (routingId: string, documentRoutingLists: DocumentRoutingDB[]): number => {
            let count = 0;
            // console.log('jibSheetID ->>> ', jobSheetId);

            count = documentRoutingLists.filter((res) => res.isSuccess === true).length;

            // for (const iterator of documentRoutingLists) {
            //     // for (const iterator2 of iterator.documentRoutingLists) {
            //         console.log('iterator2.id -> ', iterator.id);
            //         console.log('routingId -> ', routingId);

            //         if (iterator.id !== routingId) continue;

            //         if (iterator.isSuccess === true) {
            //             count += 1;
            //         }
            //         break;
            //     // }
            // }
            return count;
        };

        const totalRouting = (documentRoutingLists: DocumentRoutingDB[]): number => {
            let count = 0;

            // for (const item of documentRoutingLists) {
            //     if (item.documentId === '94a16e99-1a1c-4d44-a149-08bb6272d1ef') {
            //         console.log('item -> ', JSON.parse(JSON.stringify(item)));
            //     }
            // }

            count = documentRoutingLists.length;
            return count;
        };

        // const findDocumentDone = (documentRoutingLists: DocumentRoutingDB[]): boolean =>{
        //     let isDone;

        //     return isDone;
        // }

        const findUser = (userId: string) => {
            let res: UserDB = null;
            if (!!userDB) {
                for (const iterator of userDB) {
                    if (iterator.id === userId) {
                        res = iterator;
                        break;
                    }
                }
            }
            return res;
        };

        const findAgency = (agencyId: string) => {
            let res: AgencyDB = null;
            if (!!agencyDB) {
                for (const iterator of agencyDB) {
                    if (iterator.id === agencyId) {
                        res = iterator;
                        break;
                    }
                }
            }
            return res;
        };
        // ─────────────────────────────────────────────────────────────

        const arrTemp = [];

        // ─────────────────────────────────────────────────────────────────

        this.resCode = resStatus;
        this.msg = msg;

        const _resData = new DocumentPaginationResDTOResDataV2();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];

        for (const item of data) {
            const _data = new DocumentPaginationResDTOV2ResDatas();
            _data.id = item.id;
            _data.name = item.name;
            _data.agencyId = item.agencyId;
            _data.barcode = item.barcode;
            _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            _data.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            _data.documentType = appService.translateDocumentType(item.documentType);
            _data.priority = appService.translatePriority(item.priority);
            _data.detail = item.detail;
            // _data.status = item.status;
            _data.governmentDocNo = item.governmentDocNo;
            // _data.docNo = item.docNo;
            _data.docNo = null;
            _data.formDoc = item.formDoc;
            _data.toDoc = item.toDoc;
            _data.externalDate = item.externalDate;

            _data.agency = null;
            _data.user = null;
            _data.documentRoutingLists = [];
            _data.actionLists = [];
            if (item.agencyId) {
                const resultAgency = findAgency(item.agencyId);
                if (resultAgency) {
                    _data.agency = new Agency();
                    _data.agency.id = resultAgency.id;
                    _data.agency.agencyName = resultAgency.agencyName;
                }
            }

            if (item.userId) {
                const resultUser = findUser(item.userId);
                if (resultUser) {
                    _data.user = new User();
                    _data.user.id = resultUser.id;
                    _data.user.firstName = resultUser.firstName;
                    _data.user.lastName = resultUser.lastName;
                    _data.user.phoneNumber = resultUser.phoneNumber;
                }
            }
            if (!!item.documentExternalClerkLists && item.documentExternalClerkLists.length) {
                // console.log('item doc no -> ', JSON.parse(JSON.stringify(item.documentExternalClerkLists)));

                _data.docNo = item.documentExternalClerkLists[0].docNo
                    ? item.documentExternalClerkLists[0].docNo
                    : null;
                // findActionLists(namesAgency, item.documentRoutingLists);
                // _data.actionLists.push();
            } else if (!!item.documentInternalClerkLists && item.documentInternalClerkLists.length) {
                _data.docNo = item.documentInternalClerkLists[0].docNo
                    ? item.documentInternalClerkLists[0].docNo
                    : null;
            }
            if (!!item.documentRoutingLists) {
                for (const item2 of item.documentRoutingLists) {
                    const documentLists = new DocumentRoutingList();
                    documentLists.id = item2.id;
                    documentLists.agencyIdRecipient = item2.agencyIdRecipient;
                    documentLists.agencyIdSender = item2.agencyIdSender;
                    documentLists.agencySecondaryIdRecipient = item2.agencySecondaryIdRecipient;
                    documentLists.agencySecondaryIdSender = item2.agencySecondaryIdSender;
                    documentLists.createdAt = item2.createdAt;
                    documentLists.updatedAt = item2.updatedAt;
                    documentLists.documentId = item2.documentId;
                    documentLists.isSuccess = item2.isSuccess;
                    _data.currentRouting = currentRouting(item2.id, item.documentRoutingLists)
                        ? currentRouting(item2.id, item.documentRoutingLists)
                        : 0;
                    _data.totalRouting = totalRouting(item.documentRoutingLists)
                        ? totalRouting(item.documentRoutingLists)
                        : 0;
                    documentLists.status = appService.translateStatusEnum(item2.status);
                    const result = findActionLists(namesAgency, item2.agencyIdRecipient);
                    arrTemp.push(result);

                    if (
                        _data.currentRouting === _data.totalRouting &&
                        _data.currentRouting !== 0 &&
                        _data.totalRouting !== 0
                    ) {
                        _data.isDocumentDone = true;
                    } else {
                        _data.isDocumentDone = false;
                    }

                    if (!!item2.agencyRecipient) {
                        documentLists.agencyRecipientName = item2.agencyRecipient.agencyName;
                        const secondaryName = item2.agencyRecipient.agencySecondaryLists.find((res) => {
                            if (res.id === item2.agencySecondaryIdRecipient) {
                                documentLists.agencySecondaryRecipientName = res.agencyName;
                                return res;
                            } else {
                                documentLists.agencySecondaryRecipientName = '';
                                return '';
                            }
                        });
                    } else {
                        documentLists.agencyRecipientName = '';
                        documentLists.agencySecondaryRecipientName = '';
                    }
                    documentLists.isCollapse = false;
                    _data.documentRoutingLists.push(documentLists);
                }
            }
            const uniq: string[] = [...new Set(arrTemp)];
            // console.log('uniq -> ', uniq);

            _data.actionLists = uniq;
            _data.documentRoutingLists[0].isCollapse = true;
            // for (const iterator of _data.documentRoutingLists) {
            //     iterator
            // }
            _resData.datas.push(_data);
        }
        this.resData = _resData;
    }
}
