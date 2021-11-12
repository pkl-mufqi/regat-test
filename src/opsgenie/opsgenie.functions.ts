import { Injectable } from '@nestjs/common';
import { AwxService } from 'src/awx/awx.service';
import { ErrorMessageEnum } from 'src/constants/enums';
import { DatabaseService } from 'src/database/database.service';
import { ActionDto } from 'src/database/dto/action.dto';
import { CommandDto } from 'src/database/dto/command.dto';
import { ParameterDto } from 'src/database/dto/parameter.dto';
import { BadRequestException } from 'src/utils/opsgenie.exceptions';

@Injectable()
export class OpsgenieFunctions {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly awxService: AwxService,
  ) {}

  /**
   * A method for checking similar action name with the previous workaround.
   * @param {CommandDto} command
   * @param {number} issueId
   */
  async checkSimilarActionName(command: CommandDto, issueId: number) {
    return await this.databaseService.searchWorkaround(
      command.actionName + ' ' + issueId,
    );
  }

  /**
   * A method for checking prompt on launch option in an awx response data.
   * @param awxResponse
   */
  async checkPromptOnLaunch(awxResponse) {
    if (
      awxResponse.ask_variables_on_launch == false ||
      awxResponse.ask_limit_on_launch == false
    ) {
      throw new BadRequestException(ErrorMessageEnum.PROMPT_ON_LAUNCH_DISABLED);
    }
  }

  /**
   * A method for checking the organization in AWX.
   * @param {CommandDto} command
   */
  async checkOrganization(command: CommandDto) {
    return await this.awxService.searchOrg(command.org);
  }

  /**
   * A method for checking the job template in AWX.
   * @param {CommandDto} command
   */
  async checkJobTemplate(command: CommandDto) {
    try {
      return await this.awxService.getJobTemplate(command.jobTemplateId);
    } catch {
      throw new BadRequestException(ErrorMessageEnum.JOB_TEMPLATE_NOT_FOUND);
    }
  }

  /**
   * A method for checking the inventory in AWX.
   * @param {CommandDto} command
   */
  async checkInventory(command: CommandDto) {
    return await this.awxService.searchInventory(
      command.inventoryName,
      command.org,
    );
  }

  /**
   * A method for checking the credential in AWX.
   * @param {CommandDto} command
   */
  async checkCredential(command: CommandDto) {
    return await this.awxService.searchCredential(
      command.credentialName,
      command.org,
    );
  }

  /**
   * A method for validating a job template command.
   * @param {CommandDto} command
   * @param {number} issueId
   */
  async jobTemplateCommandValidation(
    command: CommandDto,
    issueId: number,
  ): Promise<ActionDto> {
    const actionDto: ActionDto = new ActionDto();
    let actionParameter: ParameterDto = new ParameterDto();

    // checking organization to awx
    const checkOrganizationResult = await this.checkOrganization(command);
    if (checkOrganizationResult.data.count == 0) {
      throw new BadRequestException(
        ErrorMessageEnum.AWX_ORGANIZATION_NOT_FOUND,
      );
    }

    // checking similar action name
    const checkSimilarActionNameResult: any = await this.checkSimilarActionName(
      command,
      issueId,
    );
    if (checkSimilarActionNameResult != null) {
      throw new BadRequestException(ErrorMessageEnum.SIMILAR_ACTION_NAME);
    }

    // checking job template
    const checkJobTemplateResult = await this.checkJobTemplate(command);
    command.jobTemplateName = checkJobTemplateResult.data.name;
    command.limit = checkJobTemplateResult.data.limit;
    console.log(checkJobTemplateResult.data);

    await this.checkPromptOnLaunch(checkJobTemplateResult.data);

    actionDto.name = command.actionName + ' ' + issueId;
    actionDto.channelId = process.env.EXECUTE_ACTION_CHANNEL_ID;
    actionDto.channelType = 'rest';
    actionDto.state.enabled = true;
    actionDto.permissions.allTeamMembersAllowed = true;
    actionDto.permissions.policiesEnabled = false;
    actionParameter = {
      name: 'limit',
      description: '',
      valueType: 'string',
      required: false,
      defaultValue: [command.limit],
      parameterType: 'prompt-user',
      inputType: 'free-form',
      availableValues: [],
    };
    actionDto.parameters.push(actionParameter);
    actionParameter = {
      name: 'extra_vars',
      description: '',
      valueType: 'string',
      required: false,
      defaultValue: [command.stringExtraVars],
      parameterType: 'prompt-user',
      inputType: 'free-form',
      availableValues: [],
    };
    actionDto.parameters.push(actionParameter);

    return actionDto;
  }

  /**
   * A method for validating an ad hoc command.
   * @param {CommandDto} command
   * @param {number} issueId
   */
  async adHocCommandValidation(
    command: CommandDto,
    issueId: number,
  ): Promise<ActionDto> {
    const actionDto: ActionDto = new ActionDto();
    let actionParameter: ParameterDto = new ParameterDto();

    // checking organization to awx
    const checkOrganizationResult = await this.checkOrganization(command);
    if (checkOrganizationResult.data.count == 0) {
      throw new BadRequestException(
        ErrorMessageEnum.AWX_ORGANIZATION_NOT_FOUND,
      );
    }

    // checking similar action name
    const checkSimilarActionNameResult: any = await this.checkSimilarActionName(
      command,
      issueId,
    );
    if (checkSimilarActionNameResult != null) {
      throw new BadRequestException(ErrorMessageEnum.SIMILAR_ACTION_NAME);
    }

    // checking inventory
    const checkInventoryResult = await this.checkInventory(command);
    if (checkInventoryResult.data.count == 0) {
      throw new BadRequestException(ErrorMessageEnum.INVENTORY_NOT_FOUND);
    }
    command.inventory = +checkInventoryResult.data.results[0].id;

    // checking credential
    const checkCredentialResult = await this.checkCredential(command);
    if (checkCredentialResult.data.count == 0) {
      throw new BadRequestException(ErrorMessageEnum.CREDENTIAL_NOT_FOUND);
    }
    command.credential = +checkCredentialResult.data.results[0].id;

    actionDto.name = command.actionName + ' ' + issueId;
    actionDto.channelId = process.env.EXECUTE_ACTION_CHANNEL_ID;
    actionDto.channelType = 'rest';
    actionDto.state.enabled = true;
    actionDto.permissions.allTeamMembersAllowed = true;
    actionDto.permissions.policiesEnabled = false;
    actionParameter = {
      name: 'limit',
      description: '',
      valueType: 'string',
      required: false,
      defaultValue: [command.limit],
      parameterType: 'prompt-user',
      inputType: 'free-form',
      availableValues: [],
    };
    actionDto.parameters.push(actionParameter);

    actionParameter = {
      name: 'module_args',
      description: '',
      valueType: 'string',
      required: false,
      defaultValue: [command.moduleArgs],
      parameterType: 'prompt-user',
      inputType: 'free-form',
      availableValues: [],
    };
    actionDto.parameters.push(actionParameter);

    actionParameter = {
      name: 'extra_vars',
      description: '',
      valueType: 'string',
      required: false,
      defaultValue: [command.stringExtraVars],
      parameterType: 'prompt-user',
      inputType: 'free-form',
      availableValues: [],
    };
    actionDto.parameters.push(actionParameter);

    return actionDto;
  }

  /**
   * A method for creating an execution note for Opsgenie.
   * @param {string} actionName
   * @param {string} jobName
   * @param {number} jobId
   * @param {string} status
   * @param {string} type
   * @param {string} url
   */
  async createExecutionNote(
    actionName: string,
    jobName: string,
    jobId: number,
    status: string,
    type: string,
    url: string,
  ) {
    let note;
    if (type == 'ad_hoc_command') {
      note = {
        user: 'Regat',
        source: 'Regat Rest API',
        note:
          'Action [' +
          actionName +
          '] with Ad Hoc Command [' +
          jobName +
          '] execution status: ' +
          status +
          '. The Job ID is [' +
          jobId +
          ']. URL:\n' +
          url,
      };
    } else {
      note = {
        user: 'Regat',
        source: 'Regat Rest API',
        note:
          'Action [' +
          actionName +
          '] with Job Template [' +
          jobName +
          '] execution status: ' +
          status +
          '. The Job ID is [' +
          jobId +
          ']. URL:\n' +
          url,
      };
    }
    return note;
  }
}
