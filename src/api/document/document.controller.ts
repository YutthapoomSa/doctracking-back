import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseArrayPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserDB } from './../../database/entity/user.entity';
import { User } from './../../helper/guard/user.decorator';
import { ApproveDocumentDTOReq } from './dto/approve-document.dto';
import { ArchiveDocumentCreatePaginationDTO } from './dto/archive-document-create.dto';
import { ArchiveDocumentPaginationDTO, ArchiveDocumentResDTO } from './dto/archive-document.dto';
import { CreateDocumentDTOReq, CreateDocumentResDTO, CreateDocumentResDTOAll } from './dto/create-document.dto';
import { CreateForwardOrReturnDocumentDtoReq } from './dto/create-forward-return.dto';
import { FindOneDocumentResDTO } from './dto/fine-one-document-res.dto';
import { DocumentInPaginationDTO } from './dto/pagination-document-in.dto';
import { DocumentPaginationResDTO } from './dto/pagination-document.dto';
import { DocumentPaginationDTOV2, DocumentPaginationResDTOV2 } from './dto/pagination-documentv2.dto';
import { PaginationLogBeforeDTO, PaginationLogBeforeResDTO } from './dto/pagination-log-before.dto';
import { PaginationSearchDocumentDTO, PaginationSearchDocumentResDTO } from './dto/pagination-search-document.dto';
import { DocumentSummaryPaginationDTO } from './dto/pagination-summary-document.dto';
import { SummaryDocumentDTOReq, SummaryDocumentDTORes } from './dto/summary-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiDocumentService } from './service/api-document.service';
import { DocumentService } from './service/document.service';

@Controller('document')
@ApiTags('document')
export class DocumentController {
    constructor(private readonly apiDocumentService: ApiDocumentService, private documentService: DocumentService) { }

    @Post('create')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'สร้างเอกสาร' })
    @ApiBody({ type: CreateDocumentDTOReq })
    @ApiOkResponse({ type: CreateDocumentResDTO })
    create(@User() user: UserDB, @Body() createDocumentDto: CreateDocumentDTOReq): Promise<CreateDocumentResDTO> {
        return this.apiDocumentService.api_create(user, createDocumentDto);
    }

    @Post('createDuplicate')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'สร้างเอกสาร' })
    @ApiBody({ type: [CreateDocumentDTOReq] })
    @ApiOkResponse({ type: [CreateDocumentResDTOAll] })
    createDuplicate(@User() user: UserDB, @Body() createDocumentDto: CreateDocumentDTOReq[]): Promise<CreateDocumentResDTOAll> {
        return this.apiDocumentService.api_create_duplicate(user, createDocumentDto);
    }

    @Post('approve')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'พิจารณาการอนุมัติเอกสาร' })
    @ApiBody({ type: ApproveDocumentDTOReq })
    @ApiOkResponse({ type: FindOneDocumentResDTO })
    approve(@User() user: UserDB, @Body() body: ApproveDocumentDTOReq): Promise<FindOneDocumentResDTO> {
        return this.apiDocumentService.api_approve(user, body);
    }

    @Post('findOneDocument/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiParam({ name: 'id', description: 'ค้นหาได้ด้วย id , barcode , governmentDocNo' })
    @ApiOperation({ summary: 'ค้นหาเอกสาร ' })
    @ApiOkResponse({ type: FindOneDocumentResDTO })
    findOne(@User() user: UserDB, @Param('id') id: string): Promise<FindOneDocumentResDTO> {
        return this.apiDocumentService.api_find_one_document(user, id);
    }

    @Patch('update/:documentId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'แก้ไขเอกสาร' })
    @ApiOkResponse({ type: CreateDocumentResDTO })
    update(
        @User() user: UserDB,
        @Param('documentId') documentId: string,
        @Body() updateDocumentDto: UpdateDocumentDto,
    ): Promise<CreateDocumentResDTO> {
        return this.apiDocumentService.api_update(user, documentId, updateDocumentDto);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'ลบเอกสาร' })
    @ApiOkResponse({ type: CreateDocumentResDTOAll })
    remove(@Param('id') id: string) {
        return this.apiDocumentService.api_remove(id);
    }

    @Post('paginationDocument')
    @ApiOperation({ summary: 'pagination document' })
    @ApiOkResponse({ type: DocumentPaginationResDTO })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({
        name: 'agencyRecipientId',
        required: false,
    })
    @ApiQuery({
        name: 'agencySecondaryRecipientId',
        required: false,
    })
    @ApiQuery({
        name: 'agencySenderId',
        required: false,
    })
    @ApiQuery({
        name: 'agencySecondarySenderId',
        required: false,
    })
    @ApiQuery({
        name: 'documentExternalIds',
        description: 'หมายเลข ธุรการภายนอก',
        required: false,
        type: [Number],
    })
    @ApiQuery({
        name: 'documentInternalIds',
        description: 'หมายเลข ธุรการภายใน',
        required: false,
        type: [Number],
    })
    paginationDocument(
        @User() userDB: UserDB,
        @Body() paginationDTO: DocumentPaginationDTOV2,
        @Query('agencyRecipientId') agencyRecipientId: string,
        @Query('agencySecondaryRecipientId') agencySecondaryRecipientId: string,
        @Query('agencySenderId') agencySenderId: string,
        @Query('agencySecondarySenderId') agencySecondarySenderId: string,
        @Query('documentExternalIds', new DefaultValuePipe([]), new ParseArrayPipe({ items: Number, separator: ',' }))
        documentExternalIds?: number[],
        @Query('documentInternalIds', new DefaultValuePipe([]), new ParseArrayPipe({ items: Number, separator: ',' }))
        documentInternalIds?: number[],
    ): Promise<DocumentPaginationResDTOV2> {
        // api นี้ยังเเก้ไม่เสร็จ
        return this.documentService.documentPagination(
            userDB,
            paginationDTO,
            agencyRecipientId,
            agencySecondaryRecipientId,
            agencySenderId,
            agencySecondarySenderId,
            documentExternalIds,
            documentInternalIds,
        );
    }

    @Post('paginationDocumentSummary')
    @ApiOperation({ summary: 'pagination document สรุปรายการ' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: DocumentPaginationResDTO })
    paginationDocumentSummary(@User() user: UserDB, @Body() paginationDTO: DocumentSummaryPaginationDTO) {
        return this.documentService.paginationDocumentSummary(user, paginationDTO);
    }

    @Post('summary')
    @ApiOperation({ summary: 'สรุปรายการ' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: SummaryDocumentDTORes })
    summary(@User() user: UserDB, @Body() body: SummaryDocumentDTOReq): Promise<SummaryDocumentDTORes> {
        return this.apiDocumentService.api_summary(user, body);
    }

    @Post('summaryCountDay')
    @ApiOperation({ summary: 'สรุปรายการ' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: SummaryDocumentDTORes })
    summaryCountDay(@User() user: UserDB, @Body() body: SummaryDocumentDTOReq): Promise<SummaryDocumentDTORes> {
        return this.apiDocumentService.api_summary(user, body);
    }

    @Post('paginationDocumentHistory')
    @ApiOperation({ summary: 'pagination document ขาเข้า' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: DocumentPaginationResDTO })
    paginationDocumentIn(
        @User() user: UserDB,
        @Body() paginationDTO: DocumentInPaginationDTO,
    ): Promise<DocumentPaginationResDTOV2> {
        return this.documentService.paginationDocumentIn(user, paginationDTO);
    }

    @Get('findOneDocumentArray/:id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiParam({ name: 'id', description: 'ค้นหาได้ด้วย id , barcode , governmentDocNo' })
    @ApiOperation({ summary: 'ค้นหาเอกสาร แบบ array' })
    @ApiOkResponse({ type: FindOneDocumentResDTO })
    findOneDocumentArray(@User() user: UserDB, @Param('id') id: string) {
        return this.apiDocumentService.api_find_one_document_array(user, id);
    }

    @Post('findOneDocumentByStatus/:id/:status')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiParam({ name: 'id', description: 'ค้นหาได้ด้วย id , barcode , governmentDocNo' })
    @ApiOperation({ summary: 'ค้นหาเอกสาร ' })
    @ApiOkResponse({ type: FindOneDocumentResDTO })
    findOneDocumentByStatus(
        @User() user: UserDB,
        @Param('id') id: string,
        @Param('status') status: string,
    ): Promise<FindOneDocumentResDTO> {
        return this.apiDocumentService.api_find_one_document_by_status(user, id, status);
    }

    @Post('paginationSearchDocument')
    @ApiOperation({ summary: 'pagination search document' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: PaginationSearchDocumentResDTO })
    @ApiQuery({
        name: 'agency',
        required: false,
    })
    @ApiQuery({
        name: 'agencySecondary',
        required: false,
    })
    paginationSearchDocument(
        @User() user: UserDB,
        @Body() paginationDTO: PaginationSearchDocumentDTO,
        @Query('agency') agency: string,
        @Query('agencySecondary') agencySecondary: string,
    ): Promise<PaginationSearchDocumentResDTO> {
        return this.documentService.paginationSearchDocument(user, paginationDTO, agency, agencySecondary);
    }

    @Post('forwardOrReturnDocument')
    @ApiOperation({ summary: 'api ในการส่งต่อเอกสารหรือส่ง' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({ type: [CreateForwardOrReturnDocumentDtoReq] })
    // @ApiOkResponse({ type: PaginationSearchDocumentResDTO })
    forwardOrReturnDocument(@User() user: UserDB, @Body() body: CreateForwardOrReturnDocumentDtoReq[]) {
        return this.apiDocumentService.api_forward_or_return_document(user, body);
    }

    @Post('archiveDocument')
    @ApiOperation({ summary: 'api ดูเอกสารที่ตัวเองรับในคลังของตัวเอง' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: ArchiveDocumentResDTO })
    archiveDocument(@Body() paginationDTO: ArchiveDocumentPaginationDTO, @User() user: UserDB): Promise<any> {
        return this.documentService.archiveDocument(paginationDTO, user);
    }

    @Post('archiveDocumentCreate')
    @ApiOperation({ summary: 'api ดูเอกสารที่ตัวเองสร้างในคลังของตัวเอง' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: ArchiveDocumentCreatePaginationDTO })
    archiveDocumentCreate(
        @Body() paginationDTO: ArchiveDocumentCreatePaginationDTO,
        @User() user: UserDB,
    ): Promise<any> {
        return this.documentService.archiveDocumentCreate(paginationDTO, user);
    }

    @Post('paginationLogBefore')
    @ApiOperation({ summary: 'pagination log before' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: PaginationLogBeforeResDTO })
    paginationLogBefore(@User() user: UserDB, @Body() paginationDTO: PaginationLogBeforeDTO) {
        return this.documentService.paginationLogBefore(user, paginationDTO);
    }
}
