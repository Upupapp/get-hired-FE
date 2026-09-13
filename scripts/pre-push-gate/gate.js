'use strict';
/**
 * The pre-push test gate's decisions, free of side effects so they can be specified alone
 * (gate.spec.js). run.js does the I/O; install.js wires the hook.
 *
 * Node 12 syntax on purpose: this file runs under whatever Node starts the hook before it can
 * switch to the Node the deploy ships with.
 */
const path = require('path');

function stripAnsi(text) {
  return String(text).replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '');
}

/**
 * The Node major the deploy ships with: actions/setup-node's `node-version` in the deploy workflow
 * ('16', "16", 16, '16.x', 16.20.2). Anything missing or ambiguous is an error, never a guess.
 */
function deployNodeMajor(workflowText) {
  const text = String(workflowText).replace(/^\ufeff/, '');
  const re = /^\s*node-version\s*:\s*['"]?v?(\d+)(?:\.[0-9x*]+)*['"]?\s*(?:#.*)?$/gm;
  const majors = [];
  let match;
  while ((match = re.exec(text)) !== null) { majors.push(Number(match[1])); }
  const distinct = majors.filter((major, i) => majors.indexOf(major) === i);
  if (distinct.length === 0) { throw new Error('no numeric node-version found in the deploy workflow'); }
  if (distinct.length > 1) { throw new Error('the deploy workflow names more than one Node major: ' + distinct.join(', ')); }
  return distinct[0];
}

function nodeMajorOf(version) {
  const match = /^v?(\d+)(?:\.|$)/.exec(String(version).trim());
  return match ? Number(match[1]) : null;
}

function compareVersionsDesc(a, b) {
  const parts = v => String(v).replace(/^v/, '').split('.').map(n => Number(n) || 0);
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < 3; i++) {
    if ((pb[i] || 0) !== (pa[i] || 0)) { return (pb[i] || 0) - (pa[i] || 0); }
  }
  return 0;
}

/**
 * Where to look for a Node of that major, most explicit first: GETHIRED_GATE_NODE, then nvm's
 * installs of that major (newest first), then the `node` on PATH.
 */
function nodeCandidates(major, env, listDir) {
  const candidates = [];
  if (env.GETHIRED_GATE_NODE) { candidates.push(env.GETHIRED_GATE_NODE); }
  const nvmDir = env.NVM_DIR || (env.HOME ? path.join(env.HOME, '.nvm') : null);
  if (nvmDir) {
    const versionsDir = path.join(nvmDir, 'versions', 'node');
    listDir(versionsDir)
      .filter(name => nodeMajorOf(name) === major)
      .sort(compareVersionsDesc)
      .forEach(name => candidates.push(path.join(versionsDir, name, 'bin', 'node')));
  }
  candidates.push('node');
  return candidates;
}

/** The first candidate whose own `node -v` reports that major, or null. */
function findNodeForMajor(major, candidates, versionOf) {
  for (let i = 0; i < candidates.length; i++) {
    const version = versionOf(candidates[i]);
    if (version && nodeMajorOf(version) === major) { return { node: candidates[i], version: String(version).trim() }; }
  }
  return null;
}

function missingNodeMessage(major, workflowPath) {
  return [
    'pre-push gate: this repository deploys on Node ' + major + ' (' + workflowPath + '), and no Node ' + major + ' was found.',
    'The tests must pass on the Node that ships. Install it with:  nvm install ' + major,
    'or set GETHIRED_GATE_NODE to a Node ' + major + ' binary. The push was stopped; nothing was tested.',
  ].join('\n');
}

/**
 * Judges an `ng test` run by its output and exit code together. It passes only when the last
 * "Executed N of M" line shows N > 0 and N = M, nothing failed, the TOTAL line confirms M successes,
 * and the process exited 0. A runner can exit 0 having executed nothing, or run a focused subset,
 * so the exit code alone decides nothing.
 */
function evaluateKarmaRun(output, exitCode) {
  const text = stripAnsi(output);
  const executedLines = text.match(/Executed \d+ of \d+[^\n]*/g) || [];
  const last = executedLines.length ? executedLines[executedLines.length - 1] : null;
  const counts = last ? /Executed (\d+) of (\d+)/.exec(last) : null;
  const executed = counts ? Number(counts[1]) : 0;
  const total = counts ? Number(counts[2]) : 0;
  const failedMatch = last ? /\((\d+) FAILED\)/.exec(last) : null;
  const failed = failedMatch ? Number(failedMatch[1]) : 0;
  const totals = text.match(/^TOTAL: [^\n]*/gm) || [];
  const totalLine = totals.length ? totals[totals.length - 1].trim() : null;
  const verdict = (ok, reason) => ({ ok: ok, executed: executed, total: total, failed: failed, reason: reason });

  if (!last) { return verdict(false, 'the run never reported executing a spec (no "Executed N of M" line)'); }
  if (executed === 0) { return verdict(false, '0 specs executed'); }
  if (executed !== total) { return verdict(false, 'executed ' + executed + ' of ' + total + ' specs: the rest did not run (a focused spec, or skips)'); }
  if (failed > 0 || /FAILED/.test(last)) { return verdict(false, failed + ' spec(s) failed'); }
  if (totalLine !== 'TOTAL: ' + total + ' SUCCESS') { return verdict(false, 'the TOTAL line does not confirm ' + total + ' successes (' + (totalLine || 'missing') + ')'); }
  if (exitCode !== 0) { return verdict(false, 'every count passed, but ng test exited ' + exitCode); }
  return verdict(true, executed + ' of ' + total + ' specs executed and passed');
}

/** npm runs prepare on every install and on `npm ci`: CI (the deploy) must never install hooks. */
function shouldInstallHooks(env) {
  const set = value => value !== undefined && value !== '' && value !== '0' && String(value).toLowerCase() !== 'false';
  return !(set(env.CI) || set(env.GITHUB_ACTIONS));
}

module.exports = {
  stripAnsi, deployNodeMajor, nodeMajorOf, compareVersionsDesc, nodeCandidates,
  findNodeForMajor, missingNodeMessage, evaluateKarmaRun, shouldInstallHooks,
};
