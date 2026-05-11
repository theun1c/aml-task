import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    controller = new UsersController(usersService);
  });

  it('me() should delegate to users service with current user id', async () => {
    usersService.getProfile.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });

    await expect(
      controller.me({
        id: 'user-1',
        email: 'user@example.com',
        name: 'User Name',
        sessionId: 'session-1',
      }),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });
    expect(usersService.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('updateMe() should delegate to users service with current user id and dto', async () => {
    usersService.updateProfile.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      full_name: 'New Name',
    });

    await expect(
      controller.updateMe(
        {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User Name',
          sessionId: 'session-1',
        },
        {
          email: 'new@example.com',
          full_name: 'New Name',
        },
      ),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'new@example.com',
      full_name: 'New Name',
    });
    expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
      email: 'new@example.com',
      full_name: 'New Name',
    });
  });
});
