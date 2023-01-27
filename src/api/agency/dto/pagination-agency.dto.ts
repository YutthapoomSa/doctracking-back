import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class AgencyPaginationAgencySecondaryList {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agencyName: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    abbreviationName: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agencyCode: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agencyId: string;
}
export class AgencyPaginationDTO {
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
}

export class AgencyPaginationResDTOResDatas {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agencyName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    abbreviationName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agencyCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    createdAt: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    updatedAt: string;

    @ApiProperty({
        type: () => [AgencyPaginationAgencySecondaryList],
    })
    agencySecondaryLists?: AgencyPaginationAgencySecondaryList[];
}
export class AgencyPaginationResDTOResData {
    @ApiProperty()
    totalItems: number;

    @ApiProperty()
    itemsPerPage: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty({
        type: () => [AgencyPaginationResDTOResDatas],
    })
    datas: AgencyPaginationResDTOResDatas[];
}

export class AgencyPaginationResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => AgencyPaginationResDTOResData,
        description: 'ข้อมูล',
    })
    resData: AgencyPaginationResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resStatus: ResStatus,
        msg: string,
        data: AgencyDB[],
        totalItems: number,
        itemsPerPage: number,
        totalPages: number,
        currentPage: number,
    ) {
        this.resCode = resStatus;
        this.msg = msg;

        const _resData = new AgencyPaginationResDTOResData();
        _resData.itemsPerPage = itemsPerPage;
        _resData.totalItems = totalItems;
        _resData.currentPage = currentPage;
        _resData.totalPages = totalPages;
        _resData.datas = [];
        if (!!data) {
            for (const item of data) {
                const _data = new AgencyPaginationResDTOResDatas();
                _data.id = item.id;
                _data.abbreviationName = item.abbreviationName;
                _data.agencyName = item.agencyName;
                _data.agencyCode = item.agencyCode;
                _data.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
                _data.updatedAt = moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                _data.agencySecondaryLists = [];
                _resData.datas.push(_data);
                if (!!item.agencySecondaryLists) {
                    for (const item2 of item.agencySecondaryLists) {
                        const _data2 = new AgencyPaginationAgencySecondaryList();
                        _data2.abbreviationName = item2.abbreviationName;
                        _data2.id = item2.id;
                        _data2.agencyCode = item2.agencyCode;
                        _data2.agencyName = item2.agencyName;
                        _data2.agencyId = item2.agencyId;
                        _data.agencySecondaryLists.push(_data2);
                    }
                }
            }
        }
        this.resData = _resData;
    }
}
