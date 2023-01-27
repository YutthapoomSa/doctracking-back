import { ResStatus } from './../../../shared/enum/res-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SummaryDocumentDTOReq {
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
}

// ────────────────────────────────────────────────────────────────────────────────

export class SummaryDocumentDTOResResDataSummaryAll {
    @ApiProperty({})
    success: number;
    @ApiProperty({})
    unsuccessful: number;
    @ApiProperty({})
    reject: number;
    @ApiProperty({})
    create: number;
    @ApiProperty({})
    noEvent: number;
    @ApiProperty({})
    processing: number;
    @ApiProperty({})
    total: number;
}

export class SummaryDocumentDTOResResData2 {
    @ApiProperty({})
    date: string;

    @ApiProperty({
        type: () => SummaryDocumentDTOResResDataSummaryAll,
    })
    data: SummaryDocumentDTOResResDataSummaryAll;
}

export class SummaryDocumentDTOResResData {
    @ApiProperty({
        type: () => SummaryDocumentDTOResResDataSummaryAll,
    })
    summaryAll: SummaryDocumentDTOResResDataSummaryAll;

    @ApiProperty({
        type: () => [SummaryDocumentDTOResResData2],
    })
    sumOfDateLists: SummaryDocumentDTOResResData2[];
}

export class SummaryDocumentDTORes {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => SummaryDocumentDTOResResData,
        description: 'ข้อมูล',
    })
    resData: SummaryDocumentDTOResResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resCode: ResStatus,
        msg: string,
        datas: SummaryDocumentDTOResResDataSummaryAll,
        data2: SummaryDocumentDTOResResData2[],
    ) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new SummaryDocumentDTOResResData();

        if (!!datas) {
            this.resData.sumOfDateLists = data2;
            this.resData.summaryAll = datas;
        }
    }
}
