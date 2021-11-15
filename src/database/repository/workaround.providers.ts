import { Workaround } from '../models/workaround.entity';
import { WORKAROUND_REPOSITORY } from '../../constants/constants';

export const workaroundProviders = [
  {
    provide: WORKAROUND_REPOSITORY,
    useValue: Workaround,
  },
];
