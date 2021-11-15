import { FilterDto } from './filter.dto';

export class PolicyDto {
  type: string;
  name: string;
  policyDescription: string;
  description: string;
  enabled: string;
  continue: boolean;
  labels: Array<string> = [];
  filter: FilterDto;
  actions: Array<string> = [];
}
