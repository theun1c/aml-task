import { issue_type } from '../../generated/prisma/enums';

export const ISSUE_TYPE_VALUES = [issue_type.task, issue_type.bug] as const;

export type IssueTypeValue = (typeof ISSUE_TYPE_VALUES)[number];
