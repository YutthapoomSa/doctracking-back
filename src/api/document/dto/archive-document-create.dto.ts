import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';
import { DocumentRoutingDB } from './../../../database/entity/document-routing.entity';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { AppService } from './../../../helper/services/app.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class ArchiveDocumentCreatePaginationDTO {
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

export class ArchiveDocumentCreateResDTOResDatas {
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
    externalDate: string;

    @ApiProperty()
    currentRouting: number;

    @ApiProperty()
    totalRouting: number;

    @ApiProperty()
    isDocumentDone: boolean;

    @ApiProperty()
    documentRoutingLists: DocumentRoutingList[];
}
class ArchiveDocumentCreateResDTOResData {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [ArchiveDocumentCreateResDTOResDatas],
    })
    datas: ArchiveDocumentCreateResDTOResDatas[];
}
export class ArchiveDocumentCreateResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => ArchiveDocumentCreateResDTOResData,
        description: 'ข้อมูล',
    })
    resData: ArchiveDocumentCreateResDTOResData;

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
    ) {
        const appService = new AppService();
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

            // for (const iterator of data) {
            //     // if (iterator.documentRoutingLists.length > 0) {
            //     count = iterator.documentRoutingLists.length;
            //     // } else {
            //     // count = 0;
            //     // }
            // }

            count = documentRoutingLists.length;
            return count;
        };

        // ─────────────────────────────────────────────────────────────────

        this.resCode = resStatus;
        this.msg = msg;

        const _resData = new ArchiveDocumentCreateResDTOResData();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];
        if (!!data) {
            for (const item of data) {
                const _data = new ArchiveDocumentCreateResDTOResDatas();
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
                _data.docNo = item.docNo;
                _data.formDoc = item.formDoc;
                _data.externalDate = item.externalDate;
                // _data.toDoc = item.toDoc;
                if (!!item.documentExternalClerkLists && item.documentExternalClerkLists.length) {
                    _data.docNo = item.documentExternalClerkLists[0].docNo;
                }
                if (!!item.documentInternalClerkLists && item.documentInternalClerkLists.length) {
                    _data.docNo = item.documentInternalClerkLists[0].docNo;
                }

                _data.agency = null;
                _data.user = null;
                _data.documentRoutingLists = [];
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
                        // console.log('documentRouting -> ', JSON.parse(JSON.stringify(item.documentRoutingLists)));

                        documentLists.status = appService.translateStatusEnum(item2.status);
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
                    _data.documentRoutingLists[0].isCollapse = true;
                    // for (const iterator of _data.documentRoutingLists) {
                    //     iterator
                    // }
                    _resData.datas.push(_data);
                }
            }
            this.resData = _resData;
        }
    }
}
