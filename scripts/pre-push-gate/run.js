#!/usr/bin/env node
'use strict';
/**
 * The pre-push test gate (B4). Started by scripts/git-hooks/pre-push, or by hand: `npm run gate`.
 *
 *   1. Reads the Node major the deploy ships with from .github/workflows/deploy.yml.
 *   2. On any other major, re-runs itself on a Node of that major, or stops with the install hint.
 *      It never tests on the wrong Node and never passes silently.
 *   3. Runs `ng test` once, headless, and judges the run by its executed-spec count (gate.js).
 *
 * For specifying the gate without a browser run:
 *   --workflow <file>                        read the Node major from this file instead
 *   --karma-log <file> --karma-exit <code>   judge a captured run instead of running ng test
 */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const gate = require('./gate');

const root = path.resolve(__dirname, '..', '..');

function option(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

function stop(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function report(verdict) {
  if (verdict.ok) {
    process.stdout.write('pre-push gate: PASS, ' + verdict.reason + '.\n');
    process.exit(0);
  }
  stop('pre-push gate: FAIL, ' + verdict.reason + '. The push was stopped.');
}

const workflowPath = option('--workflow') || path.join(root, '.github', 'workflows', 'deploy.yml');
const workflowLabel = path.relative(root, workflowPath) || workflowPath;

let major;
try {
  major = gate.deployNodeMajor(fs.readFileSync(workflowPath, 'utf8'));
} catch (err) {
  stop('pre-push gate: cannot read the deploy\'s Node version from ' + workflowLabel + ': ' + err.message + '. The push was stopped.');
}

const running = gate.nodeMajorOf(process.version);
if (running !== major) {
  if (process.env.GETHIRED_GATE_REEXEC) {
    stop('pre-push gate: re-ran on ' + process.execPath + ', which is Node ' + running + ', not ' + major + '. The push was stopped.');
  }
  const listDir = dir => { try { return fs.readdirSync(dir); } catch (err) { return []; } };
  const versionOf = candidate => {
    const result = childProcess.spawnSync(candidate, ['-v'], { encoding: 'utf8' });
    return result.status === 0 ? result.stdout : null;
  };
  const found = gate.findNodeForMajor(major, gate.nodeCandidates(major, process.env, listDir), versionOf);
  if (!found) { stop(gate.missingNodeMessage(major, workflowLabel)); }
  process.stdout.write('pre-push gate: the deploy runs Node ' + major + '; re-running on ' + found.node + ' (' + found.version + ').\n');
  const env = Object.assign({}, process.env, { GETHIRED_GATE_REEXEC: '1' });
  const bin = path.dirname(found.node);
  if (bin && bin !== '.') { env.PATH = bin + path.delimiter + (env.PATH || ''); }
  const rerun = childProcess.spawnSync(found.node, [__filename].concat(process.argv.slice(2)), { stdio: 'inherit', env: env });
  process.exit(rerun.status === null ? 1 : rerun.status);
}

const karmaLog = option('--karma-log');
if (karmaLog) {
  report(gate.evaluateKarmaRun(fs.readFileSync(karmaLog, 'utf8'), Number(option('--karma-exit') || '0')));
} else {
  process.stdout.write('pre-push gate: running ng test on Node ' + process.version + ' (the deploy runs Node ' + major + ').\n');
  const child = childProcess.spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['ng', 'test', '--watch=false', '--browsers=ChromeHeadless', '--progress=false'], { cwd: root, env: process.env });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { output += chunk; process.stderr.write(chunk); });
  child.on('close', code => report(gate.evaluateKarmaRun(output, code === null ? 1 : code)));
}
