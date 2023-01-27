import { ZipFileService } from './../helper/services/zip-file.service';
import { DatabaseModule } from './../database/database.module';
import { ConvertImageService } from './../helper/services/convert-image.service';
import { HttpModule } from '@nestjs/axios';
import { Global, Module, CacheModule } from '@nestjs/common';
import { PaginationService } from '../helper/services/pagination/pagination.service';
import { AppService } from './../helper/services/app.service';
import { EncryptionService } from './../helper/services/encryption.service';
import { LineNotifyService } from './../helper/services/line-notify/line-notify.service';
import { ConfigService } from './config/config.service';

@Global()
@Module({
    providers: [
        ConfigService,
        PaginationService,
        EncryptionService,
        ConvertImageService,
        AppService,
        LineNotifyService,
        ZipFileService,
    ],
    exports: [
        ConfigService,
        PaginationService,
        EncryptionService,
        ConvertImageService,
        AppService,
        LineNotifyService,
        CacheModule.register(),
        DatabaseModule,
        ZipFileService,
    ],
    imports: [
        HttpModule.register({
            timeout: 60000,
            // maxRedirects: 5,
        }),
        CacheModule.register(),
        DatabaseModule,
    ],
    controllers: [],
})
export class SharedModule {}
