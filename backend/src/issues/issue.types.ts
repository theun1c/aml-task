import type { Prisma, project_members, projects } from '../../generated/prisma/client';

export type IssueListScope = {
  projectId: string;
  sprintId: string | null;
  statusId?: string;
};

export type ProjectAccess = {
  member: project_members;
  project: projects;
};

export const issueWithTypeInclude = {
  issue_types: {
    select: {
      code: true,
    },
  },
} satisfies Prisma.issuesInclude;

export type IssueEntity = Prisma.issuesGetPayload<{
  include: typeof issueWithTypeInclude;
}>;
