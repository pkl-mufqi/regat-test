import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WorkaroundDto } from 'src/database/dto/workaround.dto';
import { AdhocDto } from 'src/database/dto/adhoc.dto';
import {
  AWX_AD_HOC_COMMANDS_ENDPOINT,
  AWX_CREDENTIALS_ENDPOINT,
  AWX_INVENTORIES_ENDPOINT,
  AWX_JOB_TEMPLATES_ENDPOINT,
  AWX_ORGANIZATIONS_ENDPOINT,
} from 'src/constants/constants';
import stringArgv from 'string-argv';
import { BadRequestException } from 'src/utils/awx.exceptions';
import { ErrorMessageEnum } from 'src/constants/enums';

@Injectable()
export class AwxService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * A method to send a GET request for a job template.
   * @param {number} jobTemplateId
   */
  async getJobTemplate(jobTemplateId: number) {
    return await this.httpService
      .get(
        process.env.AWX_BASE_URL +
          AWX_JOB_TEMPLATES_ENDPOINT +
          '/' +
          jobTemplateId +
          '/',
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_READ_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method for checking prompt on launch option in a job template.
   * @param {number} jobTemplateId
   */
  async checkPromptOnLaunch(jobTemplateId: number) {
    let awxResponse;
    try {
      console.log(jobTemplateId);
      awxResponse = await this.getJobTemplate(jobTemplateId);
    } catch {
      throw new BadRequestException(ErrorMessageEnum.JOB_TEMPLATE_NOT_FOUND);
    }
    console.log(awxResponse.data);
    if (
      awxResponse.data.ask_variables_on_launch == false ||
      awxResponse.data.ask_limit_on_launch == false
    ) {
      throw new BadRequestException(ErrorMessageEnum.PROMPT_ON_LAUNCH_DISABLED);
    }
  }

  /**
   * A method to send a POST request for executing a job template.
   * @param {WorkaroundDto} workaround
   * @param {string} ops_limit
   * @param {string} ops_extra_vars
   */
  async executeJobTemplate(
    workaround: WorkaroundDto,
    ops_limit: string,
    ops_extra_vars: string,
  ) {
    const payload = {};
    const limit = ',' + ops_limit + ',';
    const extra_vars = {};
    if (ops_extra_vars != undefined) {
      const extraVarsArgv = stringArgv(ops_extra_vars);
      for (let i = 0; i < extraVarsArgv.length; i++) {
        if (extraVarsArgv[i].includes('="')) {
          const varsSplited = extraVarsArgv[i].split('="');
          if (
            varsSplited[0] == '' ||
            varsSplited[1] == '' ||
            varsSplited[1] == '"' ||
            varsSplited.length > 2
          ) {
            throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
          }
          extra_vars[varsSplited[0]] = varsSplited[1].replace('"', '');
        } else if (extraVarsArgv[i].includes('=')) {
          const varsSplited = extraVarsArgv[i].split('=');
          if (
            varsSplited[0] == '' ||
            varsSplited[1] == '' ||
            varsSplited[1] == '"' ||
            varsSplited.length > 2
          ) {
            throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
          }
          extra_vars[varsSplited[0]] = varsSplited[1];
        } else {
          throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
        }
      }
    }
    payload['extra_vars'] = extra_vars;
    payload['limit'] = limit;
    console.log(payload);

    return await this.httpService
      .post(
        process.env.AWX_BASE_URL +
          AWX_JOB_TEMPLATES_ENDPOINT +
          '/' +
          workaround.jobTemplateId +
          '/launch/',
        payload,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_WRITE_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a POST request for create/executing an ad hoc command.
   * @param {WorkaroundDto} workaround
   * @param {string} ops_limit
   * @param {string} module_args
   * @param {string} ops_extra_vars
   */
  async createAdhocCommand(
    workaround: WorkaroundDto,
    ops_limit: string,
    module_args: string,
    ops_extra_vars: string,
  ) {
    const limit = ',' + ops_limit + ',';
    const extra_vars = {};
    let stringExtraVars = '';
    console.log(ops_extra_vars);
    if (ops_extra_vars != undefined) {
      const extraVarsArgv = stringArgv(ops_extra_vars);
      for (let i = 0; i < extraVarsArgv.length; i++) {
        if (extraVarsArgv[i].includes('="')) {
          const varsSplited = extraVarsArgv[i].split('="');
          if (
            varsSplited[0] == '' ||
            varsSplited[1] == '' ||
            varsSplited[1] == '"' ||
            varsSplited.length > 2
          ) {
            throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
          }
          extra_vars[varsSplited[0]] = varsSplited[1].replace('"', '');
        } else if (extraVarsArgv[i].includes('=')) {
          const varsSplited = extraVarsArgv[i].split('=');
          if (
            varsSplited[0] == '' ||
            varsSplited[1] == '' ||
            varsSplited[1] == '"' ||
            varsSplited.length > 2
          ) {
            throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
          }
          extra_vars[varsSplited[0]] = varsSplited[1];
        } else {
          throw new BadRequestException(ErrorMessageEnum.INVALID_EXTRA_VARS);
        }
      }
      stringExtraVars = JSON.stringify(extra_vars);
    }
    const adhocDto: AdhocDto = {
      inventory: workaround.inventory,
      credential: workaround.credential,
      limit: limit,
      become_enabled: workaround.privilegeEscalation,
      module_name: workaround.module_name,
      module_args: module_args,
      extra_vars: stringExtraVars,
    };
    console.log(adhocDto);
    return await this.httpService
      .post(
        process.env.AWX_BASE_URL + AWX_AD_HOC_COMMANDS_ENDPOINT + '/',
        adhocDto,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_WRITE_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a GET request for an AWX Organization.
   * @param {string} orgName
   */
  async searchOrg(orgName: string) {
    return await this.httpService
      .get(
        process.env.AWX_BASE_URL +
          AWX_ORGANIZATIONS_ENDPOINT +
          '/?name=' +
          orgName,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_READ_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a GET request for an AWX Inventory.
   * @param {string} inventoryName
   * @param {string} orgName
   */
  async searchInventory(inventoryName: string, orgName: string) {
    return await this.httpService
      .get(
        process.env.AWX_BASE_URL +
          AWX_INVENTORIES_ENDPOINT +
          '/?name=' +
          inventoryName +
          '&organization__name=' +
          orgName,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_READ_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }

  /**
   * A method to send a GET request for an AWX Credential.
   * @param {string} credentialName
   * @param {string} orgName
   */
  async searchCredential(credentialName: string, orgName: string) {
    return await this.httpService
      .get(
        process.env.AWX_BASE_URL +
          AWX_CREDENTIALS_ENDPOINT +
          '/?name=' +
          credentialName +
          '&organization__name=' +
          orgName,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.AWX_READ_ACCESS_TOKEN,
            timeout: 10000,
          },
          withCredentials: true,
        },
      )
      .pipe()
      .toPromise();
  }
}
