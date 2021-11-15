import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubFunctions {
  /**
   * A method to create a title for a new issue.
   * @param {string} alertTitle
   */
  async createTitle(alertTitle: string) {
    const arrTitle = alertTitle.split(' ');
    if (arrTitle[0].search(/[\[\]]/gm) != -1) {
      const sys = arrTitle.shift();
      console.log(sys);
    }
    arrTitle.unshift('[Problem]');
    const title = arrTitle.join(' ');
    return title;
  }
}
