import { ApiProperty } from '@nestjs/swagger';
import { UserDB, UserDBGender, UserDBRole } from './../../../database/entity/user.entity';
import { ResDataCommon } from './../../../helper/services/pagination/res-data-common.interface';

class FindAllResDTOResData {
    @ApiProperty()
    email: string;

    @ApiProperty({
        description: 'ข้อมูล',
    })
    userName: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({
        description: 'สิทธิ์การเข้าใช้งาน',
    })
    role: UserDBRole;

    @ApiProperty({
        description: 'status เปิด ปิด',
    })
    status: boolean;

    @ApiProperty({
        description: 'เพศ',
    })
    gender: UserDBGender;

    @ApiProperty()
    phoneNumber: string;
}
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
    @ApiProperty({
        type: () => [FindAllResDTOResData],
    })
    datas: FindAllResDTOResData[];

    constructor(resData: ResDataCommon, datas: UserDB) {
        this.totalItems = resData.totalItems;
        this.itemsPerPage = resData.itemsPerPage;
        this.totalPages = resData.totalPages;
        this.currentPage = resData.currentPage;
        this.option = resData.option;
        this.datas = [];

        if (!!datas) {
            const _data = new FindAllResDTOResData();
            _data.email = datas.email;
            _data.userName = datas.username;
            _data.firstName = datas.firstName;
            _data.lastName = datas.lastName;
            _data.role = datas.role;
            _data.status = datas.status;
            _data.gender = datas.gender;
            _data.phoneNumber = datas.phoneNumber;
        }
    }
}
