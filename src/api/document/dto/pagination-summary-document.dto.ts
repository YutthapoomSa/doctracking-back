import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { DocHistoryDBStatus } from './../../../database/enum/db-enum-global';

export class DocumentSummaryPaginationDTO {
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
}
