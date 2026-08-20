#!/usr/bin/env node
/**
 * GETHIRED_EMPLOYER_GUEST_JOB_DRAFT_LOCAL_VERIFICATION_AND_POSTING_FLOW_MASTER_COMMAND (TAB 05)
 *
 * Dev-only helper: completes REAL Firebase Auth Emulator email verification
 * for a local test account, through the actual backend verifyemail
 * endpoint -- exactly the same code path a real user's clicked verification
 * link would hit. It never touches emailVerified directly and never talks
 * to production. There is no browser UI for this on purpose (see the
 * command's TAB 05/07 hard rules) -- a terminal helper can't accidentally
 * ship into a production build the way a runtime button could.
 *
 * Usage:
 *   npm run verify-local-user -- <email>
 *
 * Manual fallback (if you'd rather do it by hand, or this script can't run):
 *   1. Open http://127.0.0.1:9099/emulator/v1/projects/get-hired-363107/oobCodes
 *      and find the newest VERIFY_EMAIL entry for your email.
 *   2. curl -X POST "http://localhost:3000/api/auth/verifyemail?oobCode=<the code>"
 *
 * Canonical local stack startup (all four, each in its own terminal):
 *   1. docker start gethired-local-db
 *   2. cd get-hired-BE && npx firebase emulators:start --only auth --project get-hired-363107 \
 *        --import=<local-emulator-data-dir> --export-on-exit=<local-emulator-data-dir>
 *      (the --import/--export-on-exit pair is what lets emulator users survive an
 *      ordinary restart -- point both at the same directory, kept outside both
 *      git repos so it's never accidentally committed)
 *   3. cd get-hired-BE && (Windows env vars) FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *        CORS_ADDITIONAL_DEV_ORIGINS=http://localhost:4200,http://localhost:4201 node start.js
 *   4. cd get-hired-FE && ng serve --port 4200
 */

const EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const API_BASE = process.env.LOCAL_API_BASE || 'http://localhost:3000/api';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'get-hired-363107';

// HARD RULE (TAB 03/05/07): this helper must refuse to operate against
// anything that isn't clearly local. It only ever targets localhost/127.0.0.1
// hosts -- there is no override path that lets it reach a real project.
function isLocalHostTarget(hostOrUrl) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(hostOrUrl)
    || /:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(hostOrUrl);
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run verify-local-user -- <email>');
    process.exitCode = 1;
    return;
  }

  if (!isLocalHostTarget(EMULATOR_HOST) || !isLocalHostTarget(API_BASE)) {
    console.error(
      `Refusing to run: target is not local (emulator=${EMULATOR_HOST}, api=${API_BASE}). ` +
      'This helper only ever operates against a local Firebase Auth Emulator and local backend.'
    );
    process.exitCode = 1;
    return;
  }

  const oobUrl = `http://${EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/oobCodes`;
  let oobRes;
  try {
    oobRes = await fetch(oobUrl);
  } catch (err) {
    console.error(
      `Could not reach the local Firebase Auth Emulator at ${EMULATOR_HOST}. Is it running?\n` +
      `  cd get-hired-BE && npx firebase emulators:start --only auth --project ${PROJECT_ID}`
    );
    process.exitCode = 1;
    return;
  }
  if (!oobRes.ok) {
    console.error(`Emulator responded with HTTP ${oobRes.status} while listing OOB codes.`);
    process.exitCode = 1;
    return;
  }

  const oobData = await oobRes.json();
  const codes = (oobData.oobCodes || []).filter(
    (c) => c.email && c.email.toLowerCase() === email.toLowerCase() && c.requestType === 'VERIFY_EMAIL'
  );

  if (codes.length === 0) {
    // Distinguish *why* there's no code, per TAB 05's requirement, instead
    // of a single flat "not found" message.
    let lookupData = null;
    try {
      const lookupRes = await fetch(
        `http://${EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=fake-api-key`,
        {
          method: 'POST',
          headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: [email] }),
        }
      );
      lookupData = await lookupRes.json();
    } catch (_) {
      // fall through to the generic message below
    }

    const user = lookupData && lookupData.users && lookupData.users[0];
    if (!user) {
      console.error(
        `No account for ${email} exists in the local emulator right now.\n` +
        'Either it was never registered against this emulator instance, or it was ' +
        'registered before the emulator was last restarted WITHOUT --import/--export-on-exit ' +
        '(emulator data is in-memory and does not survive an ordinary restart unless those flags ' +
        'are used). Register the account again against the currently running emulator.'
      );
    } else if (user.emailVerified) {
      console.log(`${email} is already verified. Nothing to do.`);
      return;
    } else {
      console.error(
        `${email} exists and is unverified, but no pending verification code was found. ` +
        'Trigger a resend from the app (or re-register) and try again.'
      );
    }
    process.exitCode = 1;
    return;
  }

  // Emulator appends codes in request order -- last match is the newest.
  const oobCode = codes[codes.length - 1].oobCode;

  const verifyUrl = `${API_BASE}/auth/verifyemail?oobCode=${encodeURIComponent(oobCode)}`;
  let verifyRes;
  try {
    verifyRes = await fetch(verifyUrl, { method: 'POST' });
  } catch (err) {
    console.error(`Could not reach the local backend at ${API_BASE}. Is it running? (node start.js in get-hired-BE)`);
    process.exitCode = 1;
    return;
  }

  const verifyBody = await verifyRes.json().catch(() => null);
  if (!verifyRes.ok) {
    console.error(`Verification failed: ${(verifyBody && verifyBody.error) || `HTTP ${verifyRes.status}`}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Verified: ${email}`);
}

main();
