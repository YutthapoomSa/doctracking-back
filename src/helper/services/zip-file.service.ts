import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from './../../helper/services/log.service';

@Injectable()
export class ZipFileService implements OnApplicationBootstrap {
    private logger = new LogService(ZipFileService.name);

    onApplicationBootstrap() {
        // const pathUploadPath = path.join(__dirname, './../../../', 'upload', 'doc', 'img_forest.jpeg');
        // this.zipFile([pathUploadPath]);
    }

    zipFile(paths: string[], nameFile?: string) {
        // const uuid = uuidv4();
        // const uuid = '8df5c0ca-9952-4ef8-98e4-0538077131e1';
        // const pathUploadPath = path.join(__dirname, './../../../', 'upload', `${uuid}`);
        // const fileName = nameFile ? `${nameFile}.zip` : `${uuid}.zip`;
        // const pathFileZipTemp = path.join(__dirname, './../../../', 'upload', 'file-zip-temp', `${fileName}`);
        // try {
        //     this.logger.debug(`pathUploadPath -> `, pathUploadPath);
        //     this.logger.debug(`pathFileZipTemp -> `, pathFileZipTemp);
        //     if (!fs.existsSync(pathUploadPath)) fs.mkdirSync(pathUploadPath);
        //     // for (const iterator of paths) {
        //     //     this.logger.debug(`origin -> `, iterator);
        //     //     this.logger.debug(`des -> `, pathUploadPath);
        //     //     this.logger.debug(`origin -> ex `, fs.existsSync(iterator));
        //     //     this.logger.debug(`des -> ex `, fs.existsSync(pathUploadPath));
        //     //     fs.copy(iterator, pathUploadPath)
        //     //         .then(() => console.log('success!'))
        //     //         .catch((err) => console.error(err));
        //     // }
        //     // fs.copy(
        //     //     '/Users/burmdev/Documents/burmdev/tracking-documents-backend/upload/doc/img_forest.jpeg',
        //     //     '/Users/burmdev/Documents/burmdev/tracking-documents-backend/upload/8df5c0ca-9952-4ef8-98e4-0538077131e1',
        //     //     {
        //     //         overwrite: true,
        //     //     },
        //     // )
        //     //     .then(() => console.log('success!'))
        //     //     .catch((err) => console.error(err));
        //     const zip = new JSZip();
        //     zip.folder(pathUploadPath);
        //     zip.generateAsync({ type: 'blob' }).then((content) => {
        //         saveAs(content, pathFileZipTemp);
        //     });
        // if (fs.existsSync(pathUploadPath)) fs.rmSync(pathUploadPath, { recursive: true, force: true });
    }
    catch(error) {
        // if (fs.existsSync(pathUploadPath)) fs.rmSync(pathUploadPath, { recursive: true, force: true });
    }
}
