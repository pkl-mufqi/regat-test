import { Module } from '@nestjs/common';
import { GithubFunctions } from './github.functions';
import { GithubService } from './github.service';

@Module({
  providers: [GithubService, GithubFunctions],
  exports: [GithubService],
})
export class GithubModule {}
