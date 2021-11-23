import { WorkaroundDto } from './workaround.dto';

export class ListWorkaroundsDto {
  count: number;
  issueNumber: number;
  _title: string;
  result: WorkaroundDto[] = [];
}
