import { PipeTransform, Injectable } from '@nestjs/common';
import { CommandDto } from 'src/database/dto/command.dto';
import { WorkaroundParameterDto } from 'src/database/dto/workaround-parameter.dto';
import {
  BadRequestException,
  NotAcceptableException,
} from 'src/utils/opsgenie.exceptions';
import { allowedLabels } from 'src/utils/allowed-labels';
import { CommandTypeEnum, ErrorMessageEnum } from './constants/enums';
import { PolicyDto } from './database/dto/policy.dto';
import { FilterDto } from './database/dto/filter.dto';
import { ConditionDto } from './database/dto/condition.dto';
import { IssueDto } from './database/dto/issue.dto';
import stringArgv from 'string-argv';
import { Command } from 'commander';

/**
 * A class for validating and transforming a comment from a request body to a CommandDto.
 */
@Injectable()
export class CommentValidationPipe implements PipeTransform {
  transform(value: any): CommandDto {
    // comment event/action must be 'created'
    if (value.action != 'created') {
      throw new NotAcceptableException(
        ErrorMessageEnum.NOT_NEW_WORKAROUND_REQUEST,
      );
    }

    // console.log(value.issue.labels);
    // console.log(value.issue.labels[0]);

    // const comment: string = processedComment;
    const comment: string = this.checkingTemplateLiterals(
      value.issue.labels,
      value.comment.body,
    );
    console.log(comment);

    // checking if the comment calls regat to do something.
    if (comment.split(' ')[0] != CommandTypeEnum.REGAT_APP) {
      throw new NotAcceptableException(
        ErrorMessageEnum.NOT_A_WORKAROUND_COMMENT,
      );
    }

    // checking job template organization
    console.log(process.env.AWX_ORGANIZATION);
    const org = process.env.AWX_ORGANIZATION;
    if (org == undefined) {
      throw new BadRequestException(ErrorMessageEnum.NO_ORGANIZATION_IN_ENV);
    }

    // error handling when only calling regat with no command at all.
    if (comment.split(' ').length < 2) {
      throw new BadRequestException(ErrorMessageEnum.NO_WORKAROUND_COMMAND);
    }

    // regat only receive one line of workaround.
    // if there is more than one line, the request will be refused.
    if (comment.split('\r\n').length > 1) {
      throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
    }

    // using commander for parsing string to CommandDto
    const commandString = comment.trim();
    const commandArgv = stringArgv(commandString, 'commander');
    console.log(commandArgv);
    const commander = new Command();
    const baseCommand = commander
      .version('1.3.0')
      .usage('[command] [options]')
      .configureOutput({
        writeOut: (str) => {
          throw str;
        },
        writeErr: (str) => {
          throw str;
        },
        outputError: (str, write) => {
          write(str + '(add --help for additional information)');
        },
      });

    const workaroundCommand = baseCommand
      .command(CommandTypeEnum.WORKAROUND)
      .description('workaround related')
      .usage('[command] [options]');

    //creating command for adding new workaround
    const addNewWorkaroundCommand = workaroundCommand
      .command(CommandTypeEnum.ADD)
      .description('adding new workaround')
      .usage('[command] [options]');

    const addAdhocWorkaroundCommand = addNewWorkaroundCommand
      .command(CommandTypeEnum.AD_HOC_COMMAND)
      .description('adding new adhoc workaround')
      .requiredOption(
        '-a, --action-name <action-name>',
        'action name for opsgenie (mandatory)',
      )
      .requiredOption(
        '-i, --inventory <inventory>',
        'AWX inventory name (mandatory)',
      )
      .requiredOption(
        '-c, --credential <credential>',
        'AWX credential name (mandatory)',
      )
      .requiredOption('-l, --limit <limit>', 'target host(s) (mandatory)')
      .requiredOption(
        '-m, --module-name <module-name>',
        'module name from AWX (mandatory)',
      )
      .option('-p, --privilege-escalation', 'module args for the adhoc', false)
      .option('-M, --module-args [module-args...]', 'module args for the adhoc')
      .option(
        '-e, --extra-vars [extra-vars...]',
        'extra variables for the AWX job',
      );

    const addJobTemplateWorkaroundCommand = addNewWorkaroundCommand
      .command(CommandTypeEnum.JOB_TEMPLATE)
      .description('adding new job template workaround')
      .requiredOption(
        '-a, --action-name <action-name>',
        'action name for opsgenie (mandatory)',
      )
      .requiredOption(
        '-T, --template-id <template-id>',
        'template id from AWX (mandatory)',
      )
      .option(
        '-e, --extra-vars [extra-vars...]',
        'extra variables for the AWX job',
      );

    try {
      const command: CommandDto = new CommandDto();
      addAdhocWorkaroundCommand.action((ops) => {
        command.stringExtraVars = '';
        if (ops.extraVars != undefined) {
          command.stringExtraVars = ops.extraVars.join(' ');
          for (let i = 0; i < ops.extraVars.length; i++) {
            if (ops.extraVars[i].includes('="')) {
              const varsSplited = ops.extraVars[i].split('="');
              if (
                varsSplited[0] == '' ||
                varsSplited[1] == '' ||
                varsSplited[1] == '"' ||
                varsSplited.length > 2
              ) {
                throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
              }
              const parameter = new WorkaroundParameterDto();
              parameter.key = varsSplited[0];
              parameter.value = varsSplited[1].replace('"', '');
              command.extraVars.push(parameter);
            } else if (ops.extraVars[i].includes('=')) {
              const varsSplited = ops.extraVars[i].split('=');
              if (
                varsSplited[0] == '' ||
                varsSplited[1] == '' ||
                varsSplited[1] == '"' ||
                varsSplited.length > 2
              ) {
                throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
              }
              const parameter = new WorkaroundParameterDto();
              parameter.key = varsSplited[0];
              parameter.value = varsSplited[1];
              command.extraVars.push(parameter);
            } else {
              throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
            }
          }
        }
        if (ops.moduleArgs != undefined) {
          command.moduleArgs = ops.moduleArgs.join(' ');
        } else {
          command.moduleArgs = '';
        }
        command.actionName = ops.actionName;
        command.type = CommandTypeEnum.AD_HOC_COMMAND;
        command.inventoryName = ops.inventory;
        command.limit = ops.limit;
        command.credentialName = ops.credential;
        command.org = org;
        command.moduleName = ops.moduleName;
        command.privilegeEscalation = ops.privilegeEscalation;
      });
      addJobTemplateWorkaroundCommand.action((ops) => {
        command.stringExtraVars = '';
        if (ops.extraVars != undefined) {
          command.stringExtraVars = ops.extraVars.join(' ');
          for (let i = 0; i < ops.extraVars.length; i++) {
            if (ops.extraVars[i].includes('="')) {
              const varsSplited = ops.extraVars[i].split('="');
              if (
                varsSplited[0] == '' ||
                varsSplited[1] == '' ||
                varsSplited[1] == '"' ||
                varsSplited.length > 2
              ) {
                throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
              }
              const parameter = new WorkaroundParameterDto();
              parameter.key = varsSplited[0];
              parameter.value = varsSplited[1].replace('"', '');
              command.extraVars.push(parameter);
            } else if (ops.extraVars[i].includes('=')) {
              const varsSplited = ops.extraVars[i].split('=');
              if (
                varsSplited[0] == '' ||
                varsSplited[1] == '' ||
                varsSplited[1] == '"' ||
                varsSplited.length > 2
              ) {
                throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
              }
              const parameter = new WorkaroundParameterDto();
              parameter.key = varsSplited[0];
              parameter.value = varsSplited[1];
              command.extraVars.push(parameter);
            } else {
              throw new BadRequestException(ErrorMessageEnum.INVALID_COMMAND);
            }
          }
        }
        console.log(command.extraVars);
        command.actionName = ops.actionName;
        command.type = CommandTypeEnum.JOB_TEMPLATE;
        command.jobTemplateId = ops.templateId;
        command.org = org;
      });
      commander.parse(commandArgv);

      return command;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err);
    }
  }

  checkingTemplateLiterals(labels, comment) {
    let processedComment = comment;
    const templateLiteralPrefix = '${labels.';
    while (processedComment.includes(templateLiteralPrefix)) {
      const matchInputArr = processedComment.match(/\${labels\.[^\}]+/);
      console.log(matchInputArr);
      if (matchInputArr != null) {
        const matchArr = matchInputArr[0];
        const label = matchArr.replace(templateLiteralPrefix, '') + '=';
        let allow = false;
        for (let j = 0; j < allowedLabels.length; j++) {
          if (label.includes(allowedLabels[j])) {
            allow = true;
          }
        }
        if (!allow) {
          throw new BadRequestException(
            ErrorMessageEnum.TEMPLATE_LITERAL_NOT_ACCEPTABLE +
              label.replace('=', ''),
          );
        }
        // console.log(tag);
        for (let i = 0; i < labels.length; i++) {
          if (labels[i].name.includes(label)) {
            processedComment = processedComment.replace(
              templateLiteralPrefix + label.replace('=', '') + '}',
              labels[i].name.replace(label, ''),
            );
          }
        }
      }
    }
    return processedComment;
  }
}

/**
 * A class for validating and transforming tags in a request body to an array of string.
 * Only allowed tags/labels are selected.
 */
@Injectable()
export class TagsValidationPipe implements PipeTransform {
  transform(value: any): Array<string> {
    const tagsArr: Array<any> = value.alert.tags;
    const tagsName: Array<string> = [];
    for (let i = 0; i < tagsArr.length; i++) {
      for (let j = 0; j < allowedLabels.length; j++) {
        if (tagsArr[i].includes(allowedLabels[j])) {
          tagsName.push(tagsArr[i]);
          break;
        }
      }
    }
    return tagsName;
  }
}

/**
 * A class for creating an IssueDto from a request body.
 * Only allowed tags/labels are selected.
 */
@Injectable()
export class CreateIssuePipe implements PipeTransform {
  transform(value: any): IssueDto {
    const labelsArr: Array<any> = value.issue.labels;
    const labelsName: Array<string> = [];
    for (let i = 0; i < labelsArr.length; i++) {
      for (let j = 0; j < allowedLabels.length; j++) {
        if (labelsArr[i].name.includes(allowedLabels[j])) {
          labelsName.push(labelsArr[i].name);
          break;
        }
      }
    }
    if (labelsName.length == 0) {
      throw new NotAcceptableException(ErrorMessageEnum.NO_ACCEPTABLE_LABELS);
    }
    const issueDto: IssueDto = {
      issueId: value.issue.number,
      policyId: '',
      title: value.issue.title,
      issueLink: value.issue.html_url,
      labels: labelsName,
      workarounds: [],
    };
    return issueDto;
  }
}

/**
 * A class for creating an PolicyDto from a request body.
 * Only allowed tags/labels are selected.
 */
@Injectable()
export class CreatePolicyPipe implements PipeTransform {
  transform(value: any): PolicyDto {
    const policyDto: PolicyDto = new PolicyDto();
    const filterDto: FilterDto = new FilterDto();
    const tagsArr: Array<any> = value.issue.labels;
    const tagsName: Array<string> = [];
    for (let i = 0; i < tagsArr.length; i++) {
      for (let j = 0; j < allowedLabels.length; j++) {
        if (tagsArr[i].name.includes(allowedLabels[j])) {
          tagsName.push(tagsArr[i].name);
          break;
        }
      }
    }
    if (tagsName.length == 0) {
      throw new NotAcceptableException(ErrorMessageEnum.NO_ACCEPTABLE_TAGS);
    }
    const arrCondition: ConditionDto[] = [];
    for (let i = 0; i < tagsName.length; i++) {
      arrCondition.push({
        field: 'tags',
        operation: 'contains',
        expectedValue: tagsName[i],
      });
    }
    policyDto.type = 'alert';
    policyDto.name = 'Issue ' + value.issue.number;
    policyDto.continue = true;
    policyDto.policyDescription =
      'This is a policy from issue\n' +
      value.issue.title +
      '\n' +
      value.issue.html_url;
    policyDto.description =
      '{{description}}\n\n------Added by Regat in Policy [' +
      policyDto.name +
      ']------\nGitHub Issue: ' +
      value.issue.title +
      '\nURL:\n' +
      value.issue.html_url;
    policyDto.enabled = 'true';
    filterDto.type = 'match-all-conditions';
    filterDto.conditions = arrCondition;
    policyDto.filter = filterDto;

    return policyDto;
  }
}
