import { ParameterDto } from './parameter.dto';
import { PermissionDto } from './permission.dto';
import { StateDto } from './state.dto';

export class ActionDto {
  name: string;
  channelId: string;
  channelType: string;
  state: StateDto = new StateDto();
  permissions: PermissionDto = new PermissionDto();
  parameters: ParameterDto[] = [];
}
