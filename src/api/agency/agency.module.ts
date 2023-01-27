import { forwardRef, Module } from '@nestjs/common';
import { AgencyService } from './services/agency.service';
import { AgencyController } from './agency.controller';
import { SharedModule } from './../../shared/shared.module';
import { JwtStrategy } from '../users/auth/jwt-strategy';
import { ApiUsersService } from '../users/services/api-users.service';
import { CacheUsersService } from '../users/services/cache-users.service';
import { UsersModule } from '../users/users.module';
import { DocumentModule } from '../document/document.module';
import { ApiAgencyService } from './services/api-agency.service';

@Module({
    imports: [SharedModule, forwardRef(() => UsersModule), forwardRef(() => DocumentModule)],
    controllers: [AgencyController],
    providers: [AgencyService, JwtStrategy, ApiUsersService, CacheUsersService, ApiAgencyService],
    exports: [AgencyService],
})
export class AgencyModule {}
