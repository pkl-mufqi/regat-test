import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GithubModule } from './github/github.module';
import { AwxModule } from './awx/awx.module';
import { OpsgenieModule } from './opsgenie/opsgenie.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GithubModule,
    AwxModule,
    OpsgenieModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
