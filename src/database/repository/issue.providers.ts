import { Issue } from '../models/issue.entity';
import { ISSUE_REPOSITORY } from '../../constants/constants';

export const issuesProviders = [
  {
    provide: ISSUE_REPOSITORY,
    useValue: Issue,
  },
];
