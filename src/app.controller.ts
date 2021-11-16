import {
  Body,
  Controller,
  HttpException,
  Post,
  Response,
  UseFilters,
  Request,
} from '@nestjs/common';
import { GithubService } from './github/github.service';
import { OpsgenieService } from './opsgenie/opsgenie.service';
import { DatabaseService } from './database/database.service';
import { AwxService } from './awx/awx.service';
import { allowedLabels } from 'src/utils/allowed-labels';
import {
  CommentValidationPipe,
  CreateIssuePipe,
  CreatePolicyPipe,
  TagsValidationPipe,
} from './app.pipe';
import { CommandDto } from './database/dto/command.dto';
import {
  BadRequestException,
  NotAcceptableException,
} from './utils/opsgenie.exceptions';
import { BadRequestExceptionFilter } from './utils/opsgenie.exception.filter';
import { GithubFunctions } from './github/github.functions';
import { ConflictException } from './utils/database.exceptions';
import {
  CommandTypeEnum,
  ErrorMessageEnum,
  SuccessMessageEnum,
} from './constants/enums';
import { IssueDto } from './database/dto/issue.dto';
import { PolicyDto } from './database/dto/policy.dto';
import { orderedJsonStringify } from './utils/ordered-json-stringify';

@Controller()
export class AppController {
  constructor(
    private readonly githubService: GithubService,
    private readonly opsgenieService: OpsgenieService,
    private readonly databaseService: DatabaseService,
    private readonly awxService: AwxService,
  ) {}

  /**
   * A method for adding new policy to Opsgenie.
   * This method will be called if there is a POST request to /add-new-policy endpoint.
   */
  @Post('add-new-policy')
  async addNewPolicy(
    @Body() body,
    @Body(new CreateIssuePipe()) issue: IssueDto,
    @Body(new CreatePolicyPipe()) policy: PolicyDto,
    @Response() res,
  ) {
    try {
      let getIssueResult;
      console.log(body.action);
      if (body.action == 'opened') {
        getIssueResult = await this.databaseService.getIssueById(
          body.issue.number,
        );
        if (getIssueResult != null) {
          throw new ConflictException(ErrorMessageEnum.CONFLICTED_POLICY);
        }

        const addPolicyResult = await this.opsgenieService.createPolicy(policy);

        issue.policyId = addPolicyResult.data.data.id;
        const saveResult: any = await this.databaseService.saveIssue(issue);
        console.log(saveResult.dataValues);

        const getInstallationIdResponse =
          await this.githubService.getRepoInstallation();

        const message =
          SuccessMessageEnum.POLICY_HAS_BEEN_ADDED_NOTE +
          addPolicyResult.data.data.name;

        const addResponseComment = await this.githubService.addResponseComment(
          getInstallationIdResponse.data.id,
          body.issue.number,
          message,
        );
        console.log(addResponseComment.data);

        console.log(SuccessMessageEnum.POLICY_HAS_BEEN_ADDED);
        return res
          .status(201)
          .json({ message: SuccessMessageEnum.POLICY_HAS_BEEN_ADDED });
      } else if (body.action == 'labeled') {
        getIssueResult = await this.databaseService.getIssueById(
          body.issue.number,
        );
        if (
          getIssueResult != null &&
          getIssueResult.dataValues.labels.includes(body.label.name)
        ) {
          throw new ConflictException(ErrorMessageEnum.CONFLICTED_LABEL);
        }
        if (getIssueResult == null) {
          const addPolicyResult = await this.opsgenieService.createPolicy(
            policy,
          );

          issue.policyId = addPolicyResult.data.data.id;
          const saveResult: any = await this.databaseService.saveIssue(issue);
          console.log(saveResult.dataValues);

          const getInstallationIdResponse =
            await this.githubService.getRepoInstallation();

          const message =
            SuccessMessageEnum.POLICY_HAS_BEEN_ADDED_NOTE +
            addPolicyResult.data.data.name;

          const addResponseComment =
            await this.githubService.addResponseComment(
              getInstallationIdResponse.data.id,
              body.issue.number,
              message,
            );
          console.log(addResponseComment.data);

          console.log(SuccessMessageEnum.POLICY_HAS_BEEN_ADDED);
          return res.status(201).json({
            message: SuccessMessageEnum.POLICY_HAS_BEEN_ADDED,
          });
        } else {
          for (let i = 0; i < allowedLabels.length; i++) {
            if (body.label.name.includes(allowedLabels[i])) {
              const updateLabelsInIssueResponse: any =
                await this.databaseService.updateLabelsInIssue(
                  getIssueResult.dataValues,
                  body.label.name,
                );
              console.log(updateLabelsInIssueResponse);

              const opsgenieGetPolicyResponse =
                await this.opsgenieService.getPolicyWithId(
                  getIssueResult.dataValues.policyId,
                );

              const updateTagsInPolicy =
                await this.opsgenieService.updateTagsInPolicy(
                  getIssueResult.dataValues.policyId,
                  body.label.name,
                  opsgenieGetPolicyResponse.data.data,
                );
              console.log(updateTagsInPolicy.data);

              const getInstallationIdResponse =
                await this.githubService.getRepoInstallation();

              const addResponseComment =
                await this.githubService.addResponseComment(
                  getInstallationIdResponse.data.id,
                  body.issue.number,
                  SuccessMessageEnum.POLICY_TAGS_UPDATED,
                );
              console.log(addResponseComment.data);

              res.status(200).json({
                message: SuccessMessageEnum.POLICY_TAGS_UPDATED,
              });
              console.log(SuccessMessageEnum.POLICY_TAGS_UPDATED);
              return res;
            }
          }
          console.log(ErrorMessageEnum.LABEL_NOT_ALLOWED);
          return res.status(406).json({
            message: ErrorMessageEnum.LABEL_NOT_ALLOWED,
          });
        }
      } else if (body.action == 'unlabeled') {
        getIssueResult = await this.databaseService.getIssueById(
          body.issue.number,
        );
        for (let i = 0; i < allowedLabels.length; i++) {
          if (body.label.name.includes(allowedLabels[i])) {
            const deleteLabelFromIssueResponse: any =
              await this.databaseService.deleteLabelFromIssue(
                getIssueResult.dataValues,
                body.label.name,
              );
            console.log(deleteLabelFromIssueResponse);

            const opsgenieGetPolicyResponse =
              await this.opsgenieService.getPolicyWithId(
                getIssueResult.dataValues.policyId,
              );

            const deleteTagFromPolicyResponse =
              await this.opsgenieService.deleteTagFromPolicy(
                getIssueResult.dataValues.policyId,
                body.label.name,
                opsgenieGetPolicyResponse.data.data,
              );
            console.log(deleteTagFromPolicyResponse.data);

            const getInstallationIdResponse =
              await this.githubService.getRepoInstallation();

            const addResponseComment =
              await this.githubService.addResponseComment(
                getInstallationIdResponse.data.id,
                body.issue.number,
                SuccessMessageEnum.POLICY_TAGS_DELETED,
              );
            console.log(addResponseComment.data);

            console.log(SuccessMessageEnum.POLICY_TAGS_DELETED);
            return res.status(200).json({
              message: SuccessMessageEnum.POLICY_TAGS_DELETED,
            });
          }
        }
        console.log(ErrorMessageEnum.LABEL_NOT_ALLOWED);
        return res.status(406).json({
          message: ErrorMessageEnum.LABEL_NOT_ALLOWED,
        });
      } else {
        return res.status(406).json({
          message: ErrorMessageEnum.NOT_NEW_OR_EDIT_REQUEST,
        });
      }
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) {
        return res.status(err.getStatus()).json({
          statusCode: err.getStatus(),
          message: err.getResponse(),
        });
      } else {
        return res.status(err.response.status).json({
          statusCode: err.response.status,
          message: err.response.data.message,
        });
      }
    }
  }

  /**
   * A method for adding new action to Opsgenie.
   * This method will be called if there is a POST request to /add-new-action endpoint.
   */
  @Post('add-new-action')
  @UseFilters(
    new BadRequestExceptionFilter(new GithubService(new GithubFunctions())),
  )
  async addNewAction(
    @Body() body,
    @Body(new CommentValidationPipe()) command: CommandDto,
    @Response() res,
  ) {
    try {
      const opsgenieCreateActionResponse: any =
        await this.opsgenieService.createAction(body.issue.number, command);

      const requestResult = await opsgenieCreateActionResponse.requestResult;
      console.log(requestResult);
      const createWorkaroundParameter =
        await this.databaseService.createWorkaroundParameter(
          opsgenieCreateActionResponse.command.extraVars,
        );

      const createWorkaround: any = await this.databaseService.createWorkaround(
        opsgenieCreateActionResponse.command,
        createWorkaroundParameter,
        body.issue.number,
      );
      console.log(createWorkaround);

      const getIssueByIdResult: any = await this.databaseService.getIssueById(
        body.issue.number,
      );

      const updateIssueResult: any =
        await this.databaseService.updateWorkaroundsInIssue(
          getIssueByIdResult.dataValues,
          createWorkaround.dataValues.workaroundId,
        );
      console.log(updateIssueResult);

      const opsgenieGetPolicyResponse =
        await this.opsgenieService.getPolicyWithId(
          getIssueByIdResult.dataValues.policyId,
        );

      const opsgenieUpdatePolicyResponse =
        await this.opsgenieService.updateActionInPolicy(
          getIssueByIdResult.dataValues.policyId,
          requestResult.data.data.name,
          opsgenieGetPolicyResponse.data.data,
        );
      console.log(opsgenieUpdatePolicyResponse.data);

      const getInstallationIdResponse =
        await this.githubService.getRepoInstallation();
      const commandString = orderedJsonStringify(command);
      const addResponseComment = await this.githubService.addResponseComment(
        getInstallationIdResponse.data.id,
        body.issue.number,
        SuccessMessageEnum.ACTION_HAS_BEEN_ADDED,
        commandString,
      );
      console.log(addResponseComment.data);

      console.log(SuccessMessageEnum.ACTION_HAS_BEEN_ADDED);
      return res.status(201).json({
        message: SuccessMessageEnum.ACTION_HAS_BEEN_ADDED,
      });
    } catch (err) {
      console.log(err);
      if (err instanceof BadRequestException) {
        try {
          const getInstallationIdResponse =
            await this.githubService.getRepoInstallation();
          const addResponseComment =
            await this.githubService.addResponseComment(
              getInstallationIdResponse.data.id,
              body.issue.number,
              err.message,
            );
          console.log(addResponseComment);
          return res.status(err.getStatus()).json({
            statusCode: err.getStatus(),
            message: err.getResponse(),
          });
        } catch (err) {
          console.log(err);
          return res.status(err.response.status).json({
            statusCode: err.response.status,
            message: err.response.data.message,
          });
        }
      } else {
        console.log(err);
        return res.status(err.response.status).json({
          statusCode: err.response.status,
          message: err.response.data.message,
        });
      }
    }
  }

  /**
   * A method for executing an action.
   * This method will be called if there is a POST request to /execute-action endpoint.
   */
  @Post('execute-action')
  async executeAction(@Body() body, @Response() res) {
    this.processExecuteRequest(body);

    console.log(SuccessMessageEnum.PROCESSING_EXECUTION_REQUEST);
    return res.status(200).json({
      message: SuccessMessageEnum.PROCESSING_EXECUTION_REQUEST,
    });
  }

  async processExecuteRequest(body) {
    try {
      console.log(body);
      const searchWorkaroundResponse: any =
        await this.databaseService.searchWorkaround(body.actionName);
      console.log(searchWorkaroundResponse);
      let executeActionAwxResponse;
      let jobId;
      if (
        searchWorkaroundResponse.dataValues.type == CommandTypeEnum.JOB_TEMPLATE
      ) {
        await this.awxService.checkPromptOnLaunch(
          searchWorkaroundResponse.dataValues.jobTemplateId,
        );
        let limit;
        let extra_vars;
        if (body.action == undefined) {
          limit = '';
          extra_vars = '';
        } else {
          if (body.action.limit != undefined) {
            limit = await this.checkingTemplateLiterals(
              body.alert.tags,
              body.action.limit,
            );
          } else {
            limit = '';
          }

          if (body.action.extra_vars != undefined) {
            extra_vars = await this.checkingTemplateLiterals(
              body.alert.tags,
              body.action.extra_vars,
            );
          } else {
            extra_vars = '';
          }
        }

        executeActionAwxResponse = await this.awxService.executeJobTemplate(
          searchWorkaroundResponse.dataValues,
          limit,
          extra_vars,
        );
        jobId = executeActionAwxResponse.data.job;
      } else if (
        searchWorkaroundResponse.dataValues.type ==
        CommandTypeEnum.AD_HOC_COMMAND
      ) {
        let limit;
        let extra_vars;
        let module_args;
        if (body.action == undefined) {
          limit = '';
          module_args = '';
          extra_vars = '';
        } else {
          if (body.action.limit != undefined) {
            limit = await this.checkingTemplateLiterals(
              body.alert.tags,
              body.action.limit,
            );
          } else {
            limit = '';
          }

          if (body.action.module_args != undefined) {
            module_args = await this.checkingTemplateLiterals(
              body.alert.tags,
              body.action.module_args,
            );
          } else {
            module_args = '';
          }

          if (body.action.extra_vars != undefined) {
            extra_vars = await this.checkingTemplateLiterals(
              body.alert.tags,
              body.action.extra_vars,
            );
          } else {
            extra_vars = '';
          }
        }
        executeActionAwxResponse = await this.awxService.createAdhocCommand(
          searchWorkaroundResponse.dataValues,
          limit,
          module_args,
          extra_vars,
        );
        console.log(executeActionAwxResponse.data);
        jobId = executeActionAwxResponse.data.id;
      }

      const saveJobResponse: any = await this.databaseService.saveJob(
        body.alert.id,
        jobId,
        body.actionName,
        executeActionAwxResponse.data.type,
      );
      console.log(saveJobResponse);
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) {
        const addNoteResponse = await this.opsgenieService.errorNoteToAlert(
          body.alert.id,
          err.getResponse().toString(),
        );
        console.log(addNoteResponse.data);
      }
    }
  }

  async checkingTemplateLiterals(tags, input) {
    let processedInput = input;
    const templateLiteralPrefix = '${tags.';
    while (processedInput.includes(templateLiteralPrefix)) {
      let matchInputArr = processedInput.match(/\${tags\.[^\}]+/);
      console.log(matchInputArr);
      if (matchInputArr != null) {
        let matchArr = matchInputArr[0];
        let tag = matchArr.replace(templateLiteralPrefix, '') + '=';
        let allow = false;
        for (let j = 0; j < allowedLabels.length; j++) {
          if (tag.includes(allowedLabels[j])) {
            allow = true;
          }
        }
        if (!allow) {
          throw new BadRequestException(
            ErrorMessageEnum.TEMPLATE_LITERAL_NOT_ACCEPTABLE +
              tag.replace('=', ''),
          );
        }
        // console.log(tag);
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].includes(tag)) {
            processedInput = processedInput.replace(
              templateLiteralPrefix + tag.replace('=', '') + '}',
              tags[i].replace(tag, ''),
            );
          }
        }
      }
    }
    return processedInput;
  }

  /**
   * A method for receiving and forwarding execution result to an alert in Opsgenie.
   * This method will be called if there is a POST request to /notification endpoint.
   */
  @Post('notification')
  async notification(@Body() body, @Response() res) {
    try {
      console.log(body);
      const getJobResponse: any = await this.databaseService.getJobById(
        body.id,
      );

      console.log(getJobResponse);
      if (getJobResponse == null) {
        throw new NotAcceptableException(ErrorMessageEnum.JOB_NOT_FROM_REGAT);
      }

      const addNoteResponse = await this.opsgenieService.addNoteToAlert(
        getJobResponse.dataValues.actionName,
        getJobResponse.dataValues.alertId,
        body.name,
        body.id,
        body.status,
        getJobResponse.dataValues.type,
        body.url,
      );
      console.log(addNoteResponse.data);

      console.log(SuccessMessageEnum.NOTIFICATION_RECEIVED_AND_FORWARDED);
      return res.status(200).json({
        message: SuccessMessageEnum.NOTIFICATION_RECEIVED_AND_FORWARDED,
      });
    } catch (err) {
      console.log(err);
      if (err instanceof HttpException) {
        return res.status(err.getStatus()).json({
          statusCode: err.getStatus(),
          message: err.getResponse(),
        });
      } else {
        console.log(err);
        return res.status(err.response.status).json({
          statusCode: err.response.status,
          message: err.response.data.message,
        });
      }
    }
  }

  /**
   * A method for creating new issue or problem record to GitHub.
   * This method will be called if there is a POST request to /create-new-issue endpoint.
   */
  @Post('create-new-issue')
  async createNewIssue(
    @Body() body,
    @Body(new TagsValidationPipe()) tagsName: Array<string>,
    @Response() res,
  ) {
    try {
      const getInstallationIdResponse =
        await this.githubService.getRepoInstallation();
      console.log(body);
      const createIssueResponse = await this.githubService.createNewIssue(
        getInstallationIdResponse.data.id,
        body.alert.id,
        body.alert.message,
        body.alert.description,
        body.alert.priority,
        tagsName,
      );
      const message =
        SuccessMessageEnum.PROBLEM_RECORD_HAS_BEEN_CREATED +
        createIssueResponse.data.html_url;
      const problemRecordCreatedResponse =
        await this.opsgenieService.addProblemRecordResultToAlertNote(
          body.alert.id,
          message,
        );
      console.log(problemRecordCreatedResponse.data);
      console.log(SuccessMessageEnum.ISSUE_HAS_BEEN_CREATED);
      return res.status(201).json({
        message: SuccessMessageEnum.ISSUE_HAS_BEEN_CREATED,
      });
    } catch (err) {
      const problemRecordCreatedResponse =
        await this.opsgenieService.addProblemRecordResultToAlertNote(
          body.alert.id,
          ErrorMessageEnum.PROBLEM_RECORD_CREATION_FAILED,
        );
      console.log(problemRecordCreatedResponse.data);
      console.log(err);
      return res.status(err.response.status).json({
        statusCode: err.response.status,
        message: err.response.data.message,
      });
    }
  }
}
