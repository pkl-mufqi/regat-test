export class IssueDto {
  issueId: number;
  policyId: string;
  title: string;
  issueLink: string;
  labels: Array<string>;
  workarounds: Array<number> = [];
}
