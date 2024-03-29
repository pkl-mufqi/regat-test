/**
 * Regat's version
 * @const {string}
 */
export const VERSION = '1.5.0';

/**
 * Error Messages for Responses.
 * @enum {string}
 */
export enum ErrorMessageEnum {
  AWX_ORGANIZATION_NOT_FOUND = 'AWX Organization not found.',
  SIMILAR_ACTION_NAME = "This action's name is already registered for this issue in the previous workaround. Please write different name for it.",
  INVENTORY_NOT_FOUND = 'Inventory not found.',
  CREDENTIAL_NOT_FOUND = 'Credential not found.',
  COMMAND_NOT_ACCEPTABLE = 'This command is not acceptable.',
  JOB_TEMPLATE_NOT_FOUND = 'Job Template not found.',
  NOT_NEW_WORKAROUND_REQUEST = 'This is not new Workaround Request.',
  NO_ORGANIZATION_IN_ENV = 'There is no AWX organization.',
  NOT_A_WORKAROUND_COMMENT = 'This is not a workaround comment.',
  NO_WORKAROUND_COMMAND = 'There is no workaround command.',
  INVALID_COMMAND = 'Invalid Command.',
  NO_ACTION_NAME_IN_COMMAND = 'Cannot find Action Name in the command.',
  NO_COMMAND_TYPE_IN_COMMAND = 'Cannot find command type in the command.',
  NO_JOB_TEMPLATE_ID_IN_COMMAND = 'Job template id was not found or not a number.',
  NO_INVENTORY_IN_COMMAND = 'Cannot find inventory in the command.',
  NO_LIMIT_IN_COMMAND = 'Cannot find limit in the command.',
  NO_CREDENTIAL_IN_COMMAND = 'Cannot find credential in the command',
  NO_MODULE_IN_COMMAND = 'Cannot find module in the command.',
  INVALID_COMMAND_TYPE = 'Invalid command type.',
  CONFLICTED_POLICY = 'Policy is already created.',
  CONFLICTED_LABEL = 'This label is already added.',
  LABEL_NOT_ALLOWED = 'This label is not allowed.',
  NOT_NEW_OR_EDIT_REQUEST = 'This is not new Issue or Label changes Request.',
  PROBLEM_RECORD_CREATION_FAILED = 'Problem Record creation failed. Please check Regat.',
  WRONG_PRIVILEGE_ESCALATION_VALUE = 'Privilege Escalation argument only receive boolean value.',
  NO_ACCEPTABLE_LABELS = 'There is no acceptable labels.',
  NO_ACCEPTABLE_TAGS = 'There is no acceptable tags.',
  INVALID_EXTRA_VARS = 'Invalid extra vars. Please check again.',
  JOB_NOT_FROM_REGAT = 'This job execution is not from Regat. Therefore no need for notification.',
  PROMPT_ON_LAUNCH_DISABLED = '"Prompt on launch" option in Job Template is disabled. Please enable it for Limit and Variables.',
  TEMPLATE_LITERAL_NOT_ACCEPTABLE = 'Template literal expression calls unacceptable tag/label: ',
  ACTION_NAME_LENGTH_EXCEEDED = 'Action Name length must be less than or equal to 50 characters.',
  EXTRA_VARS_LENGTH_EXCEEDED = 'Total length of all extra vars combined must be less than or equal to 100 characters.',
  INVENTORY_NAME_LENGTH_EXCEEDED = 'Inventory Name length must be less than or equal to 150 characters.',
  CREDENTIAL_NAME_LENGTH_EXCEEDED = 'Credential Name length must be less than or equal to 150 characters.',
  LIMIT_LENGTH_EXCEEDED = 'Total length of all limit combined must be less than or equal to 100 characters.',
  MODULE_NAME_LENGTH_EXCEEDED = 'Module Name length must be less than or equal to 50 characters.',
  MODULE_ARGS_LENGTH_EXCEEDED = 'Total length of all module args combined must be less than or equal to 100 characters.',
  POLICY_HAS_NOT_BEEN_CREATED_YET_FOR_LIST = "The policy for this issue has not been created yet. Please create the policy first by adding an acceptable label to the issue's labels.",
  CANNOT_DELETE_ONLY_ONE_LABEL_LEFT = 'Regat cannot delete the last tags from the policy because an Opsgenie Policy must at least have one tag.\nIf you want to delete the policy, please delete manually through Opsgenie.',
  POLICY_ACTION_HAS_REACHED_MAXIMUM_CAPACITY = 'Total Actions for this Policy has reached maximum capacity.\nOne Policy can only hold up to 10 Actions only.',
  WORKAROUND_NOT_FOUND = 'Workaround not found. Please check the action name again. Action name must include the issue number.',
}

/**
 * Success Messages for Responses.
 * @enum {string}
 */
export enum SuccessMessageEnum {
  PROBLEM_RECORD_HAS_BEEN_CREATED = 'Problem Record has been created successfully. GitHub Issue URL: ',
  ISSUE_HAS_BEEN_CREATED = 'New Issue has been created.',
  POLICY_HAS_BEEN_ADDED_NOTE = "Policy has been added successfully\nPolicy's Name: ",
  POLICY_HAS_BEEN_ADDED = 'Policy has been added successfully.',
  POLICY_TAGS_UPDATED = "Policy's tags has been updated successfully.",
  POLICY_TAGS_DELETED = "Policy's tags has been deleted successfully.",
  ACTION_HAS_BEEN_ADDED = 'Action has been added successfully.',
  PROCESSING_EXECUTION_REQUEST = 'Processing execution request. Please wait.',
  NOTIFICATION_RECEIVED_AND_FORWARDED = 'Notification Has Been Received and Forwarded to Opsgenie.',
  LIST_OF_SUBMITTED_WORKAROUNDS = 'Here is the list of workarounds submitted for issue number: ',
  LIST_HAS_BEEN_SENT = 'The list of workarounds has been sent as requested.',
  ACTION_HAS_BEEN_DELETED = 'Action has been deleted.',
}

/**
 * Types of command.
 * @enum {string}
 */
export enum CommandTypeEnum {
  JOB_TEMPLATE = 'jobTemplate',
  AD_HOC_COMMAND = 'adhoc',
  REGAT_APP = '@regat-app',
  ADD = 'add',
  LIST = 'list',
  DELETE = 'delete',
  WORKAROUND = 'workaround',
}
