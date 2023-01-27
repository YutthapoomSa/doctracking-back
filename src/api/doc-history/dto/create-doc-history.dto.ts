import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DocHistoryDB } from './../../../database/entity/doc-history.entity';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class CreateDocHistoryDtoReq {
    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    @IsEnum(DocHistoryDBStatus)
    status: DocHistoryDBStatus;

    @ApiProperty()
    comment: string;

    @ApiProperty({
        description: 'ผู้ส่ง',
    })
    agencyIdSender: string;

    @ApiProperty({
        description: 'ผู้รับ',
    })
    agencyIdRecipient: string;

    @ApiProperty()
    documentId: string;

    @ApiProperty({
        description: 'ผู้ส่งลำดับย่อย',
    })
    agencySecondaryIdSender: string;

    @ApiProperty({
        description: 'ผู้รับลำกับย่อย',
    })
    agencySecondaryIdRecipient: string;

    @ApiProperty({
        description: 'จากใคร',
    })
    formDoc: string;

    @ApiProperty({
        description: 'ส่งให้ใคร',
    })
    toDoc: string;

    @ApiProperty()
    documentRoutingId: string;
}

class CreateDocHistoryDTOResData {
    @ApiProperty()
    id: string;

    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    status: DocHistoryDBStatus;

    @ApiProperty()
    comment: string;

    @ApiProperty()
    documentId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({
        description: 'ผู้ส่ง',
    })
    agencyIdSender: string;

    @ApiProperty({
        description: 'ผู้รับ',
    })
    agencyIdRecipient: string;
}

export class DocHistoryResDto {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => CreateDocHistoryDTOResData,
        description: 'ข้อมูล',
    })
    resData: CreateDocHistoryDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocHistoryDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = null;

        if (!!datas) {
            const _data = new CreateDocHistoryDTOResData();
            _data.id = datas.id;
            _data.status = datas.status;
            _data.comment = datas.comment;
            _data.documentId = datas.documentRoutingId;
            _data.userId = datas.userId;
            _data.agencyIdSender = datas.agencyIdSender;
            _data.agencyIdRecipient = datas.agencyIdRecipient;
            this.resData = _data;
        }
    }
}
