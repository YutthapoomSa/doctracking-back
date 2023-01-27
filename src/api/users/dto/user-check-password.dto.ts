import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserResetPasswordReqDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly hashPassword: string;
}

export class UserResetPasswordResDTO{
    @ApiProperty()
    readonly isResetProgress: boolean;

    constructor(isResetProgress: boolean) {
        this.isResetProgress = isResetProgress;
    }
}
