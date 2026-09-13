'use strict';
/**
 * Specification of the pre-push test gate (B4). Plain Node, no framework, any Node from 12:
 *   node scripts/pre-push-gate/gate.spec.js     (npm run gate:spec)
 * The Angular suite runs in a browser under Karma. This gate decides whether that suite ran at all,
 * so it is specified outside it.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const gate = require('./gate');

const root = path.resolve(__dirname, '..', '..');
const runJs = path.join(__dirname, 'run.js');
let passed = 0;
const failures = [];

function it(name, fn) {
  try { fn(); passed++; console.log('  ok    ' + name); }
  catch (err) { failures.push(name); console.log('  FAIL  ' + name + '\n        ' + String(err.message).split('\n').join('\n        ')); }
}

const GREEN = '\u001b[1A\u001b[2KChrome Headless 152 (Mac OS 10.15.7): Executed 100 of 555 SUCCESS\n'
  + 'Chrome Headless 152 (Mac OS 10.15.7): Executed 555 of 555 SUCCESS (4.2 secs / 3.9 secs)\nTOTAL: 555 SUCCESS\n';
const ZERO = 'Chrome Headless 152 (Mac OS 10.15.7): Executed 0 of 0 SUCCESS (0.001 secs / 0 secs)\nTOTAL: 0 SUCCESS\n';

function tmpDir(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
function writeFile(dir, name, text) { const p = path.join(dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return p; }
function runGate(args, env, node) {
  return childProcess.spawnSync(node || process.execPath, [runJs].concat(args), { encoding: 'utf8', env: Object.assign({}, process.env, env) });
}
const currentMajor = gate.nodeMajorOf(process.version);

console.log('pre-push gate spec on Node ' + process.version);

it('reads Node 16 from the real deploy workflow', () => {
  assert.strictEqual(gate.deployNodeMajor(fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy.yml'), 'utf8')), 16);
});

it('reads the major from every node-version form, including a byte-order mark', () => {
  ["node-version: '16'", 'node-version: "16"', 'node-version: 16', "node-version: '16.x'", 'node-version: 16.20.2', "node-version: 'v18' # lts"]
    .forEach((line, i) => assert.strictEqual(gate.deployNodeMajor('\ufeffjobs:\n  with:\n    ' + line + '\n'), i === 5 ? 18 : 16, line));
});

it('refuses a workflow with no numeric node-version, or with two different majors', () => {
  assert.throws(() => gate.deployNodeMajor('steps:\n  - uses: actions/checkout@v4\n'), /no numeric node-version/);
  assert.throws(() => gate.deployNodeMajor("with:\n  node-version: 'lts/*'\n"), /no numeric node-version/);
  assert.throws(() => gate.deployNodeMajor("a:\n  node-version: '16'\nb:\n  node-version: '18'\n"), /more than one Node major: 16, 18/);
});

it('a run that executed 0 specs fails, even with exit 0', () => {
  const verdict = gate.evaluateKarmaRun(ZERO, 0);
  assert.strictEqual(verdict.ok, false);
  assert.match(verdict.reason, /0 specs executed/);
});

it('a run that never reported executing anything (a compile error) fails', () => {
  const verdict = gate.evaluateKarmaRun('Error: src/app/x.ts:1:1 - error TS2345: nope\n', 1);
  assert.strictEqual(verdict.ok, false);
  assert.match(verdict.reason, /never reported executing a spec/);
});

it('a focused or partial run fails: executed must equal the total', () => {
  const verdict = gate.evaluateKarmaRun('Executed 3 of 555 (skipped 552) SUCCESS (0.1 secs / 0.1 secs)\nTOTAL: 3 SUCCESS\n', 0);
  assert.strictEqual(verdict.ok, false);
  assert.match(verdict.reason, /executed 3 of 555/);
});

it('a run with a failed spec fails, whatever its exit code', () => {
  const log = 'Executed 555 of 555 (1 FAILED) (4 secs / 4 secs)\nTOTAL: 1 FAILED, 554 SUCCESS\n';
  [0, 1].forEach(code => {
    const verdict = gate.evaluateKarmaRun(log, code);
    assert.strictEqual(verdict.ok, false, 'exit ' + code);
    assert.match(verdict.reason, /1 spec\(s\) failed/);
  });
});

it('a complete run that exits non-zero still fails', () => {
  const verdict = gate.evaluateKarmaRun(GREEN, 1);
  assert.strictEqual(verdict.ok, false);
  assert.match(verdict.reason, /exited 1/);
});

it('a complete green run passes, judged by its last Executed line with ANSI codes stripped', () => {
  const verdict = gate.evaluateKarmaRun(GREEN, 0);
  assert.strictEqual(verdict.ok, true, verdict.reason);
  assert.strictEqual(verdict.executed, 555);
  assert.strictEqual(verdict.total, 555);
});

it('CI and GitHub Actions never install the hook; a developer machine does', () => {
  assert.strictEqual(gate.shouldInstallHooks({ CI: 'true' }), false);
  assert.strictEqual(gate.shouldInstallHooks({ CI: '1' }), false);
  assert.strictEqual(gate.shouldInstallHooks({ GITHUB_ACTIONS: 'true' }), false);
  assert.strictEqual(gate.shouldInstallHooks({}), true);
  assert.strictEqual(gate.shouldInstallHooks({ CI: 'false' }), true);
  assert.strictEqual(gate.shouldInstallHooks({ CI: '' }), true);
});

it('looks for a Node of the deploy major, most explicit first, and takes the first that really is that major', () => {
  const listDir = () => ['v22.23.2', 'v16.3.0', 'v16.20.2'];
  const candidates = gate.nodeCandidates(16, { HOME: '/h', GETHIRED_GATE_NODE: '/opt/pinned/node' }, listDir);
  assert.deepStrictEqual(candidates, ['/opt/pinned/node', '/h/.nvm/versions/node/v16.20.2/bin/node', '/h/.nvm/versions/node/v16.3.0/bin/node', 'node']);
  const versions = { '/opt/pinned/node': 'v22.23.2', '/h/.nvm/versions/node/v16.20.2/bin/node': 'v16.20.2\n' };
  assert.deepStrictEqual(gate.findNodeForMajor(16, candidates, c => versions[c] || null), { node: '/h/.nvm/versions/node/v16.20.2/bin/node', version: 'v16.20.2' });
  assert.strictEqual(gate.findNodeForMajor(99, candidates, c => versions[c] || null), null);
});

it('with no Node of the deploy major, run.js stops loudly with the install hint and tests nothing', () => {
  const dir = tmpDir('gh-gate-');
  const workflow = writeFile(dir, 'deploy.yml', "with:\n  node-version: '99'\n");
  const green = writeFile(dir, 'green.log', GREEN);
  const result = runGate(['--workflow', workflow, '--karma-log', green, '--karma-exit', '0'], { HOME: dir, NVM_DIR: path.join(dir, 'nvm'), GETHIRED_GATE_NODE: '' });
  assert.strictEqual(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /no Node 99 was found/);
  assert.match(result.stderr, /nvm install 99/);
  assert.doesNotMatch(result.stdout, /PASS/);
});

it('on the deploy major, run.js passes a green run and fails a run of 0 specs', () => {
  const dir = tmpDir('gh-gate-');
  const workflow = writeFile(dir, 'deploy.yml', "with:\n  node-version: '" + currentMajor + "'\n");
  const green = runGate(['--workflow', workflow, '--karma-log', writeFile(dir, 'green.log', GREEN), '--karma-exit', '0'], {});
  assert.strictEqual(green.status, 0, green.stdout + green.stderr);
  assert.match(green.stdout, /PASS, 555 of 555 specs executed and passed/);
  const zero = runGate(['--workflow', workflow, '--karma-log', writeFile(dir, 'zero.log', ZERO), '--karma-exit', '0'], {});
  assert.strictEqual(zero.status, 1, zero.stdout + zero.stderr);
  assert.match(zero.stderr, /FAIL, 0 specs executed/);
});

it('started on another major, run.js re-runs itself on a Node of the deploy major', () => {
  const others = ['/usr/local/bin/node', path.join(os.homedir(), '.nvm', 'versions', 'node')]
    // A path is either a Node binary or nvm's versions directory, which also ends in "node":
    // tell them apart by what is on disk, not by the name.
    .map(p => { try { return fs.statSync(p).isFile() ? [p] : fs.readdirSync(p).map(v => path.join(p, v, 'bin', 'node')); } catch (e) { return []; } })
    .reduce((all, x) => all.concat(x), [])
    .filter(p => { const r = childProcess.spawnSync(p, ['-v'], { encoding: 'utf8' }); return r.status === 0 && gate.nodeMajorOf(r.stdout) !== currentMajor; });
  assert.ok(others.length > 0, 'needs a second Node of a different major on this machine to exercise the re-run');
  const dir = tmpDir('gh-gate-');
  const workflow = writeFile(dir, 'deploy.yml', "with:\n  node-version: '" + currentMajor + "'\n");
  const result = runGate(['--workflow', workflow, '--karma-log', writeFile(dir, 'green.log', GREEN), '--karma-exit', '0'], { GETHIRED_GATE_NODE: process.execPath }, others[0]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp('re-running on ' + process.execPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(result.stdout, /PASS/);
});

it('in a scratch git repo: prepare skips under CI, installs otherwise, and the hook stops a real push on the wrong Node', () => {
  const repo = tmpDir('gh-gate-repo-');
  const git = (args, env) => childProcess.spawnSync('git', ['-c', 'user.name=gate', '-c', 'user.email=gate@example.invalid'].concat(args), { cwd: repo, encoding: 'utf8', env: Object.assign({}, process.env, env || {}) });
  assert.strictEqual(git(['init', '-q']).status, 0);
  ['gate.js', 'run.js', 'install.js'].forEach(f => writeFile(repo, 'scripts/pre-push-gate/' + f, fs.readFileSync(path.join(__dirname, f), 'utf8')));
  const hook = writeFile(repo, 'scripts/git-hooks/pre-push', fs.readFileSync(path.join(root, 'scripts', 'git-hooks', 'pre-push'), 'utf8'));
  fs.chmodSync(hook, 0o755);
  writeFile(repo, '.github/workflows/deploy.yml', "with:\n  node-version: '99'\n");
  const install = env => childProcess.spawnSync(process.execPath, ['scripts/pre-push-gate/install.js'], { cwd: repo, encoding: 'utf8', env: Object.assign({}, process.env, env) });
  const hooksPath = () => git(['config', '--get', 'core.hooksPath']).stdout.trim();

  const ci = install({ CI: 'true' });
  assert.match(ci.stdout, /CI detected/);
  assert.strictEqual(hooksPath(), '', 'CI must not install the hook');
  const dev = install({ CI: '', GITHUB_ACTIONS: '' });
  assert.match(dev.stdout, /installed/);
  assert.strictEqual(hooksPath(), 'scripts/git-hooks');

  const remote = tmpDir('gh-gate-remote-');
  assert.strictEqual(childProcess.spawnSync('git', ['init', '-q', '--bare', remote]).status, 0);
  assert.strictEqual(git(['add', '-A']).status, 0);
  assert.strictEqual(git(['commit', '-q', '-m', 'gate fixture']).status, 0);
  const push = git(['push', remote, 'HEAD:refs/heads/main'], { HOME: repo, NVM_DIR: path.join(repo, 'no-nvm'), GETHIRED_GATE_NODE: '' });
  assert.notStrictEqual(push.status, 0, 'the push went through');
  assert.match(push.stderr, /nvm install 99/);
  const refs = childProcess.spawnSync('git', ['--git-dir', remote, 'for-each-ref'], { encoding: 'utf8' }).stdout.trim();
  assert.strictEqual(refs, '', 'the remote received refs despite the gate');
});

console.log('\n' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) { process.exitCode = 1; }
