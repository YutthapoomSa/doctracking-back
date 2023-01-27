import { forwardRef, Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { UsersModule } from '../users/users.module';
import { SharedModule } from './../../shared/shared.module';
import { DocHistoryController } from './doc-history.controller';
import { ApiDocHistoryService } from './service/api-doc-history.service';
import { DocHistoryService } from './service/doc-history.service';

@Module({
    imports: [SharedModule, forwardRef(() => UsersModule), forwardRef(() => DocumentModule)],
    controllers: [DocHistoryController],
    providers: [DocHistoryService, ApiDocHistoryService],
    exports: [DocHistoryService, ApiDocHistoryService],
})
export class DocHistoryModule {}
