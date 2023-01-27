import { DocumentApproveService } from './api/document/service/document-approve.service';
import { UserAgencyService } from './api/users/services/user-agency.service';
import { CacheModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AgencyModule } from './api/agency/agency.module';
import { DocFileModule } from './api/doc-file/doc-file.module';
import { DocHistoryModule } from './api/doc-history/doc-history.module';
import { DocumentModule } from './api/document/document.module';
import { UsersModule } from './api/users/users.module';
import { ConvertImageService } from './helper/services/convert-image.service';
import { EncryptionService } from './helper/services/encryption.service';
import { LogService } from './helper/services/log.service';
import { PaginationService } from './helper/services/pagination/pagination.service';
import { SharedModule } from './shared/shared.module';
import { DocFileZipTempModule } from './api/doc-file-zip-temp/doc-file-zip-temp.module';
import { TestModule } from './api/test/test.module';
@Module({
    imports: [
        CacheModule.register(),
        UsersModule,
        SharedModule,
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 60,
        }),
        DocumentModule,
        DocFileModule,
        DocHistoryModule,
        AgencyModule,
        DocFileZipTempModule,
        TestModule,
    ],
    providers: [UserAgencyService, LogService, ConvertImageService, EncryptionService, PaginationService],
})
export class AppModule {}
