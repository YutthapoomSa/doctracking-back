import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from './../shared/config/config.service';
import { AgencySecondaryDB } from './entity/agency-secondary.entity';
import { AgencyDB } from './entity/agency.entity';
import { DocFileZipTempDB } from './entity/doc-file-zip-temp.entity';
import { DocFileDB } from './entity/doc-file.entity';
import { DocHistoryDB } from './entity/doc-history.entity';
import { DocumentApproveDB } from './entity/document-approve.entity';
import { DocumentExternalClerkDB } from './entity/document-external-clerk.entity';
import { DocumentInternalClerkDB } from './entity/document-internal-clerk.entity';
import { DocumentRoutingDB } from './entity/document-routing.entity';
import { DocumentDB } from './entity/document.entity';
import { LogBeforeDB } from './entity/log-before.entity';
import { UserAgencyDB } from './entity/user-agency.entity';
import { UserPasswordDB } from './entity/user-password.entity';
import { UserSocketDB } from './entity/user-socket.entity';
import { UserTokenDB } from './entity/user-token.entity';
import { UserDB } from './entity/user.entity';

export enum DataBase {
    UserDB = 'UserDB',
    UserTokenDB = 'UserTokenDB',
    UserSocketDB = 'UserSocketDB',
    UserPasswordDB = 'UserPasswordDB',
    AgencyDB = 'AgencyDB',
    DocFileDB = 'DocFileDB',
    DocHistoryDB = 'DocHistoryDB',
    DocumentDB = 'DocumentDB',
    UserAgencyDB = 'UserAgencyDB',
    DocFileZipTempDB = 'DocFileZipTempDB',
    DocumentApproveDB = 'DocumentApproveDB',
    AgencySecondaryDB = 'AgencySecondaryDB',
    DocumentRoutingDB = 'DocumentRoutingDB',
    DocumentInternalClerkDB = 'DocumentInternalClerkDB',
    DocumentExternalClerkDB = 'DocumentExternalClerkDB',
    LogBeforeDB = 'LogBeforeDB',
}

export const dbProviders = [
    {
        provide: DataBase.UserDB,
        useValue: UserDB,
    },
    {
        provide: DataBase.UserTokenDB,
        useValue: UserTokenDB,
    },
    {
        provide: DataBase.UserPasswordDB,
        useValue: UserPasswordDB,
    },

    {
        provide: DataBase.UserSocketDB,
        useValue: UserSocketDB,
    },

    {
        provide: DataBase.AgencyDB,
        useValue: AgencyDB,
    },
    {
        provide: DataBase.DocFileDB,
        useValue: DocFileDB,
    },
    {
        provide: DataBase.DocHistoryDB,
        useValue: DocHistoryDB,
    },
    {
        provide: DataBase.DocumentDB,
        useValue: DocumentDB,
    },
    {
        provide: DataBase.UserAgencyDB,
        useValue: UserAgencyDB,
    },
    {
        provide: DataBase.DocFileZipTempDB,
        useValue: DocFileZipTempDB,
    },
    {
        provide: DataBase.DocumentApproveDB,
        useValue: DocumentApproveDB,
    },
    {
        provide: DataBase.AgencySecondaryDB,
        useValue: AgencySecondaryDB,
    },
    {
        provide: DataBase.DocumentRoutingDB,
        useValue: DocumentRoutingDB,
    },
    {
        provide: DataBase.DocumentInternalClerkDB,
        useValue: DocumentInternalClerkDB,
    },
    {
        provide: DataBase.DocumentExternalClerkDB,
        useValue: DocumentExternalClerkDB,
    },
    {
        provide: DataBase.LogBeforeDB,
        useValue: LogBeforeDB,
    },
];

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async (configService: ConfigService) => {
            const sequelize = new Sequelize(configService.sequelizeOrmConfig);
            // tslint:disable-next-line:max-line-length
            sequelize.addModels([
                UserDB,
                UserTokenDB,
                UserSocketDB,
                UserPasswordDB,
                AgencyDB,
                DocFileDB,
                DocHistoryDB,
                DocumentDB,
                UserAgencyDB,
                DocFileZipTempDB,
                DocumentApproveDB,
                AgencySecondaryDB,
                DocumentRoutingDB,
                DocumentInternalClerkDB,
                DocumentExternalClerkDB,
                LogBeforeDB
            ]);
            // await sequelize.sync({ alter: true });
            // await sequelize.sync({ force: true });
            return sequelize;
        },
        inject: [ConfigService],
    },
];
