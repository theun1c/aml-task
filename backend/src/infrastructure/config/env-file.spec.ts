import { resolveEnvFilePath } from './env-file';

describe('resolveEnvFilePath', () => {
  it('returns ENV_FILE when it is provided', () => {
    expect(resolveEnvFilePath({ ENV_FILE: '.env.dev' })).toBe('.env.dev');
  });

  it('falls back to .env when ENV_FILE is missing', () => {
    expect(resolveEnvFilePath({})).toBe('.env');
  });
});
