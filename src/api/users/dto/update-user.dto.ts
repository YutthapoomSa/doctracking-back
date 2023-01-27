import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserDBGender, UserDBRole } from './../../../database/entity/user.entity';

export class UpdateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    readonly id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly username: string;

    @ApiProperty()
    // @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly lastName: string;

    @ApiProperty({
        enum: [UserDBRole.user, UserDBRole.superAdmin],
    })
    @IsOptional()
    @IsEnum(UserDBRole)
    @IsNotEmpty()
    readonly role: UserDBRole;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;

    @ApiProperty()
    @IsString()
    image: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    point: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    pointTotal: number;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty({
        enum: [UserDBGender.male, UserDBGender.female, UserDBGender.other],
    })
    @IsNotEmpty()
    @IsEnum(UserDBGender)
    gender: UserDBGender;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    state: string;

    @ApiProperty()
    @IsString()
    zipCode: string;

    @ApiProperty()
    @IsString()
    phoneNumber: string;
}
