export class WorkaroundDto {
  workaroundId: number;
  issueId: number;
  actionName: string;
  type: string;
  jobTemplateId: number;
  jobTemplateName: string;
  parameters: Array<number> = [];
  inventory: number;
  module_name: string;
  module_args: string;
  limit: string;
  credential: number;
  privilegeEscalation: boolean;
}
