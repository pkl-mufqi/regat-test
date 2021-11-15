import { WorkaroundParameter } from '../models/workaround-parameter.entity';
import { WORKAROUND_PARAMETER_REPOSITORY } from '../../constants/constants';

export const workaroundParameterProviders = [
  {
    provide: WORKAROUND_PARAMETER_REPOSITORY,
    useValue: WorkaroundParameter,
  },
];
