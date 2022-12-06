import * as assert from 'assert';
import * as cp from 'child_process';
import * as path from 'path';

import * as snapshots from './snapshots';

const eslintVersions: ReadonlyArray<number> = [6, 7, 8];

describe('compatibility', function () {
  describe('without violations', function () {
    const snapshot = snapshots.noViolations;

    for (const eslintVersion of eslintVersions) {
      it(`v${eslintVersion}`, function () {
        const {exitCode, stdout} = runEslint(eslintVersion, snapshot.inp);
        assert.equal(exitCode, 0);
        assert.equal(stdout, snapshot.out);
      });
    }
  });

  describe('with top-level-variable violation', function () {
    const snapshot = snapshots.noTopLevelVariablesViolation;

    for (const eslintVersion of eslintVersions) {
      it(`v${eslintVersion}`, function () {
        const {exitCode, stdout} = runEslint(eslintVersion, snapshot.inp);
        assert.equal(exitCode, 1);
        assert.equal(stdout, snapshot.out);
      });
    }
  });

  describe('with top-level-side-effect violation', function () {
    const snapshot = snapshots.noTopLevelSideEffectsViolation;

    for (const eslintVersion of eslintVersions) {
      it(`v${eslintVersion}`, function () {
        const {exitCode, stdout} = runEslint(eslintVersion, snapshot.inp);
        assert.equal(exitCode, 1);
        assert.equal(stdout, snapshot.out);
      });
    }
  });
});

function runEslint(
  version: number,
  snippet: string
): {exitCode: number | null; stdout: string} {
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

  const {status, stdout} = cp.spawnSync(
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

  return {exitCode: status, stdout};
}
