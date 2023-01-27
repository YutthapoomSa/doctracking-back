import { EnumDocumentApproveDB } from './../../../database/entity/document-approve.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ApproveDocumentDTOReq {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUUID(4)
    documentId: string;

    @ApiProperty({
        enum: Object.keys(EnumDocumentApproveDB).map((k) => EnumDocumentApproveDB[k]),
    })
    @IsEnum(EnumDocumentApproveDB)
    status: EnumDocumentApproveDB;
}
