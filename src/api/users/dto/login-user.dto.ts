import { ApiProperty } from '@nestjs/swagger';
import { UserAgencyDB } from './../../../database/entity/user-agency.entity';
import { UserDB, UserDBGender } from './../../../database/entity/user.entity';
import { ResStatus } from './../../../shared/enum/res-status.enum';

class Agency {
    id: string;
    agencyName: string;
    abbreviationName: string;
    agencyCode: string;
    createdAt: string;
    updatedAt: string;
}
class AgencySecondary {
    id: string;
    agencyName: string;
    abbreviationName: string;
    agencyCode: string;
    agencyId: string;
    createdAt: string;
    updatedAt: string;
}

class LoginUserResDTOResData {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    status: boolean;

    @ApiProperty()
    image: any;

    @ApiProperty({
        enum: Object.keys(UserDBGender).map((k) => UserDBGender[k]),
    })
    gender: UserDBGender;

    @ApiProperty()
    phoneNumber: any;

    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    expire: Date;

    @ApiProperty({
        type: () => [Agency],
    })
    agency: Agency[];

    @ApiProperty({
        type: () => [AgencySecondary],
    })
    agencySecondary: AgencySecondary[];
}

export class LoginUserResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => LoginUserResDTOResData,
        description: 'ข้อมูล',
    })
    resData: LoginUserResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(
        resCode: ResStatus,
        msg: string,
        datas: UserDB,
        accessToken: string,
        refreshToken: string,
        expire: Date,
        userAgencies: UserAgencyDB[],
    ) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new LoginUserResDTOResData();
        if (!!datas) {
            this.resData.id = datas.id;
            this.resData.email = datas.email;
            this.resData.username = datas.username;
            this.resData.firstName = datas.firstName;
            this.resData.lastName = datas.lastName;
            this.resData.role = datas.role;
            this.resData.status = datas.status;
            this.resData.image = datas.image;
            this.resData.gender = datas.gender;
            this.resData.phoneNumber = datas.phoneNumber;
            this.resData.accessToken = accessToken;
            this.resData.refreshToken = refreshToken;
            this.resData.expire = expire;
            this.resData.agency = [];
            this.resData.agencySecondary = [];

            if (!!userAgencies && userAgencies.length > 0) {
                for (const iterator of userAgencies) {
                    if (!!iterator.agency) {
                        const _agency = new Agency();
                        _agency.id = iterator.agency.id;
                        _agency.agencyName = iterator.agency.agencyName;
                        _agency.abbreviationName = iterator.agency.abbreviationName;
                        _agency.agencyCode = iterator.agency.agencyCode;
                        this.resData.agency.push(_agency);
                    }

                    if (!!iterator.agencySecondary) {
                        const _agencySecondary = new AgencySecondary();
                        _agencySecondary.id = iterator.agencySecondary.id;
                        _agencySecondary.agencyCode = iterator.agencySecondary.agencyCode;
                        _agencySecondary.agencyName = iterator.agencySecondary.agencyName;
                        _agencySecondary.agencyId = iterator.agencySecondary.agencyId;
                        _agencySecondary.abbreviationName = iterator.agencySecondary.abbreviationName;
                        this.resData.agencySecondary.push(_agencySecondary);
                    }
                }
            }
        }
    }
}
