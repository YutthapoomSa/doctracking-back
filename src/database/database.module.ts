import { Module } from '@nestjs/common';
import { databaseProviders, dbProviders } from './database.providers';

@Module({
    providers: [...databaseProviders, ...dbProviders],
    exports: [...databaseProviders, ...dbProviders],
})
export class DatabaseModule {}
