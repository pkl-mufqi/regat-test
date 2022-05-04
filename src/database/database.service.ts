import { Injectable, Inject } from '@nestjs/common';
import { Issue } from './models/issue.entity';
import { IssueDto } from './dto/issue.dto';
import {
  ISSUE_REPOSITORY,
  WORKAROUND_PARAMETER_REPOSITORY,
  WORKAROUND_REPOSITORY,
  JOB_REPOSITORY,
} from '../constants/constants';
import { Workaround } from './models/workaround.entity';
import { WorkaroundParameter } from './models/workaround-parameter.entity';
import { Job } from './models/job.entity';
import { JobDto } from './dto/job.dto';
import { WorkaroundParameterDto } from './dto/workaround-parameter.dto';
import { WorkaroundDto } from './dto/workaround.dto';
import { CommandDto } from './dto/command.dto';
import { UnprocessableEntityException } from 'src/utils/database.exceptions';
import { ListWorkaroundsDto } from './dto/list-workarounds.dto';
import { BadRequestException } from 'src/utils/opsgenie.exceptions';
import { CommandTypeEnum, ErrorMessageEnum } from 'src/constants/enums';
import { allowedLabels } from 'src/utils/allowed-labels';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(ISSUE_REPOSITORY)
    private readonly issueRepository: typeof Issue,
    @Inject(WORKAROUND_REPOSITORY)
    private readonly workaroundRepository: typeof Workaround,
    @Inject(WORKAROUND_PARAMETER_REPOSITORY)
    private readonly workaroundParameterRepository: typeof WorkaroundParameter,
    @Inject(JOB_REPOSITORY)
    private readonly JobRepository: typeof Job,
  ) {}

  async saveIssue(issueDto: IssueDto): Promise<Issue> {
    try {
      return await this.issueRepository.create<Issue>(issueDto);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async updatePolicyInIssue(
    issue,
    policyId: string,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      issue.policyId = policyId;
      return await this.issueRepository.update<Issue>(
        { ...issue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async deleteWorkaroundIdFromIssue(
    toBeDeletedWorkaroundId: number,
    issue: IssueDto,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      const newIssue = issue;
      newIssue.workarounds = issue.workarounds.filter(
        (obj) => obj !== toBeDeletedWorkaroundId,
      );
      return await this.issueRepository.update<Issue>(
        { ...newIssue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async updateLabelsInIssue(
    issue,
    newLabel: string,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      issue.labels.push(newLabel);
      return await this.issueRepository.update<Issue>(
        { ...issue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async updateWorkaroundsInIssue(
    issue: IssueDto,
    workaroundId,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      issue.workarounds.push(workaroundId);
      return await this.issueRepository.update<Issue>(
        { ...issue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async countAllowedLabelsInIssue(issueId, toBeDeletedLabel) {
    try {
      const issue: any = await this.getIssueById(issueId);
      const labelsArr: Array<any> = issue.dataValues.labels;
      const labelsName: Array<string> = [];
      for (let i = 0; i < labelsArr.length; i++) {
        for (let j = 0; j < allowedLabels.length; j++) {
          if (labelsArr[i].includes(allowedLabels[j])) {
            if (toBeDeletedLabel != labelsArr[i]) {
              labelsName.push(labelsArr[i]);
              break;
            }
          }
        }
      }
      console.log(labelsName);
      return labelsName.length;
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async deleteLabelFromIssue(
    issue: IssueDto,
    toBeDeletedLabel: string,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      const countLabels = await this.countAllowedLabelsInIssue(
        issueId,
        toBeDeletedLabel,
      );
      if (countLabels == 0) {
        throw new BadRequestException(
          ErrorMessageEnum.CANNOT_DELETE_ONLY_ONE_LABEL_LEFT,
        );
      }
      const updatedIssue: IssueDto = issue;
      updatedIssue.labels = issue.labels.filter(
        (obj) => obj !== toBeDeletedLabel,
      );
      return await this.issueRepository.update<Issue>(
        { ...updatedIssue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      } else {
        throw new UnprocessableEntityException(err.message);
      }
    }
  }

  async getIssueById(issueId): Promise<Issue> {
    try {
      return await this.issueRepository.findByPk(issueId);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async createWorkaroundParameter(
    parameters: WorkaroundParameterDto[],
  ): Promise<WorkaroundParameter[]> {
    try {
      return await this.workaroundParameterRepository.bulkCreate(parameters);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async countWorkaroundsInIssue(issueId): Promise<number> {
    try {
      return await (
        await this.issueRepository.findByPk(issueId)
      ).workarounds.length;
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async createWorkaround(
    command: CommandDto,
    parameters,
    issueId,
  ): Promise<Workaround> {
    try {
      const workaround: WorkaroundDto = new WorkaroundDto();

      const parametersId = [];
      for (let i = 0; i < parameters.length; i++) {
        parametersId.push(parameters[i].workaroundParameterId);
      }
      workaround.actionName = command.actionName + ' ' + issueId;
      workaround.credential = command.credential;
      workaround.inventory = command.inventory;
      workaround.issueId = issueId;
      workaround.jobTemplateId = command.jobTemplateId;
      workaround.jobTemplateName = command.jobTemplateName;
      workaround.limit = command.limit;
      workaround.module_args = command.moduleArgs;
      workaround.module_name = command.moduleName;
      workaround.parameters = parametersId;
      workaround.type = command.type;
      workaround.privilegeEscalation = command.privilegeEscalation;
      return await this.workaroundRepository.create<Workaround>(workaround);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async getWorkaroundById(workaroundId): Promise<Workaround> {
    try {
      return await this.workaroundRepository.findByPk(workaroundId);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async searchWorkaround(actionName): Promise<Workaround> {
    try {
      return await this.workaroundRepository.findOne({ where: { actionName } });
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async deleteAWorkaroundByActionName(actionName): Promise<WorkaroundDto> {
    const workaroundResult: any = await this.searchWorkaround(actionName);
    if (workaroundResult == undefined) {
      throw new BadRequestException(ErrorMessageEnum.WORKAROUND_NOT_FOUND);
    }
    const workaround: WorkaroundDto = workaroundResult.dataValues;
    for (let i = 0; i < workaround.parameters.length; i++) {
      const workaroundParameterId = workaround.parameters[i];
      await this.workaroundParameterRepository.destroy({
        where: { workaroundParameterId },
      });
    }
    console.log(workaround);
    const workaroundId = workaround.workaroundId;
    await this.workaroundRepository.destroy({ where: { workaroundId } });
    return workaround;
  }

  async getWorkaroundParameterById(id): Promise<WorkaroundParameter> {
    try {
      return await this.workaroundParameterRepository.findByPk(id);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async saveJob(alertId, jobId, actionName, type): Promise<Job> {
    try {
      const jobDto: JobDto = {
        lastJobId: jobId,
        alertId: alertId,
        actionName: actionName,
        type: type,
      };
      return await this.JobRepository.create<Job>(jobDto);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async getJobById(lastJobId: number): Promise<Job> {
    try {
      return await this.JobRepository.findByPk<Job>(lastJobId);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async getJobByAlertId(alertId): Promise<Job[]> {
    try {
      return await this.JobRepository.findAll<Job>({ where: alertId });
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  /**
   * A function to create a list of workarounds in an issue.
   * @param {number} issueId
   */
  async listOfWorkarounds(issueId: number): Promise<ListWorkaroundsDto> {
    const list: ListWorkaroundsDto = new ListWorkaroundsDto();
    const issue: any = await this.getIssueById(issueId);
    console.log(issue);
    if (issue == undefined) {
      throw new BadRequestException(
        ErrorMessageEnum.POLICY_HAS_NOT_BEEN_CREATED_YET_FOR_LIST,
      );
    }
    list.issueNumber = issue.dataValues.issueId;
    list._title = issue.dataValues.title;
    let arrWorkaroundIds = [];
    arrWorkaroundIds = issue.dataValues.workarounds;
    for (let i = 0; i < arrWorkaroundIds.length; i++) {
      const workaroundId = arrWorkaroundIds[i];
      const workaround: any = await this.getWorkaroundById(workaroundId);
      delete workaround.dataValues.createdAt;
      delete workaround.dataValues.updatedAt;
      delete workaround.dataValues.workaroundId;
      const workaroundDto: WorkaroundDto = workaround.dataValues;
      if (workaroundDto.type == CommandTypeEnum.AD_HOC_COMMAND) {
        delete workaroundDto.jobTemplateId;
        delete workaroundDto.jobTemplateName;
      }
      if (workaroundDto.type == CommandTypeEnum.JOB_TEMPLATE) {
        delete workaroundDto.inventory;
        delete workaroundDto.credential;
        delete workaroundDto.module_name;
        delete workaroundDto.module_args;
        delete workaroundDto.privilegeEscalation;
      }
      workaroundDto['extraVars'] = [];
      let arrWorkaroundParameterIds = [];
      arrWorkaroundParameterIds = workaroundDto.parameters;
      for (let i = 0; i < arrWorkaroundParameterIds.length; i++) {
        const workaroundParameterId = arrWorkaroundParameterIds[i];
        const workaroundParameter: any = await this.getWorkaroundParameterById(
          workaroundParameterId,
        );
        delete workaroundParameter.dataValues.createdAt;
        delete workaroundParameter.dataValues.updatedAt;
        delete workaroundParameter.dataValues.workaroundParameterId;
        const workaroundParameterDto: WorkaroundParameterDto =
          workaroundParameter.dataValues;
        workaroundDto['extraVars'].push(workaroundParameterDto);
      }
      delete workaroundDto.parameters;
      list.result.push(workaroundDto);
    }
    list.count = list.result.length;
    return list;
  }
}
