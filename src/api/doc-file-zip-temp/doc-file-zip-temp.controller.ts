import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import path from 'path';
import { editFileName, imageFileFilter } from './../../shared/utils/file-upload.utils';
import { CreateDocFileZipTempDto } from './dto/create-doc-file-zip-temp.dto';
import { UpdateDocFileZipTempDto } from './dto/update-doc-file-zip-temp.dto';
import { DocFileZipTempService } from './service/doc-file-zip-temp.service';

@ApiTags('doc-file-zip-temp')
@Controller('doc-file-zip-temp')
export class DocFileZipTempController {
    constructor(private readonly docFileZipTempService: DocFileZipTempService) {}

    @Post()
    create(@Body() createDocFileZipTempDto: CreateDocFileZipTempDto) {
        return this.docFileZipTempService.create(createDocFileZipTempDto);
    }

    @Get()
    findAll() {
        return this.docFileZipTempService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.docFileZipTempService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDocFileZipTempDto: UpdateDocFileZipTempDto) {
        return this.docFileZipTempService.update(+id, updateDocFileZipTempDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.docFileZipTempService.remove(+id);
    }

    @Post('uploads-images/')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'เพิ่มไฟล์หลายๆ ไฟล์แบบไฟล์ zip' })
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            storage: diskStorage({
                destination: `${path.resolve(__dirname, '..', '..', '..', 'upload', 'file-zip-temp')}`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    uploadDocFileZipTemp(@UploadedFiles() images: Express.Multer.File[], @Body() body: CreateDocFileZipTempDto) {
        return this.docFileZipTempService.uploadDocFileZipTemp(images);
    }
}
