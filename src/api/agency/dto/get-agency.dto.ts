import { ApiProperty } from '@nestjs/swagger';
import { AgencyDB } from './../../../database/entity/agency.entity';
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
export class GetAllAgencyResDTOData {
    @ApiProperty({})
    id: string;
    @ApiProperty({})
    agencyName: string;
    @ApiProperty({})
    abbreviationName: string;
    @ApiProperty({})
    agencyCode: string;
    @ApiProperty({})
    createdAt: Date;
    @ApiProperty({})
    updatedAt: Date;
    @ApiProperty({
        type: () => [GetAllAgencySecondaryResDTOData],
    })
    agencySecondaryLists: GetAllAgencySecondaryResDTOData[];
}
export class GetAgencyResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => GetAllAgencyResDTOData,
        description: 'ข้อมูล',
    })
    resData: GetAllAgencyResDTOData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: AgencyDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = null;
        const result = new GetAllAgencyResDTOData();

        if (!!datas) {
            result.id = datas.id;
            result.abbreviationName = datas.abbreviationName;
            result.agencyName = datas.agencyName;
            result.agencyCode = datas.agencyCode;
            result.createdAt = datas.createdAt;
            result.updatedAt = datas.updatedAt;
            result.agencySecondaryLists = [];
            for (const item of datas.agencySecondaryLists) {
                const result2 = new GetAllAgencySecondaryResDTOData();
                result2.abbreviationName = item.abbreviationName;
                result2.agencyCode = item.agencyCode;
                result2.id = item.id;
                result2.agencyId = item.agencyId;
                result2.agencyName = item.agencyName;
                result2.createdAt = item.createdAt;
                result2.updatedAt = item.updatedAt;
                result.agencySecondaryLists.push(result2);
            }
        }
        this.resData = result;
    }
}
