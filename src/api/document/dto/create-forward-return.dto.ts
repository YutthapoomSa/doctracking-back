import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';

export class CreateForwardOrReturnDocumentDtoReq {
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
