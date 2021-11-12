import { Job } from '../models/job.entity';
import { JOB_REPOSITORY } from '../../constants/constants';

export const jobsProviders = [
  {
    provide: JOB_REPOSITORY,
    useValue: Job,
  },
];
