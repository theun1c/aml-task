jest.mock('../../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { IssuesRepository } from './issues.repository';

describe('IssuesRepository', () => {
  it('deleteTx() should soft-delete issue instead of hard delete', async () => {
    const repository = new IssuesRepository({} as never);
    const tx = {
      issues: {
        update: jest.fn().mockResolvedValue({
          id: 'issue-1',
        }),
      },
    };

    await repository.deleteTx(tx as never, 'issue-1');

    expect(tx.issues.update).toHaveBeenCalledWith({
      where: {
        id: 'issue-1',
      },
      data: {
        deleted_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
    });
  });
});
