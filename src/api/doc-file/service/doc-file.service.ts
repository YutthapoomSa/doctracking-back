import { Sequelize } from 'sequelize-typescript';
import { HttpException, HttpStatus, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UpdateDocFileDto } from '../dto/update-doc-file.dto';
import { DataBase } from './../../../database/database.providers';
import { DocFileDB } from './../../../database/entity/doc-file.entity';
import { LogService } from './../../../helper/services/log.service';
import { ApiDocFileService } from './api-docfile.service';
import { DelDocFileDto } from '../dto/del-doc-file.dto';
@Injectable()
export class DocFileService implements OnApplicationBootstrap {
    private logger = new LogService(ApiDocFileService.name);

    constructor(
        @Inject('SEQUELIZE') private readonly sequelizes: Sequelize,

        @Inject(DataBase.DocFileDB) private readonly docFileRepository: typeof DocFileDB,
    ) {}
    onApplicationBootstrap() {
        //
    }

    // [function]────────────────────────────────────────────────────────────────────────────────

    async create(documentId: string, images: Express.Multer.File[]) {
        const tag = this.create.name;
        try {
            const docFiles: DocFileDB[] = [];
            for (const image of images) {
                const imageFile = new DocFileDB();
                imageFile.fileName = image.filename;
                imageFile.documentId = documentId;
                imageFile.fileSize = image.size;
                docFiles.push(imageFile);
            }

            if (docFiles.length === 0) return null;

            return await this.docFileRepository.bulkCreate(JSON.parse(JSON.stringify(docFiles)));
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    findAll() {
        return `This action returns all docFile`;
    }

    async findOne(id: string) {
        const tag = this.findOne.name;
        try {
            const findOneDocFile = await this.docFileRepository.findOne();
            return findOneDocFile;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    update(id: number, updateDocFileDto: UpdateDocFileDto) {
        return `This action updates a #${id} docFile`;
    }

    async remove(_id: string) {
        const tag = this.remove.name;
        try {
            return await this.docFileRepository.destroy({
                where: {
                    id: _id,
                },
            });
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove_by_condition(body: DelDocFileDto[]) {
        const tag = this.remove_by_condition.name;
        const _t = await this.sequelizes.transaction();
        try {
            for (const iterator of body) {
                await this.docFileRepository.destroy({
                    where: {
                        documentId: iterator.documentId,
                        id: iterator.fileId,
                    },
                    transaction: _t,
                });
            }
            await _t.commit();
            return null;
        } catch (error) {
            await _t.rollback();
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
