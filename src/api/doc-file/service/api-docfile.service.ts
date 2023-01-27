import { UpdateDocFileDto } from './../dto/update-doc-file.dto';
import { GlobalResDTO } from './../../global-dto/global-res.dto';
import { HttpException, HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ResFindDocFileResDTO } from '../dto/res-find-doc-file.dto';
import { DataBase } from './../../../database/database.providers';
import { DocFileDB } from './../../../database/entity/doc-file.entity';
import { LogService } from './../../../helper/services/log.service';
import { ResStatus } from './../../../shared/enum/res-status.enum';
import { DocFileService } from './doc-file.service';
import { DelDocFileDto } from '../dto/del-doc-file.dto';

@Injectable()
export class ApiDocFileService implements OnApplicationBootstrap {
    private logger = new LogService(ApiDocFileService.name);

    constructor(
        @Inject(DataBase.DocFileDB) private readonly docFileRepository: typeof DocFileDB,
        private docFileService: DocFileService,
    ) {}
    onApplicationBootstrap() {
        //
    }

    async api_create(documentId: string, images: Express.Multer.File[]) {
        const tag = this.api_create.name;
        try {
            const resultFindDoc = await this.docFileService.create(documentId, images);
            return new ResFindDocFileResDTO(ResStatus.success, 'สร้างไฟล์เอกสารสำเร็จ', resultFindDoc);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // [function]────────────────────────────────────────────────────────────────────────────────
    async api_find_one(id: string) {
        const tag = this.api_find_one.name;
        try {
            const resultFindDoc = await this.docFileService.findOne(id);
            return new ResFindDocFileResDTO(ResStatus.success, 'ค้นหาไฟล์เอกสารสำเร็จ', [resultFindDoc]);
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async api_delete(body: DelDocFileDto[]) {
        const tag = this.api_delete.name;
        try {
            let res: GlobalResDTO = null;
            await this.docFileService
                .remove_by_condition(body)
                .then((resp) => {
                    res = new GlobalResDTO(ResStatus.success, 'ลบไฟล์เอกสารสำเร็จ');
                })
                .catch((err) => {
                    res = new GlobalResDTO(ResStatus.fail, 'error');
                });

            return res;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
