import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ResStatus } from './../../../shared/enum/res-status.enum';

export class UserLoginRequestDTO {
    @ApiProperty({
        example: 'superAdmin',
    })
    @IsString()
    @IsNotEmpty()
    readonly username: string;

    @ApiProperty({
        example: 'superAdmin',
    })
    @IsString()
    @IsNotEmpty()
    readonly password: string;
}

// ────────────────────────────────────────────────────────────────────────────────

class LoginResDTOResData {
    @ApiProperty({
        description: 'ชื่อ',
    })
    username: string;

    @ApiProperty()
    password: string;
}

export class LoginResDTO {
    @ApiProperty({
        enum: Object.keys(ResStatus).map((k) => ResStatus[k]),
        description: 'รหัสสถานะ',
    })
    resCode: ResStatus;

    @ApiProperty({
        type: () => LoginResDTOResData,
        description: 'ข้อมูล',
    })
    resData: LoginResDTOResData;

    @ApiProperty({
        description: 'ข้อความอธิบาย',
    })
    msg: string;

    constructor(resCode: ResStatus, msg: string, _username: string, _password: string) {
        this.resCode = resCode;
        this.msg = msg;
        this.resData = new LoginResDTOResData();

        // ก้อนข้อมูล init //
        this.resData.username = null;
        this.resData.password = null;

        // ─────────────────────────────────────────────────────────────────
        // (>。<) //
        // ─────────────────────────────────────────────────────────────────

        if (_username != null) {
            this.resData.username = _username;
        }
        if (_password != null) {
            this.resData.password = _password;
        }
    }
}
