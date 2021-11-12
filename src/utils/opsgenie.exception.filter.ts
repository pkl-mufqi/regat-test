import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BadRequestException } from './opsgenie.exceptions';
import { Request, Response } from 'express';
import { GithubService } from 'src/github/github.service';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly githubService: GithubService) {}
  async catch(exception: BadRequestException, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const message = exception.message;
    const status = exception.getStatus();
    try {
      const getInstallationIdResponse =
        await this.githubService.getRepoInstallation();
      const addResponseComment = await this.githubService.addResponseComment(
        getInstallationIdResponse.data.id,
        request.body.issue.number,
        message,
      );
      console.log(addResponseComment.data);

      response.status(status).json({
        statusCode: status,
        message: message,
      });
    } catch (err) {
      console.log(err);
      response.status(err.status).json({
        statusCode: err.status,
        message: err.message,
      });
    }
  }
}
