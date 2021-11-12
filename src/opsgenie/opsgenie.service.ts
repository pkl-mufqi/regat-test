import { Injectable } from '@nestjs/common';
import { PolicyDto } from '../database/dto/policy.dto';
import {
  URL_OPSGENIE_ALERT,
  URL_OPSGENIE_CREATE_ACTION,
  URL_OPSGENIE_POLICY,
} from '../constants/constants';
import { HttpService } from '@nestjs/axios';
import { ActionDto } from 'src/database/dto/action.dto';
import { OpsgenieFunctions } from './opsgenie.functions';
import { CommandDto } from 'src/database/dto/command.dto';
import { NotAcceptableException } from 'src/utils/opsgenie.exceptions';
import { CommandTypeEnum, ErrorMessageEnum } from 'src/constants/enums';

@Injectable()
export class OpsgenieService {
  constructor(
    private readonly httpService: HttpService,
    private readonly opsgenieFunctions: OpsgenieFunctions,
  ) {}

  /**
   * A method to send a POST request for creating a new policy to Opsgenie.
   * @param {PolicyDto} policyDto
   */
  async createPolicy(policyDto: PolicyDto) {
    return this.httpService
      .post(
        URL_OPSGENIE_POLICY + '?teamId=' + process.env.OPSGENIE_TEAM_ID,
        policyDto,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a POST request for creating a new action to Opsgenie.
   * @param {number} issueId
   * @param {CommandDto} command
   */
  async createAction(issueId: number, command: CommandDto) {
    let actionDto: ActionDto = new ActionDto();
    switch (command.type) {
      case CommandTypeEnum.JOB_TEMPLATE: {
        // checking job template
        actionDto = await this.opsgenieFunctions.jobTemplateCommandValidation(
          command,
          issueId,
        );
        break;
      }
      case CommandTypeEnum.AD_HOC_COMMAND: {
        // checking inventory
        actionDto = await this.opsgenieFunctions.adHocCommandValidation(
          command,
          issueId,
        );
        break;
      }
      default: {
        throw new NotAcceptableException(
          ErrorMessageEnum.COMMAND_NOT_ACCEPTABLE,
        );
      }
    }

    console.log(actionDto);
    const requestResult = this.httpService
      .post(
        URL_OPSGENIE_CREATE_ACTION + '?teamId=' + process.env.OPSGENIE_TEAM_ID,
        actionDto,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
    return {
      command,
      requestResult,
    };
  }

  /**
   * A method to send a PUT request for updating an action to Opsgenie.
   * @param {string} policyId
   * @param {string} actionName
   * @param {PolicyDto} policyDto
   */
  async updateActionInPolicy(
    policyId: string,
    actionName: string,
    policyDto: PolicyDto,
  ) {
    policyDto.actions.push(actionName);
    return this.httpService
      .put(
        URL_OPSGENIE_POLICY +
          '/' +
          policyId +
          '?teamId=' +
          process.env.OPSGENIE_TEAM_ID,
        policyDto,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a PUT request for updating tags in a policy to Opsgenie.
   * @param {string} policyId
   * @param {string} newTag
   * @param {PolicyDto} policyDto
   */
  async updateTagsInPolicy(
    policyId: string,
    newTag: string,
    policyDto: PolicyDto,
  ) {
    const newCondition = {
      field: 'tags',
      operation: 'contains',
      expectedValue: newTag,
    };
    policyDto.filter.conditions.push(newCondition);
    return this.httpService
      .put(
        URL_OPSGENIE_POLICY +
          '/' +
          policyId +
          '?teamId=' +
          process.env.OPSGENIE_TEAM_ID,
        policyDto,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a PUT request for deleting a tag in a policy to Opsgenie.
   * @param {string} policyId
   * @param {string} toBeDeletedTag
   * @param {PolicyDto} policyDto
   */
  async deleteTagFromPolicy(
    policyId: string,
    toBeDeletedTag: string,
    policyDto: PolicyDto,
  ) {
    const newPolicy = policyDto;
    newPolicy.filter.conditions = policyDto.filter.conditions.filter(
      (obj) => obj.expectedValue !== toBeDeletedTag,
    );
    return this.httpService
      .put(
        URL_OPSGENIE_POLICY +
          '/' +
          policyId +
          '?teamId=' +
          process.env.OPSGENIE_TEAM_ID,
        newPolicy,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a GET request for a policy.
   * @param {string} policyId
   */
  async getPolicyWithId(policyId) {
    return this.httpService
      .get(
        URL_OPSGENIE_POLICY +
          '/' +
          policyId +
          '?teamId=' +
          process.env.OPSGENIE_TEAM_ID,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a POST request for adding a note to an alert in Opsgenie.
   * @param {string} actionName
   * @param {string} alertId
   * @param {string} jobName
   * @param {number} jobId
   * @param {string} status
   * @param {string} type
   * @param {string} url
   */
  async addNoteToAlert(
    actionName: string,
    alertId: string,
    jobName: string,
    jobId: number,
    status: string,
    type: string,
    url: string,
  ) {
    const note = await this.opsgenieFunctions.createExecutionNote(
      actionName,
      jobName,
      jobId,
      status,
      type,
      url,
    );
    return this.httpService
      .post(
        URL_OPSGENIE_ALERT + '/' + alertId + '/notes?identifierType=id',
        note,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a POST request for adding an error note to an alert in Opsgenie.
   * @param {string} alertId
   * @param {string} message
   */
  async errorNoteToAlert(alertId: string, message: string) {
    const note = {
      user: 'Regat',
      source: 'Regat Rest API',
      note: message,
    };
    return this.httpService
      .post(
        URL_OPSGENIE_ALERT + '/' + alertId + '/notes?identifierType=id',
        note,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a POST request for adding a note to an alert in Opsgenie.
   * @param {string} alertId
   * @param {string} result
   */
  async addProblemRecordResultToAlertNote(alertId: string, result: string) {
    const note = {
      user: 'Regat',
      source: 'Regat Rest API',
      note: result,
    };
    return this.httpService
      .post(
        URL_OPSGENIE_ALERT + '/' + alertId + '/notes?identifierType=id',
        note,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'GenieKey ' + process.env.API_KEY_OPSGENIE,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }
}
