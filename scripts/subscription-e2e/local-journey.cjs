'use strict';
// Isolated local API journey. Real billing domain/HTTP handlers; simulated provider.
// No persistent database, Firebase account, provider request or email worker.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const backend = process.env.GETHIRED_E2E_BACKEND || '/Users/user/Documents/ChatGPT/GETHIRED';
const { PGlite } = require(path.join(backend, 'node_modules/@electric-sql/pglite'));
const express = require(path.join(backend, 'node_modules/express'));
const { billing } = require(path.join(backend, 'services/paymongo-billing/service.cjs'));
const { routes, webhook } = require(path.join(backend, 'services/paymongo-billing/http.cjs'));

async function main() {
  const pg = new PGlite();
  let server;
  try {
    await pg.exec(`CREATE SCHEMA gethired;
      CREATE TABLE gethired.companies(company_id VARCHAR PRIMARY KEY,created_by VARCHAR);
      CREATE TABLE gethired.user_credentials(uid VARCHAR PRIMARY KEY,role INT,is_archive BOOLEAN DEFAULT FALSE);
      CREATE TABLE gethired.company_employees(company_id VARCHAR,employee_uuid VARCHAR);
      CREATE TABLE gethired.jobs(job_id VARCHAR,company_id VARCHAR,job_status_id INT);
      CREATE TABLE gethired.companies_subscription(company_id VARCHAR,subscription_id INT,created_at TIMESTAMPTZ DEFAULT NOW(),payment_date TIMESTAMPTZ,period_start TIMESTAMPTZ,period_end TIMESTAMPTZ,sub_status VARCHAR,is_paid BOOLEAN,plan_slug VARCHAR,billing_cycle VARCHAR);`);
    for (const file of ['20260831_notifications.sql','subscription_engagement_migration.sql','payment_webhook_events_ddl.sql','20260630_invoice_billing_schema.sql','paymongo_billing_migration.sql']) {
      await pg.exec(fs.readFileSync(path.join(backend, 'db', file), 'utf8'));
    }
    await pg.exec(`INSERT INTO gethired.companies VALUES('e2e-company','e2e-owner'),('other-company','other-owner');
      INSERT INTO gethired.user_credentials(uid,role) VALUES('e2e-owner',2),('other-owner',2),('e2e-recruiter',2);
      INSERT INTO gethired.company_employees VALUES('e2e-company','e2e-owner'),('other-company','other-owner'),('e2e-company','e2e-recruiter');
      INSERT INTO gethired.companies_subscription(company_id,subscription_id,plan_slug,is_paid,sub_status,period_start,period_end,billing_cycle,engagement_plan_version)
      VALUES('e2e-company',1,'free_trial',FALSE,'trialing','2026-09-01','2026-09-15','monthly','pricing_2026_09');`);
    const now = new Date('2026-09-13T04:00:00Z');
    const config = {enabled:true,mode:'test',nodeEnv:'test',dbHost:'localhost',webhookSecret:crypto.randomBytes(32).toString('hex'),clock:()=>now};
    const attempts = new Map();
    const service = billing(pg, 'gethired', config, {createLink:async attempt => {
      attempts.set(attempt.id, attempt);
      return {linkId:'link_'+attempt.id,referenceNumber:'ref_'+attempt.id,checkoutUrl:'https://pm.link/'+attempt.id};
    }});
    const app = express();
    app.post('/api/payment/paymongowebhook', express.raw({type:'application/json'}), webhook(service));
    app.use(express.json());
    app.use('/api', routes(express, service, (req,res,next) => {
      req.user = {uid:req.headers['test-uid'] || 'e2e-owner'}; next();
    }));
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.on('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function api(route, body, uid='e2e-owner') {
      const response = await fetch(base+route, {method:body?'POST':'GET',headers:{'content-type':'application/json','test-uid':uid},body:body?JSON.stringify(body):undefined});
      return {status:response.status,body:await response.json()};
    }
    async function event(attempt, type='payment.paid', eventId='evt_'+attempt.paymentAttemptId) {
      const raw = Buffer.from(JSON.stringify({data:{id:eventId,type:'event',attributes:{type,livemode:false,data:{id:'pay_'+attempt.paymentAttemptId,type:'payment',attributes:{amount:attempt.amountMinor,currency:'PHP',status:type==='payment.failed'?'failed':'paid',livemode:false,metadata:{internal_payment_reference:attempts.get(attempt.paymentAttemptId).internal_reference},source:{type:'gcash'}}}}}}));
      const stamp = Math.floor(+now/1000);
      const signature = crypto.createHmac('sha256',config.webhookSecret).update(stamp+'.').update(raw).digest('hex');
      return fetch(base+'/payment/paymongowebhook',{method:'POST',headers:{'content-type':'application/json','paymongo-signature':`t=${stamp},te=${signature}`},body:raw});
    }
    let checks = 0;
    const preview = await api('/employer/subscription/upgrade-preview',{planCode:'growth',billingCycle:'monthly'});
    assert.equal(preview.body.amountMinor,299000); checks++;
    const request = {planCode:'growth',billingCycle:'monthly',idempotencyKey:'e2e_growth_001'};
    const created = await api('/employer/subscription/checkout',request);
    assert.equal(created.status,200); assert.equal(created.body.status,'PENDING'); assert.match(created.body.checkoutUrl,/^https:\/\/pm\.link\//); checks++;
    const attempt = created.body;
    assert.equal((await api('/employer/subscription/checkout',request)).body.paymentAttemptId,attempt.paymentAttemptId); checks++;
    assert.equal((await api(`/employer/subscription/checkout/${attempt.paymentAttemptId}/status`)).body.status,'PENDING');
    assert.equal((await api('/employer/subscription/entitlements')).body.status,'trialing'); checks++;
    assert.equal((await api(`/employer/subscription/checkout/${attempt.paymentAttemptId}/status`,undefined,'other-owner')).status,404);
    assert.equal((await api('/employer/subscription/checkout',request,'e2e-recruiter')).status,403); checks++;
    assert.equal((await event(attempt)).status,200);
    const paid = await api(`/employer/subscription/checkout/${attempt.paymentAttemptId}/status`);
    assert.equal(paid.body.status,'PAID'); assert.equal(paid.body.subscription.planCode,'growth'); assert.equal(paid.body.subscription.entitlements.jobs,15); checks++;
    await event(attempt);
    assert.equal((await api('/employer/billing/history')).body.items.length,1); checks++;
    const addon = (await api('/employer/storage-addons/checkout',{packageCode:'storage_25',billingCycle:'monthly',idempotencyKey:'e2e_storage_001'})).body;
    assert.equal((await api('/employer/subscription/entitlements')).body.entitlements.storage,50000000000);
    await event(addon);
    assert.equal((await api('/employer/subscription/entitlements')).body.entitlements.storage,75000000000); checks++;
    assert.equal((await api('/employer/storage-addons/checkout',{packageCode:'storage_25',billingCycle:'monthly'})).body.code,'ADDON_ALREADY_ACTIVE'); checks++;
    const upgrade = (await api('/employer/subscription/checkout',{planCode:'premium',billingCycle:'monthly',idempotencyKey:'e2e_premium_001'})).body;
    await event(upgrade,'payment.failed','evt_failed_'+upgrade.paymentAttemptId);
    assert.equal((await api(`/employer/subscription/checkout/${upgrade.paymentAttemptId}/status`)).body.status,'FAILED');
    assert.equal((await api('/employer/subscription/entitlements')).body.planCode,'growth'); checks++;
    await event(upgrade,'payment.paid','evt_paid_'+upgrade.paymentAttemptId);
    assert.equal((await api('/employer/subscription/entitlements')).body.planCode,'premium'); checks++;
    console.log(JSON.stringify({passed:checks,failed:0,account:'e2e-owner',database:'in-memory',provider:'simulated',realPayMongo:false,backendEdited:false}));
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await pg.close();
  }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode=1; });
