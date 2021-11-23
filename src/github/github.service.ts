import { Injectable } from '@nestjs/common';
import { App } from 'octokit';
import { readFileSync } from 'fs';
import { GithubFunctions } from './github.functions';
import { OPSGENIE_BASE_URL } from 'src/constants/constants';

@Injectable()
export class GithubService {
  constructor(private readonly githubFunctions: GithubFunctions) {}
  /**
   * A method to create an Octokit (official clients for GitHub API).
   */
  async getRepoInstallation() {
    const privateKey = readFileSync(
      process.env.REGAT_GITHUB_APP_PRIVATE_KEY_PATH,
      'utf8',
    );
    const appId = process.env.REGAT_GITHUB_APP_ID;
    const app = new App({ appId, privateKey });
    const octokit = await app.octokit.rest.apps.getRepoInstallation({
      owner: process.env.GITHUB_ORG,
      repo: process.env.GITHUB_REPO,
    });
    return octokit;
  }

  /**
   * A method to create a new issue.
   * @param {number} installationId
   * @param {string} alertId
   * @param {string} alertTitle
   * @param {string} alertDescription
   * @param {string} alertPriority
   * @param {string[]} labels
   */
  async createNewIssue(
    installationId: number,
    alertId: string,
    alertTitle: string,
    alertDescription: string,
    alertPriority: string,
    labels: string[],
  ) {
    const priority = 'Priority: ' + alertPriority;
    const newProblem = 'problem';
    const issuesBody =
      "### Alert's URL\n" +
      OPSGENIE_BASE_URL +
      '/alert/detail/' +
      alertId +
      '/details' +
      "\n\n### Alert's Description\n" +
      alertDescription;
    labels.push(priority);
    labels.push(newProblem);
    const title = await this.githubFunctions.createTitle(alertTitle);
    const privateKey = readFileSync(
      process.env.REGAT_GITHUB_APP_PRIVATE_KEY_PATH,
      'utf8',
    );
    const appId = process.env.REGAT_GITHUB_APP_ID;
    const app = new App({ appId, privateKey });
    const octokit = await app.getInstallationOctokit(installationId);
    return await octokit.rest.issues.create({
      owner: process.env.GITHUB_ORG,
      repo: process.env.GITHUB_REPO,
      body: issuesBody,
      title: title,
      labels: labels,
    });
  }

  /**
   * A method to create a response comment to an issue in GitHub.
   * @param {number} installationId
   * @param {number} issueNumber
   * @param {string} message
   * @param {string} commandString
   */
  async addResponseComment(
    installationId: number,
    issueNumber: number,
    message: string,
    commandString?: string,
  ) {
    const privateKey = readFileSync(
      process.env.REGAT_GITHUB_APP_PRIVATE_KEY_PATH,
      'utf8',
    );
    const appId = process.env.REGAT_GITHUB_APP_ID;
    const app = new App({ appId, privateKey });
    const octokit = await app.getInstallationOctokit(installationId);
    let body;
    if (commandString != undefined) {
      body =
        '```\n' + message + '\n```' + '\n```json\n' + commandString + '\n```';
    } else {
      body = '```\n' + message + '\n```';
    }
    return await octokit.rest.issues.createComment({
      owner: process.env.GITHUB_ORG,
      repo: process.env.GITHUB_REPO,
      issue_number: issueNumber,
      body: body,
    });
  }

  /**
   * A function to add a label to an issue in GitHub.
   * @param {number} installationId
   * @param {number} issueNumber
   * @param {string} labelName
   */
  async addLabelToIssue(
    installationId: number,
    issueNumber: number,
    labelName: string,
  ) {
    const privateKey = readFileSync(
      process.env.REGAT_GITHUB_APP_PRIVATE_KEY_PATH,
      'utf8',
    );
    const appId = process.env.REGAT_GITHUB_APP_ID;
    const app = new App({ appId, privateKey });
    const octokit = await app.getInstallationOctokit(installationId);
    const labels = [];
    labels.push(labelName);
    return await octokit.rest.issues.addLabels({
      owner: process.env.GITHUB_ORG,
      repo: process.env.GITHUB_REPO,
      issue_number: issueNumber,
      labels: labels,
    });
  }
}
