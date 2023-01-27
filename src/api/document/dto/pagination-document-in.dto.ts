import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';

export class DocumentInPaginationDTO {
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

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID(4)
    agencyId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    startAt: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    endAt: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
            example: DocHistoryDBStatus.create,
        },
    })
    @IsArray()
    status: DocHistoryDBStatus[];

    @ApiProperty({
        description: 'ตรวจสอบข้อมูล agency ตำแหน่งล่าสุดหรือไม่',
        example: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    isAgencyCheckLast: boolean;

    @ApiProperty({
        description: 'ตรวจสอบข้อมูล ที่ AgencyIdSender',
        example: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    isCheckAgencyIdSender: boolean;

    @ApiProperty({
        description: 'ตรวจสอบข้อมูล ที่ AgencyIdRecipient',
        example: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    isCheckAgencyIdRecipient: boolean;

    @ApiProperty({
        description: 'ตรวจสอบข้อมูลการ approve เอกสาร',
        example: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    isCheckApprove: boolean;

    @ApiProperty({
        description: 'เอกสารรับเข้าหรือไม่',
        example: false
    })
    @IsNotEmpty()
    @IsBoolean()
    isReceiveDocument: boolean;
}
