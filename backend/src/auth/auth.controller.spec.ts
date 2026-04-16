jest.mock('./auth.service', () => ({
  AuthService: class AuthService {},
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    const authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logoutCurrentSession: jest.fn(),
      logoutAllSessions: jest.fn(),
      getSessions: jest.fn(),
    } as unknown as AuthService;

    controller = new AuthController(authServiceMock);
  });

  it('me() should return only public user fields', () => {
    const result = controller.me({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Name',
      sessionId: 'session-1',
    });

    expect(result).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Name',
    });
  });
});
