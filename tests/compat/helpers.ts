import * as cp from 'child_process';
import * as path from 'path';

export function runEslint(version: number, snippet: string): {stdout: string} {
  const projectRoot = path.resolve('.');
  const nodeModules = path.resolve(projectRoot, 'node_modules');
  const eslintCli = {
    6: path.resolve(nodeModules, 'eslint-v6', 'bin', 'eslint.js'),
    7: path.resolve(nodeModules, 'eslint-v7', 'bin', 'eslint.js'),
    8: path.resolve(nodeModules, 'eslint-v8', 'bin', 'eslint.js')
  }[version];

  if (!eslintCli) {
    throw new Error(`Unknown ESLint version ${version}`);
  }

  return cp.spawnSync(
    'node',
    [
      eslintCli,
      // Avoid interference from a local ESLint configuration file
      '--no-eslintrc',
      // Lint from stdin
      '--stdin',
      // Configure this plugin
      '--plugin',
      '@ericcornelissen/top',
      '--rule',
      '@ericcornelissen/top/no-top-level-variables: error',
      '--rule',
      '@ericcornelissen/top/no-top-level-side-effect: error'
    ],
    {
      encoding: 'utf-8',
      // Provide stdin
      input: snippet
    }
  );
}
