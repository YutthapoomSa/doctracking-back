import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '../../shared/config/config.service';
import { LogService } from './log.service';
// tslint:disable-next-line: no-var-requires
const webp = require('webp-converter');

@Injectable()
export class ConvertImageService implements OnApplicationBootstrap {
    constructor(private configService: ConfigService) {}

    onApplicationBootstrap() {
        this.isQrDir();
    }
    private logger = new LogService(ConvertImageService.name);

    fileToWebP(fileName: Express.Multer.File | any): Promise<OutputConvert> {
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(fileName.path)) return null;
                const fileNameOutPut = `${uuidv4()}.webp`;
                const fileOutPut = `${fileName.destination}/${fileNameOutPut}`;
                const result = webp.cwebp(`${fileName.path}`, fileOutPut, '-q 80');
                result.then((response: any) => {
                    fs.unlinkSync(fileName.path);
                    const json: OutputConvert = {
                        fileName: fileNameOutPut,
                        destination: `${fileName.destination}`,
                        path: fileOutPut,
                    };
                    return resolve(json);
                });
            } catch (error) {
                this.logger.error(error);
                return reject(error);
            }
        });
    }

    base64ToWebp(dataBase64: string, type: string): Promise<OutputConvert> {
        const _destination = path.join(__dirname, '../../upload');
        return new Promise((resolve, reject) => {
            try {
                const _base64Image = dataBase64.split(';base64,').pop();
                const fullPath = `${_destination}/${uuidv4()}.${type.toLocaleLowerCase()}`;
                fs.writeFileSync(fullPath, _base64Image, {
                    encoding: 'base64',
                });
                const multer = {
                    destination: _destination,
                    path: fullPath,
                };
                this.fileToWebP(multer)
                    .then((resp) => {
                        return resolve(resp);
                    })
                    .catch((err) => {
                        return reject(err);
                    });
            } catch (error) {
                this.logger.error(error);
                return reject(error);
            }
        });
    }

    getLinkImage(img: string) {
        if (!img) return null;
        return this.configService.genPointUpload.endpoint + '/' + img;
        // return `http://localhost:3100/storage/${img}`;
        // return `https://donationapi.flowmisite.com/storage/${img}`;
    }

    isQrDir() {
        const _destination = path.join(__dirname, '../../upload');
        if (!fs.existsSync(_destination)) {
            this.logger.debug(`${this.isQrDir.name} -> create upload dir.`);
            fs.mkdirSync(_destination);
        }
    }
}
export interface OutputConvert {
    fileName: string;
    destination: string;
    path: string;
}
