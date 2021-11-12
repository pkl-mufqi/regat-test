import { WorkaroundParameterDto } from './workaround-parameter.dto';

export class CommandDto {
  name: string;
  actionName: string;
  type: string;
  jobTemplateId: number;
  jobTemplateName: string;
  org: string;
  limit: string;
  inventoryName: string;
  inventory: number;
  credentialName: string;
  credential: number;
  moduleName: string;
  moduleArgs: string;
  privilegeEscalation: boolean;
  extraVars: Array<WorkaroundParameterDto> = [];
  stringExtraVars: string;
}
