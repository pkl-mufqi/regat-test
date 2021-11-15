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

  async deleteLabelFromIssue(
    issue: IssueDto,
    toBeDeletedLabel: string,
  ): Promise<[number, Issue[]]> {
    try {
      const issueId = issue.issueId;
      const updatedIssue: IssueDto = issue;
      updatedIssue.labels = issue.labels.filter(
        (obj) => obj !== toBeDeletedLabel,
      );
      return await this.issueRepository.update<Issue>(
        { ...updatedIssue },
        { where: { issueId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
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

  async searchWorkaround(actionName): Promise<Workaround> {
    try {
      return await this.workaroundRepository.findOne({ where: { actionName } });
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }

  async updateAdhocIdWorkaround(
    updatedWorkaround,
    adhocId,
  ): Promise<[number, Workaround[]]> {
    try {
      const workaroundId = updatedWorkaround.workaroundId;
      updatedWorkaround.adhocCommandId = adhocId;
      return await this.workaroundRepository.update<Workaround>(
        { ...updatedWorkaround },
        { where: { workaroundId }, returning: true },
      );
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
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
}
