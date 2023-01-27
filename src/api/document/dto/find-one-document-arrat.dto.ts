import { ApiProperty } from '@nestjs/swagger';
import { DocumentDB } from './../../../database/entity/document.entity';
import { ConfigService } from './../../../shared/config/config.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class DocumentRoutingList {
    id: string;
    documentId: string;
    agencyIdSender: string;
    agencyIdRecipient: string;
    agencySecondaryIdSender: any;
    agencySecondaryIdRecipient: any;
    createdAt: string;
    updatedAt: string;
}
export class FineOneDocumentArrayResDTOResData {
    id: string;
    status: string;
    name: string;
    detail: string;
    governmentDocNo: string;
    docNo: string;
    formDoc: string;
    toDoc: string;
    priority: string;
    barcode: string;
    documentType: string;
    recipientAt: string;
    createdAt: Date;
    agencyId: string;
    userId: string;
    updatedAt: Date;
    documentRoutingLists: DocumentRoutingList[];
    externalDate: string;
}

export class FindOneDocumentArrayResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    @ApiProperty({
        type: () => [FineOneDocumentArrayResDTOResData],
        description: 'ข้อมูล',
    })
    resData: FineOneDocumentArrayResDTOResData[];

    constructor(resCode: ResStatus, msg: string, datas: DocumentDB[]) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = [];

        const config = new ConfigService();

        if (!!datas) {
            for (const item of datas) {
                const result = new FineOneDocumentArrayResDTOResData();
                result.id = item.id;
                // result.status = item.status;
                result.name = item.name;
                result.detail = item.detail;
                result.governmentDocNo = item.governmentDocNo;
                result.priority = item.priority;
                result.barcode = item.barcode;
                result.documentType = item.documentType;
                result.createdAt = item.createdAt;
                result.updatedAt = item.updatedAt;
                result.userId = item.userId;
                result.toDoc = item.toDoc;
                result.formDoc = item.formDoc;
                result.docNo = item.docNo;
                result.recipientAt = item.recipientAt;
                result.externalDate = item.externalDate;
                result.documentRoutingLists = [];
                if (!!item.documentRoutingLists && item.documentRoutingLists.length > 0) {
                    for (const item2 of item.documentRoutingLists) {
                        const result2 = new DocumentRoutingList();
                        // id: string;
                        // documentId: string;
                        // agencyIdSender: string;
                        // agencyIdRecipient: string;
                        // agencySecondaryIdSender: any;
                        // agencySecondaryIdRecipient: any;
                        // createdAt: string;
                        // updatedAt: string;
                        result2.id = item2.id;
                        result2.documentId = item2.documentId;
                        result2.agencyIdSender = item2.agencyIdSender;
                        result2.agencyIdRecipient = item2.agencyIdRecipient;
                        result2.agencySecondaryIdRecipient = item2.agencySecondaryIdRecipient;
                        result2.agencySecondaryIdSender = item2.agencySecondaryIdSender;
                        result2.createdAt = item2.createdAt;
                        result2.updatedAt = item2.updatedAt;
                        result.documentRoutingLists.push(result2);
                    }
                }
                this.resData.push(result);
            }
        }
    }
}
