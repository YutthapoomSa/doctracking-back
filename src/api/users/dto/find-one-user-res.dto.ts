import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserDB, UserDBGender, UserDBRole } from '../../../database/entity/user.entity';
import { config } from './../../../../config/config.development';
import { ResStatus } from './../../../shared/enum/res-status.enum';

class FindOneUserResDTOResDataAgencyList {
    @ApiProperty()
    id: string;
    @ApiProperty()
    agencyName: string;
    @ApiProperty()
    abbreviationName: string;
    @ApiProperty()
    agencyCode: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;
}
export class Agency {
    id: string;
    agencyName: string;
}
export class FindOneUserAgencyList {
    id: string;
    userId: string;
    agencyId: string;
    agency: Agency;
}
class FindOneUserResDTOResData {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

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

    @ApiProperty()
    image: string;

    @ApiProperty({
        type: () => [FindOneUserResDTOResDataAgencyList],
    })
    agencyLists: FindOneUserResDTOResDataAgencyList[];

    @ApiProperty()
    userAgencyLists: FindOneUserAgencyList[];
}

export class FindOneUserResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => FindOneUserResDTOResData,
        description: 'ข้อมูล',
    })
    resData: FindOneUserResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, datas: UserDB) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = null;

        if (!!datas) {
            const _data = new FindOneUserResDTOResData();
            _data.id = datas.id;
            _data.email = datas.email;
            _data.userName = datas.username;
            _data.firstName = datas.firstName;
            _data.lastName = datas.lastName;
            _data.role = datas.role;
            _data.status = datas.status;
            _data.gender = datas.gender;
            _data.phoneNumber = datas.phoneNumber;
            _data.image = datas.image ? config.imagePath.userImagePath + '/' + datas.image : '';
            _data.agencyLists = [];
            _data.userAgencyLists = [];
            if (!!datas.userAgencyLists && datas.userAgencyLists.length > 0) {
                for (const iterator of datas.userAgencyLists) {
                    const _findOneUserResDTOResDataAgencyList = new FindOneUserResDTOResDataAgencyList();
                    _findOneUserResDTOResDataAgencyList.id = iterator.id;
                    _findOneUserResDTOResDataAgencyList.agencyName = iterator.agency.agencyName;
                    _findOneUserResDTOResDataAgencyList.abbreviationName = iterator.agency.abbreviationName;
                    _findOneUserResDTOResDataAgencyList.agencyCode = iterator.agency.agencyCode;
                    _findOneUserResDTOResDataAgencyList.createdAt = iterator.createdAt;
                    _findOneUserResDTOResDataAgencyList.updatedAt = iterator.updatedAt;
                }
            }

            if (!!datas.userAgencyLists && datas.userAgencyLists.length > 0) {
                for (const item of datas.userAgencyLists) {
                    const _data2 = new FindOneUserAgencyList();
                    _data2.id = item.id;
                    _data2.agencyId = item.agencyId;
                    _data2.userId = item.userId;
                    _data2.agency = {
                        id: item.agency.id,
                        agencyName: item.agency.agencyName,
                    };
                    _data.userAgencyLists.push(_data2);
                }
            }
            this.resData = _data;
        }
    }
}
