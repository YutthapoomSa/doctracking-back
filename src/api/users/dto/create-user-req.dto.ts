import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDBGender, UserDBRole } from '../../../database/entity/user.entity';

export class CreateUserReqDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsOptional()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        enum: Object.keys(UserDBGender).map((k) => UserDBGender[k]),
    })
    @IsEnum(UserDBGender)
    gender: UserDBGender;

    @ApiProperty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        enum: Object.keys(UserDBRole).map((k) => UserDBRole[k]),
    })
    @IsEnum(UserDBRole)
    @IsNotEmpty()
    role: UserDBRole;

    @ApiProperty()
    @IsOptional()
    agencyId: string;

    @ApiProperty()
    @IsOptional()
    agencySecondaryId: string;
}
