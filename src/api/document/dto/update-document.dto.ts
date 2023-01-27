import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { EnumDocTypeDocumentDB, EnumPriorityDocumentDB } from './../../../database/entity/document.entity';
import { CreateDocumentDTOReqRecipients, CreateDocumentDTOReqRSender } from './create-document.dto';

export class UpdateDocumentDTOReqRSender {
    @ApiProperty()
    agencyIdSender: string;

    @ApiProperty()
    agencySecondarySender: string;
}

export class UpdateDocumentDTOReqRecipients {
    @ApiProperty()
    agencyIdRecipient: string;

    @ApiProperty()
    agencySecondaryIdRecipient: string;
}
export class UpdateDocumentDto {
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
    externalDate: string;
}
