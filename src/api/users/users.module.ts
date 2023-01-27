import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from './../../shared/shared.module';
import { AgencyModule } from '../agency/agency.module';
import { DocFileModule } from '../doc-file/doc-file.module';
import { DocHistoryModule } from '../doc-history/doc-history.module';
import { DocumentModule } from '../document/document.module';
import { JwtStrategy } from './auth/jwt-strategy';
import { ApiUsersService } from './services/api-users.service';
import { CacheUsersService } from './services/cache-users.service';
import { UserAgencyService } from './services/user-agency.service';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => AgencyModule),
        forwardRef(() => DocFileModule),
        forwardRef(() => DocHistoryModule),
        forwardRef(() => DocumentModule),
    ],

    controllers: [UsersController],
    providers: [UsersService, JwtStrategy, ApiUsersService, CacheUsersService, UserAgencyService],
    exports: [UsersService, UserAgencyService, ApiUsersService],
})
export class UsersModule {}
