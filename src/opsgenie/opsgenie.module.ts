import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpsgenieService } from './opsgenie.service';
import { DatabaseModule } from '../database/database.module';
import { AwxModule } from '../awx/awx.module';
import { OpsgenieFunctions } from './opsgenie.functions';

@Module({
  imports: [HttpModule, DatabaseModule, AwxModule],
  providers: [OpsgenieService, OpsgenieFunctions],
  exports: [OpsgenieService],
})
export class OpsgenieModule {}
