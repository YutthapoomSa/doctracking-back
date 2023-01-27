import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { DocumentDB, EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from '../../../database/entity/document.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class CreateDocumentDTOReqRSender {
    @ApiProperty()
    agencyIdSender: string;

    @ApiProperty()
    agencySecondarySender: string;
}

export class CreateDocumentDTOReqRecipients {
    @ApiProperty()
    agencyIdRecipient: string;

    @ApiProperty()
    agencySecondaryIdRecipient: string;
}
export class CreateDocumentDTOReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        enum: Object.keys(EnumPriorityDocumentDB).map((k) => EnumPriorityDocumentDB[k]),
    })
    @IsNotEmpty()
    @IsEnum(EnumPriorityDocumentDB)
    priority: EnumPriorityDocumentDB;

    @ApiProperty({
        enum: Object.keys(EnumDocTypeDocumentDB).map((k) => EnumDocTypeDocumentDB[k]),
    })
    @IsNotEmpty()
    @IsString()
    documentType: EnumDocTypeDocumentDB;

    @ApiProperty()
    @IsString()
    detail: string;

    @ApiProperty()
    @IsString()
    governmentDocNo: string;

    @ApiProperty({
        type: () => [CreateDocumentDTOReqRecipients],
    })
    @IsNotEmpty()
    @IsArray()
    recipients: CreateDocumentDTOReqRecipients[];

    @ApiProperty({
        type: () => CreateDocumentDTOReqRSender,
    })
    @IsNotEmpty()
    @IsObject()
    sender: CreateDocumentDTOReqRSender;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isApprove: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isStatusSendOut: boolean;

    @ApiProperty()
    @IsString()
    formDoc: string;

    @ApiProperty()
    @IsString()
    toDoc: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isExternal: boolean;

    @ApiProperty()
    @IsString()
    externalAgencyName: string;

    @ApiProperty()
    externalDate: string;
}
// ────────────────────────────────────────────────────────────────────────────────
class CreateDocumentDTOResData {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({
        enum: Object.keys(EnumPriorityDocumentDB).map((k) => EnumPriorityDocumentDB[k]),
    })
    priority: EnumPriorityDocumentDB;

    @ApiProperty({
        enum: Object.keys(EnumDocTypeDocumentDB).map((k) => EnumDocTypeDocumentDB[k]),
    })
    documentType: EnumDocTypeDocumentDB;

    @ApiProperty()
    barcode: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    agencyId: string;

    @ApiProperty()
    governmentDocNo: string;
}
export class CreateDocumentResDTOAll {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => [CreateDocumentDTOResData],
        description: 'ข้อมูล',
    })
    resData: CreateDocumentDTOResData[];

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocumentDB[]) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = [];

        if (!!datas && datas.length > 0) {
            for (const iterator of datas) {
                const _data = new CreateDocumentDTOResData();
                _data.id = iterator.id;
                _data.name = iterator.name;
                _data.priority = iterator.priority;
                _data.documentType = iterator.documentType;
                _data.barcode = iterator.barcode;
                _data.userId = iterator.userId;
                _data.agencyId = iterator.agencyId;
                _data.governmentDocNo = iterator.governmentDocNo;
                this.resData.push(_data);
            }
        }
    }
}

export class CreateDocumentResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => CreateDocumentDTOResData,
        description: 'ข้อมูล',
    })
    resData: CreateDocumentDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: DocumentDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = null;

        if (!!datas) {
            const _data = new CreateDocumentDTOResData();
            _data.id = datas.id;
            _data.name = datas.name;
            _data.priority = datas.priority;
            _data.documentType = datas.documentType;
            _data.barcode = datas.barcode;
            _data.userId = datas.userId;
            _data.agencyId = datas.agencyId;
            _data.governmentDocNo = datas.governmentDocNo;
            this.resData = _data;
        }
    }
}
