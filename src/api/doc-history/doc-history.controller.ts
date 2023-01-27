import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDB } from './../../database/entity/user.entity';
import { User } from './../../helper/guard/user.decorator';
import { AcceptDocHistoryResDto } from './dto/accept-create-doc-history.dto';
import { CreateDocHistoryDtoReq } from './dto/create-doc-history.dto';
import { ApiDocHistoryService } from './service/api-doc-history.service';

@Controller('doc-history')
@ApiTags('doc-history')
export class DocHistoryController {
    constructor(private readonly apiDocHistoryService: ApiDocHistoryService) {}

    @Post('updateHistoryDocuments')
    @ApiOperation({ summary: 'update history เอกสาร' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({ type: [CreateDocHistoryDtoReq] })
    acceptDocument(@User() user: UserDB, @Body() body: CreateDocHistoryDtoReq[]): Promise<AcceptDocHistoryResDto> {
        return this.apiDocHistoryService.api_accept_doc(user, body);
    }

    @Get('testUserDecorator')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    testUserDecorator(@User() user: UserDB) {
        return this.apiDocHistoryService.testUserDecorator(user);
    }
}
