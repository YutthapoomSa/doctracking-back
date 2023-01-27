import { ApiProperty } from '@nestjs/swagger';
import { AgencyDB } from './../../../database/entity/agency.entity';
import { ResDataCommon } from './../../../helper/services/pagination/res-data-common.interface';

export class Option {
    @ApiProperty()
    search: string;
}

export class FindAllResDTO {
    @ApiProperty()
    totalItems: number;
    @ApiProperty()
    itemsPerPage: number;
    @ApiProperty()
    totalPages: number;
    @ApiProperty()
    currentPage: number;
    @ApiProperty()
    option: Option;
    @ApiProperty()
    datas: AgencyDB[];

    constructor(resData: ResDataCommon, datas: AgencyDB[]) {
        this.totalItems = resData.totalItems;
        this.itemsPerPage = resData.itemsPerPage;
        this.totalPages = resData.totalPages;
        this.currentPage = resData.currentPage;
        this.option = resData.option;
        this.datas = datas;
    }
}
