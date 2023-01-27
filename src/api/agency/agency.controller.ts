import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserDB } from './../../database/entity/user.entity';
import { User } from './../../helper/guard/user.decorator';
import { GlobalResDTO } from './../global-dto/global-res.dto';
import { CreateAgencySecondaryDTOReq, CreateAgencySecondaryResDTO } from './dto/create-agency-secondary.dto';
import { CreateAgencyDTOReq, CreateAgencyResDTO } from './dto/create-agency.dto';
import { GetAgencyResDTO } from './dto/get-agency.dto';
import { AgencyPaginationDTO, AgencyPaginationResDTO } from './dto/pagination-agency.dto';
import { UpdateAgencyDto as UpdateAgencyDTO } from './dto/update-agency.dto';
import { AgencyService } from './services/agency.service';
import { ApiAgencyService } from './services/api-agency.service';

@Controller('agency')
@ApiTags('agency')
export class AgencyController {
    constructor(private readonly apiAgencyService: ApiAgencyService, private readonly agencyService: AgencyService) {}

    @Post('create')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'สร้างหน่วยงาน' })
    @ApiOkResponse({ type: CreateAgencyResDTO })
    create(@User() user: UserDB, @Body() createAgencyDto: CreateAgencyDTOReq): Promise<CreateAgencyResDTO> {
        return this.apiAgencyService.api_create(user, createAgencyDto);
    }

    @Patch('update/:agencyId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'แก้ไขหน่วยงาน' })
    @ApiOkResponse({ type: CreateAgencyResDTO })
    @ApiParam({ name: 'agencyId', type: 'string' })
    update(
        @Param('agencyId') agencyId: string,
        @User() user: UserDB,
        @Body() updateAgencyDto: UpdateAgencyDTO,
    ): Promise<CreateAgencyResDTO> {
        return this.apiAgencyService.api_update(user, agencyId, updateAgencyDto);
    }

    @Delete('del/:agencyId')
    @ApiOperation({ summary: 'ลบหน่วยงาน' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiParam({ name: 'agencyId', type: 'string' })
    @ApiOkResponse({ type: GlobalResDTO })
    del(@User() user: UserDB, @Param('agencyId') agencyId: string): Promise<GlobalResDTO> {
        return this.apiAgencyService.api_del(user, agencyId);
    }

    @Post('paginationAgency')
    @ApiOperation({ summary: 'pagination ของ agency' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: AgencyPaginationResDTO })
    paginationAgency(@Body() paginationDTO: AgencyPaginationDTO): Promise<AgencyPaginationResDTO> {
        return this.agencyService.paginationAgency(paginationDTO);
    }

    @Get('getAllAgency')
    getAllAgency() {
        return this.agencyService.getAllAgency();
    }

    @Post('createAgencySecondary')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'สร้างหน่วยงาน' })
    @ApiOkResponse({ type: CreateAgencySecondaryResDTO })
    createAgencySecondary(@User() user: UserDB, @Body() createAgencySecondaryDto: CreateAgencySecondaryDTOReq) {
        return this.apiAgencyService.api_create_agency_secondary(user, createAgencySecondaryDto);
    }

    @Get('getAllAgencySecondary/:agencyId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'ค้นหาหน่วยงานย่อยทั้งหมดจาก id agency' })
    @ApiOkResponse({ type: CreateAgencySecondaryResDTO })
    getAllAgencySecondary(@User() user: UserDB, @Param('agencyId') agencyId: string) {
        return this.apiAgencyService.api_get_all_agency_secondary(user, agencyId);
    }

    @Get('getAgency/:agencyId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'ค้นหาหน่วยงาน' })
    @ApiOkResponse({ type: GetAgencyResDTO })
    getAgency(@User() user: UserDB, @Param('agencyId') agencyId: string) {
        return this.apiAgencyService.api_get_agency(user, agencyId);
    }
}
