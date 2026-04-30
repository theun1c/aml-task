import type { issues, project_members, projects } from '../../generated/prisma/client';

export type IssueListScope = {
  projectId: string;
  sprintId: string | null;
  statusId?: string;
};

export type ProjectAccess = {
  member: project_members;
  project: projects;
};

export type IssueEntity = issues;
