export const ISSUE_TYPE_VALUES = ['task', 'bug', 'story', 'epic', 'subtask'] as const;

export type IssueTypeValue = (typeof ISSUE_TYPE_VALUES)[number];
