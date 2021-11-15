import { Sequelize } from 'sequelize-typescript';
import {
  SEQUELIZE,
  DEVELOPMENT,
  TEST,
  PRODUCTION,
} from '../constants/constants';
import { databaseConfig } from './database.config';
import { Job } from './models/job.entity';
import { Issue } from './models/issue.entity';
import { WorkaroundParameter } from './models/workaround-parameter.entity';
import { Workaround } from './models/workaround.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.production;
      }
      const sequelize = new Sequelize(config);
      sequelize.addModels([Issue, Workaround, WorkaroundParameter, Job]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
