'use strict';
/**
 * npm's `prepare` step (B4): points this clone's git hooks at the versioned scripts/git-hooks, so
 * `git push` runs the pre-push gate. It does nothing under CI, where the deploy's `npm ci` also runs
 * prepare, or outside a git work tree, and it never fails an install.
 */
const childProcess = require('child_process');
const path = require('path');
const gate = require('./gate');

function install() {
  if (!gate.shouldInstallHooks(process.env)) {
    console.log('pre-push gate: CI detected; git hooks not installed.');
    return;
  }
  const root = path.resolve(__dirname, '..', '..');
  const inside = childProcess.spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: root, encoding: 'utf8' });
  if (inside.status !== 0 || String(inside.stdout).trim() !== 'true') {
    console.log('pre-push gate: not a git work tree; git hooks not installed.');
    return;
  }
  const set = childProcess.spawnSync('git', ['config', 'core.hooksPath', 'scripts/git-hooks'], { cwd: root, encoding: 'utf8' });
  if (set.status !== 0) {
    console.warn('pre-push gate: could not set core.hooksPath: ' + String(set.stderr).trim());
    return;
  }
  console.log('pre-push gate: installed (core.hooksPath = scripts/git-hooks).');
}

try { install(); } catch (err) { console.warn('pre-push gate: install skipped: ' + err.message); }
