import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';

export class UpdateDocHistoryDto {
    @ApiProperty({
        enum: Object.keys(DocHistoryDBStatus).map((k) => DocHistoryDBStatus[k]),
    })
    @IsNotEmpty()
    @IsEnum(DocHistoryDBStatus)
    readonly status: DocHistoryDBStatus;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly comment: string;

    @ApiProperty()
    @IsString()
    readonly agencyIdSenders: string;

    @ApiProperty()
    @IsString()
    readonly agencyIdRecipient: string;
}
