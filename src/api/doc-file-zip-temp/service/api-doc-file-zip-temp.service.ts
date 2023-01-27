import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from './../../../helper/services/log.service';
import { DocumentService } from './../../document/service/document.service';

@Injectable()
export class ApiDocFileZipTempService implements OnApplicationBootstrap {
    private logger = new LogService(ApiDocFileZipTempService.name);

    constructor(private documentService: DocumentService) {}
    onApplicationBootstrap() {
        //
    }

    // [function]────────────────────────────────────────────────────────────────────────────────

    async api_create() {
        const tag = this.api_create.name;
        try {
            return '';
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    findAll() {
        return `This action returns all document`;
    }

    findOne(id: number) {
        return `This action returns a #${id} document`;
    }

    update(id: number) {
        return `This action updates a #${id} document`;
    }

    remove(id: number) {
        return `This action removes a #${id} document`;
    }
}
