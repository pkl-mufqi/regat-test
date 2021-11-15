import { ConditionDto } from './condition.dto';

export class FilterDto {
  type: string;
  conditions: ConditionDto[];
}
