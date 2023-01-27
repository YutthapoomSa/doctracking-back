import { UpdateDocFileDto } from './dto/update-doc-file.dto';
import { GlobalResDTO } from './../global-dto/global-res.dto';
import { Body, Controller, Delete, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import path from 'path';
import { editFileName, imageFileFilter, editFileNameStemTime } from './../../shared/utils/file-upload.utils';
import { CreateDocFileDTOReq } from './dto/create-doc-file.dto';
import { ApiDocFileService } from './service/api-docfile.service';
import { AuthGuard } from '@nestjs/passport';
import { loggers } from 'winston';
import { DelDocFileDto } from './dto/del-doc-file.dto';

@Controller('doc-file')
@ApiTags('doc-file')
export class DocFileController {
    constructor(private readonly apiDocFileService: ApiDocFileService) {}

    @Post('uploads-images/:documentId')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'เพิ่มไฟล์ที่ต้องการส่ง พร้อมกันได้หลายไฟล์' })
    // @ApiBearerAuth()
    // @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            storage: diskStorage({
                destination: `${path.resolve(__dirname, '..', '..', '..', 'upload', 'doc')}`,
                filename: editFileNameStemTime,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    uploadsImageProduct(@Param('documentId') documentId: string, @UploadedFiles() images: Express.Multer.File[]) {
        return this.apiDocFileService.api_create(documentId, images);
    }

    // ────────────────────────────────────────────────────────────────────────────────

    @Post('delFile')
    @ApiOperation({ summary: 'ลบไฟล์' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: GlobalResDTO })
    @ApiBody({ type: () => [DelDocFileDto] })
    create(@Body() body: DelDocFileDto[]): Promise<GlobalResDTO> {
        return this.apiDocFileService.api_delete(body);
    }
}
