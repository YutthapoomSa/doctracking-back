import { HttpException, HttpStatus, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { CreateDocFileZipTempDto } from '../dto/create-doc-file-zip-temp.dto';
import { UpdateDocFileZipTempDto } from '../dto/update-doc-file-zip-temp.dto';
import { DataBase } from './../../../database/database.providers';
import { DocFileZipTempDB } from './../../../database/entity/doc-file-zip-temp.entity';
@Injectable()
export class DocFileZipTempService implements OnApplicationBootstrap {
    private logger = new Logger(DocFileZipTempService.name);
    constructor(@Inject(DataBase.DocFileZipTempDB) private readonly docFileZipTempRepository: typeof DocFileZipTempDB) {
        //
    }
    onApplicationBootstrap() {
        // this.cronDeleteFileZipTemp();
    }
    create(createDocFileZipTempDto: CreateDocFileZipTempDto) {
        return 'This action adds a new docFileZipTemp';
    }

    findAll() {
        return `This action returns all docFileZipTemp`;
    }

    findOne(id: number) {
        return `This action returns a #${id} docFileZipTemp`;
    }

    update(id: number, updateDocFileZipTempDto: UpdateDocFileZipTempDto) {
        return `This action updates a #${id} docFileZipTemp`;
    }

    remove(id: number) {
        return `This action removes a #${id} docFileZipTemp`;
    }

    async uploadDocFileZipTemp(images: Express.Multer.File[]) {
        const tag = this.uploadDocFileZipTemp.name;
        try {
            const docFileZipTemp: DocFileZipTempDB[] = [];
            for (const image of images) {
                const imageFile = new DocFileZipTempDB();
                imageFile.fileZipName = image.filename;
                let _expire = moment().add(1, 'd');
                _expire = _expire.add(5, 'm');
                imageFile.expire = _expire.toISOString();
                docFileZipTemp.push(imageFile);
                this.logger.debug(imageFile);
            }
            for (const item of docFileZipTemp) {
                await item.save();
            }
            return docFileZipTemp;
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
    async cronDeleteFileZipTemp() {
        const tag = this.cronDeleteFileZipTemp.name;
        try {
            const findAllDateExpire = await this.docFileZipTempRepository.findAll();
            this.logger.debug('time now -> ', moment().format('HH:mm:ss'));
            const timeNow = moment().format('HH:mm:ss');
            for (const item of findAllDateExpire) {
                this.logger.debug('findAllDateExpire -> ', moment(item.expire).format('HH:mm:ss'));
                const timeExpireDocFilZip = moment(item.expire).format('HH:mm:ss');
                if (timeNow > timeExpireDocFilZip) {
                    // สามารถลบได้
                    // ตรวจสอบไฟล์ในโฟลเดอร์กับไฟล์ใน db ว่าตรงกันมั้ยถ้าตรงกันทำการลบ

                    const pathUploadPath = path.join(__dirname, './../../../', 'upload', 'file-zip-temp');
                    this.logger.debug('pathUploadPath -> ', pathUploadPath);
                    fs.readdirSync('upload/file-zip-temp').forEach((file) => {
                        if (file === item.fileZipName) {
                            console.log(file);
                            this.logger.debug('can delete infolder');
                            fs.unlinkSync('upload/file-zip-temp/' + file);
                        }
                    });
                    // ลบข้อมูลใน db
                    await item.destroy();
                }
            }
        } catch (error) {
            console.error(`${tag} -> `, error);
            this.logger.error(`${tag} -> `, error);
            throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
