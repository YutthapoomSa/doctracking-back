import { ApiProperty } from '@nestjs/swagger';
import { AgencySecondaryDB } from './../../../database/entity/agency-secondary.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class GetAllAgencySecondaryResDTOData {
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    agencyName: string;
    @ApiProperty({})
    abbreviationName: string;
    @ApiProperty({})
    agencyCode: string;
    @ApiProperty({})
    agencyId: string;
    @ApiProperty({})
    createdAt: Date;
    @ApiProperty({})
    updatedAt: Date;
}

export class GetAllAgencySecondaryResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => [GetAllAgencySecondaryResDTOData],
        description: 'ข้อมูล',
    })
    resData: GetAllAgencySecondaryResDTOData[];

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: AgencySecondaryDB[]) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = [];

        if (!!datas) {
            for (const item of datas) {
                const result = new GetAllAgencySecondaryResDTOData();
                result.id = item.id;
                result.abbreviationName = item.abbreviationName;
                result.agencyName = item.agencyName;
                result.agencyId = item.agencyId;
                result.agencyCode = item.agencyCode;
                result.createdAt = item.createdAt;
                result.updatedAt = item.updatedAt;
                this.resData.push(result);
            }
        }
    }
}
