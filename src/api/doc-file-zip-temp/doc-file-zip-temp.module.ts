import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from './../../shared/shared.module';
import { UsersModule } from './../users/users.module';
import { DocFileZipTempController } from './doc-file-zip-temp.controller';
import { DocFileZipTempService } from './service/doc-file-zip-temp.service';

@Module({
    imports: [SharedModule, forwardRef(() => UsersModule)],
    controllers: [DocFileZipTempController],
    providers: [DocFileZipTempService],
    exports: [DocFileZipTempService],
})
export class DocFileZipTempModule {}
