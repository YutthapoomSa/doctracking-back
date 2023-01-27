import { GlobalResDTO } from './../global-dto/global-res.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import path from 'path';
import { UserDB } from './../../database/entity/user.entity';
import { User } from './../../helper/guard/user.decorator';
import { editFileName, imageFileFilter } from './../../shared/utils/file-upload.utils';
import { ChangAgencyUserDTO } from './dto/chang-agency-user.dto';
import { CreateUserImage } from './dto/create-user-image.dto';
import { CreateUserReqDTO } from './dto/create-user-req.dto';
import { FindOneUserResDTO } from './dto/find-one-user-res.dto';
import { LoginUserResDTO } from './dto/login-user.dto';
import { UserPaginationDTO, UserPaginationResDTO } from './dto/pagination-user.dto';
import { UserLoginRefreshToKenReqDto } from './dto/user-login-refreshToken.dto';
import { UserLoginRequestDTO } from './dto/user-login.dto';
import { ApiUsersService } from './services/api-users.service';
import { UsersService } from './services/users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
    constructor(private readonly apiUsersService: ApiUsersService, private readonly userService: UsersService) {}

    @Post('register')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'ลงทะเบียนบัญชีผู้ใช้' })
    @ApiOkResponse({ type: FindOneUserResDTO })
    register(@Body() body: CreateUserReqDTO) {
        return this.apiUsersService.api_create(body);
    }

    @Patch('update/:userId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'อัพเดตข้อมูลผู้ใช้' })
    @ApiParam({ name: 'userId', type: 'string' })
    @ApiOkResponse({ type: FindOneUserResDTO })
    update(@Param('userId') userId: string, @Body() body: CreateUserReqDTO) {
        return this.apiUsersService.api_update(userId, body);
    }

    @Post('login')
    @ApiOkResponse({ type: LoginUserResDTO })
    login(@Body() body: UserLoginRequestDTO): Promise<LoginUserResDTO> {
        return this.apiUsersService.api_login(body);
    }

    @Delete('delete/:userId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'อัพเดตข้อมูลผู้ใช้' })
    @ApiParam({ name: 'userId', type: 'string' })
    @ApiOkResponse({ type: GlobalResDTO })
    delete(@Param('userId') userId: string): Promise<GlobalResDTO> {
        return this.apiUsersService.api_delete(userId);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: FindOneUserResDTO })
    find(@Param('id') id: string): Promise<FindOneUserResDTO> {
        return this.apiUsersService.api_findOne(`${id}`);
    }

    @Post('refreshToken')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    refreshToken(@User() user: UserDB, @Body() body: UserLoginRefreshToKenReqDto) {
        return this.apiUsersService.api_refreshToken(user, body);
    }

    @Post('changAgency')
    @ApiOkResponse({ type: FindOneUserResDTO })
    changAgency(@Body() body: ChangAgencyUserDTO): Promise<FindOneUserResDTO> {
        return this.apiUsersService.api_changAgency(body);
    }

    @Post('paginationUser')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'pagination users',
    })
    @ApiOkResponse({ type: UserPaginationResDTO })
    paginationUser(@Body() paginationDTO: UserPaginationDTO): Promise<UserPaginationResDTO> {
        return this.userService.paginationUser(paginationDTO);
    }

    @Post('uploads-image/:userId')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'เพิ่มรูปภาพของผู้ใช้งาน' })
    @UseInterceptors(
        FilesInterceptor('image', 1, {
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            storage: diskStorage({
                destination: `${path.resolve(__dirname, '..', '..', '..', 'upload', 'image-user')}`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    uploadUserImage(
        @UploadedFiles() image: Express.Multer.File[],
        @Body() body: CreateUserImage,
        @Param('userId') userId: string,
    ) {
        return this.userService.uploadUserImage(image, userId);
    }
}
