import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AwxService } from './awx.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [AwxService],
  exports: [AwxService],
})
export class AwxModule {}
