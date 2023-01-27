import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import moment from 'moment-timezone';
import { ResStatus } from './../../../shared/enum/res-status.enum';
moment.tz.setDefault('Asia/Bangkok');

export class UserLoginRefreshToKenReqDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

// ────────────────────────────────────────────────────────────────────────────────

class UserLoginRefreshToKenResData {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    expire: string;
}

export class LoginResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => UserLoginRefreshToKenResData,
        description: 'ข้อมูล',
    })
    resData: UserLoginRefreshToKenResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, _accessToken: string, _refreshToken: string, _expire: Date) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new UserLoginRefreshToKenResData();

        // ─────────────────────────────────────────────────────────────────
        // ก้อนข้อมูล init
        this.resData.accessToken = null;
        this.resData.refreshToken = null;
        this.resData.expire = null;

        // ─────────────────────────────────────────────────────────────────
        //                          (>。<)                                 //
        // ─────────────────────────────────────────────────────────────────

        // Pattern ขาออก
        if (_accessToken != null) {
            this.resData.accessToken = _accessToken;
        }
        if (_refreshToken != null) {
            this.resData.refreshToken = _refreshToken;
        }
        if (_expire != null) {
            this.resData.expire = moment(_expire).format('YYYY-MM-DD HH:mm:ss');
        }
        // ─────────────────────────────────────────────────────────────────
    }
}
