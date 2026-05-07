type EnvSource = Partial<Record<'ENV_FILE', string>>;

export function resolveEnvFilePath(env: EnvSource): string {
  return env.ENV_FILE?.trim() || '.env';
}
