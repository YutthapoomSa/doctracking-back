import { forwardRef, Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { JwtStrategy } from '../users/auth/jwt-strategy';
import { UsersModule } from '../users/users.module';
import { SharedModule } from './../../shared/shared.module';
import { DocFileController } from './doc-file.controller';
import { ApiDocFileService } from './service/api-docfile.service';
import { DocFileService } from './service/doc-file.service';

@Module({
    imports: [SharedModule, forwardRef(() => UsersModule), forwardRef(() => DocumentModule)],
    controllers: [DocFileController],
    providers: [DocFileService, JwtStrategy, ApiDocFileService],
    exports: [DocFileService],
})
export class DocFileModule {}
