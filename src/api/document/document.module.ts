import { DocumentApproveService } from './service/document-approve.service';
import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from './../../shared/shared.module';
import { AgencyModule } from '../agency/agency.module';
import { UsersModule } from '../users/users.module';
import { DocHistoryModule } from './../doc-history/doc-history.module';
import { DocumentController } from './document.controller';
import { ApiDocumentService } from './service/api-document.service';
import { DocumentService } from './service/document.service';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => UsersModule),
        forwardRef(() => AgencyModule),
        forwardRef(() => DocHistoryModule),
    ],
    controllers: [DocumentController],
    providers: [DocumentService, ApiDocumentService, DocumentApproveService],
    exports: [DocumentService],
})
export class DocumentModule {}
