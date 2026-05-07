export const ISSUE_TYPE_VALUES = ['task', 'bug'] as const;

export type IssueTypeValue = (typeof ISSUE_TYPE_VALUES)[number];
