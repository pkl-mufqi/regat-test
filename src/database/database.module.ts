import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { issuesProviders } from './repository/issue.providers';
import { workaroundProviders } from './repository/workaround.providers';
import { workaroundParameterProviders } from './repository/workaround-parameter.providers';
import { DatabaseService } from './database.service';
import { jobsProviders } from './repository/job.providers';

@Module({
  providers: [
    DatabaseService,
    ...databaseProviders,
    ...issuesProviders,
    ...workaroundParameterProviders,
    ...workaroundProviders,
    ...jobsProviders,
  ],
  exports: [
    DatabaseService,
    ...databaseProviders,
    ...issuesProviders,
    ...workaroundParameterProviders,
    ...workaroundProviders,
    ...jobsProviders,
  ],
})
export class DatabaseModule {}
