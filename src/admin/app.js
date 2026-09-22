(function () {
  'use strict';

  const API_BASE = 'https://api.gethiredonline.app/api';
  const SESSION_KEY = 'gethired_admin_session';

  const icons = {
    dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    building: '<svg viewBox="0 0 24 24"><path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>',
    jobs: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
    application: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    video: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></svg>',
    revenue: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.7-.9-2-1.5-3.5-1.5C10.6 7 9 8 9 9.5s1.4 2.1 3 2.5 3 1 3 2.5-1.6 2.5-3.5 2.5c-1.5 0-2.8-.6-3.5-1.5M12 5v14"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>'
  };

  const metricDefinitions = [
    ['totalUsers', 'Total users', 'Registered portal accounts', 'users'],
    ['employers', 'Employer accounts', 'Companies and hiring teams', 'building'],
    ['jobSeekers', 'Job seekers', 'Applicant accounts', 'users'],
    ['activeJobs', 'Active jobs', 'Published job listings', 'jobs'],
    ['applications', 'Applications', 'Submitted job applications', 'application'],
    ['videoAnswers', 'Video answers', 'Recorded interview responses', 'video'],
    ['activeSubscriptions', 'Paid subscriptions', 'Active employer plans', 'revenue'],
    ['monthlyRevenue', 'Monthly revenue', 'Successful payments this month', 'revenue']
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function readSession() {
    if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      && new URLSearchParams(location.search).get('preview') === 'dashboard') {
      return { token: 'local-preview', user: { firstName: 'GetHired', lastName: 'Admin', role: 1 } };
    }
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function normalizeDashboard(payload) {
    const source = payload && payload.data ? payload.data : (payload || {});
    const pick = (...keys) => {
      for (const key of keys) if (source[key] != null) return Number(source[key]) || 0;
      return null;
    };
    return {
      totalUsers: pick('totalUsers', 'users', 'userCount'),
      employers: pick('employers', 'employerAccounts', 'companies'),
      jobSeekers: pick('jobSeekers', 'applicants', 'applicantAccounts'),
      activeJobs: pick('activeJobs', 'publishedJobs'),
      applications: pick('applications', 'totalApplications'),
      videoAnswers: pick('videoAnswers', 'interviewAnswers'),
      activeSubscriptions: pick('activeSubscriptions', 'paidSubscriptions'),
      monthlyRevenue: pick('monthlyRevenue', 'revenueThisMonth'),
      recentActivity: Array.isArray(source.recentActivity) ? source.recentActivity : [],
      trend: Array.isArray(source.trend) ? source.trend : []
    };
  }

  function formatMetric(key, value) {
    if (value == null) return '—';
    if (key === 'monthlyRevenue') return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
    return new Intl.NumberFormat('en-PH').format(value);
  }

  async function api(path, options) {
    const session = readSession();
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options && options.headers);
    if (session && session.token) headers.Authorization = 'Bearer ' + session.token;
    const response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    let body = null;
    try { body = await response.json(); } catch (_) { body = null; }
    if (!response.ok) {
      const message = body && (body.error || body.message) || 'Request failed. Please try again.';
      throw new Error(message);
    }
    return body;
  }

  function renderSignIn(message) {
    document.title = 'Sign in | GetHired Admin';
    document.getElementById('app').innerHTML = `
      <section class="signin-shell">
        <div class="signin-brand-panel">
          <div class="brand brand--light"><img src="/admin/assets/brand/gethired-logo-horizontal.png" alt="GetHired"></div>
          <div class="signin-promise">
            <span class="eyebrow eyebrow--light">Platform administration</span>
            <h1>See the health of hiring in one place.</h1>
            <p>Monitor employers, job seekers, jobs, applications, interviews, subscriptions, and payment activity across GetHired.</p>
          </div>
          <div class="signin-signal-card">
            <span class="signal-dot"></span>
            <div><strong>Live portal signals</strong><small>Operational data from GetHired services</small></div>
          </div>
        </div>
        <div class="signin-form-panel">
          <form class="signin-card" id="signinForm" novalidate>
            <div class="mobile-brand brand"><img src="/admin/assets/brand/gethired-logo-horizontal.png" alt="GetHired"></div>
            <span class="eyebrow">Admin access</span>
            <h2>Welcome back</h2>
            <p class="form-intro">Sign in with your authorized GetHired administrator account.</p>
            <div class="form-alert" id="formAlert" ${message ? '' : 'hidden'}>${escapeHtml(message || '')}</div>
            <label for="email">Email address</label>
            <div class="field-wrap"><span class="field-icon">@</span><input id="email" name="email" type="email" autocomplete="username" placeholder="admin@gethiredonline.app" required></div>
            <label for="password">Password</label>
            <div class="field-wrap"><span class="field-icon">⌁</span><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required><button class="password-toggle" type="button" aria-label="Show password">${icons.eye}</button></div>
            <div class="form-row"><label class="check"><input type="checkbox" id="rememberEmail"><span>Remember email</span></label><a href="https://gethiredonline.app/reset-password">Forgot password?</a></div>
            <button class="primary-button" id="signinButton" type="submit"><span>Sign in to dashboard</span><span aria-hidden="true">→</span></button>
            <p class="secure-note">Restricted to authorized GetHired administrators.</p>
          </form>
        </div>
      </section>`;

    const remembered = localStorage.getItem('gethired_admin_email');
    if (remembered) {
      document.getElementById('email').value = remembered;
      document.getElementById('rememberEmail').checked = true;
    }
    document.querySelector('.password-toggle').addEventListener('click', (event) => {
      const input = document.getElementById('password');
      input.type = input.type === 'password' ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    });
    document.getElementById('signinForm').addEventListener('submit', handleSignIn);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const alert = document.getElementById('formAlert');
    const button = document.getElementById('signinButton');
    if (!email || !password) {
      alert.textContent = 'Enter your email address and password.';
      alert.hidden = false;
      (!email ? form.email : form.password).focus();
      return;
    }
    button.disabled = true;
    button.firstElementChild.textContent = 'Signing in…';
    alert.hidden = true;
    try {
      const response = await api('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
      const credentials = response && response.data || {};
      if (Number(credentials.role) !== 1) throw new Error('This account does not have administrator access.');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: credentials.token, refreshToken: credentials.refreshToken, user: credentials }));
      if (form.rememberEmail.checked) localStorage.setItem('gethired_admin_email', email);
      else localStorage.removeItem('gethired_admin_email');
      location.hash = '#/dashboard';
      renderDashboard();
    } catch (error) {
      alert.textContent = error.message || 'Sign in failed. Please try again.';
      alert.hidden = false;
      button.disabled = false;
      button.firstElementChild.textContent = 'Sign in to dashboard';
    }
  }

  function dashboardShell(session) {
    return `
      <section class="portal-shell">
        ${sidebarMarkup(session, 'dashboard')}
        <div class="dashboard-main">
          <header class="topbar">
            <button class="menu-button" id="menuButton" aria-label="Open navigation">☰</button>
            <div><span class="eyebrow">Platform overview</span><h1>Dashboard</h1></div>
            <div class="topbar-actions"><span class="status-pill"><i></i> Live system</span><button class="refresh-button" id="refreshButton">Refresh data</button></div>
          </header>
          <div class="dashboard-content">
            <div class="welcome-row"><div><h2>GetHired at a glance</h2><p>Signals currently tracked across the job seeker and employer portals.</p></div><label class="period-control">Reporting period<select id="rangeSelect"><option value="7d">Last 7 days</option><option value="30d" selected>Last 30 days</option><option value="90d">Last 90 days</option></select></label></div>
            <div class="data-notice" id="dataNotice"><span>${icons.alert}</span><p><strong>Connecting to GetHired analytics</strong><small>Loading the latest available portal metrics…</small></p></div>
            <section class="metric-grid" id="metricGrid" aria-label="Platform metrics">${metricDefinitions.map(([key, title, note, icon]) => metricCard(key, title, note, icon, null)).join('')}</section>
            <section class="dashboard-grid">
              <article class="panel trend-panel"><div class="panel-heading"><div><span class="eyebrow">Activity</span><h3>Portal activity trend</h3></div><span class="legend"><i></i> Applications</span></div><div class="chart" id="trendChart">${emptyChart()}</div></article>
              <article class="panel activity-panel"><div class="panel-heading"><div><span class="eyebrow">Latest events</span><h3>Recent activity</h3></div></div><div id="activityList" class="activity-list"><div class="empty-state">Activity becomes available when the admin aggregate supplies event data.</div></div></article>
            </section>
            <section class="panel coverage-panel"><div class="panel-heading"><div><span class="eyebrow">Coverage</span><h3>Tracked GetHired signals</h3></div></div><div class="coverage-grid">${coverageItems().join('')}</div></section>
          </div>
        </div>
      </section>`;
  }

  function sidebarMarkup(session, active) {
    const name = session && session.user ? [session.user.firstName, session.user.lastName].filter(Boolean).join(' ') : 'Administrator';
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    return `<aside class="sidebar">
      <div class="brand brand--light"><img src="/admin/assets/brand/gethired-logo-horizontal.png" alt="GetHired"></div>
      <div class="admin-chip">ADMIN CONSOLE</div>
      <nav aria-label="Admin navigation">
        <a class="nav-link ${active === 'dashboard' ? 'active' : ''}" href="#/dashboard">${icons.dashboard}<span>Overview</span></a>
        <a class="nav-link ${active === 'employers' ? 'active' : ''}" href="#/employers">${icons.building}<span>Employers</span></a>
      </nav>
      <div class="sidebar-bottom">
        <div class="operator"><span class="avatar">${escapeHtml(initials)}</span><div><strong>${escapeHtml(name)}</strong><small>Administrator</small></div></div>
        <button class="logout-button" id="logoutButton" type="button" aria-label="Sign out">${icons.logout}</button>
      </div>
    </aside>`;
  }

  function employersShell(session) {
    return `<section class="portal-shell">
      ${sidebarMarkup(session, 'employers')}
      <div class="dashboard-main">
        <header class="topbar">
          <button class="menu-button" id="menuButton" aria-label="Open navigation">☰</button>
          <div><span class="eyebrow">Account management</span><h1>Employers</h1></div>
          <div class="topbar-actions"><span class="status-pill"><i></i> Live system</span><button class="refresh-button" id="refreshButton">Refresh data</button></div>
        </header>
        <div class="dashboard-content employers-content">
          <div class="welcome-row"><div><h2>Employer accounts</h2><p>Review companies, verify trusted employers, and manage archived accounts.</p></div></div>
          <section class="employer-summary" aria-label="Employer summary">
            ${['total|Total employers','verified|Verified','active|Active','archived|Archived'].map(item => { const [key,label]=item.split('|'); return `<article class="summary-widget"><span>${label}</span><strong data-employer-metric="${key}">—</strong></article>`; }).join('')}
            <div class="employer-filters">
              <label class="search-control"><span>Search</span><input id="employerSearch" type="search" placeholder="Company or email"></label>
              <label><span>Verification</span><select id="verificationFilter"><option value="all">All</option><option value="verified">Verified</option><option value="unverified">Unverified</option></select></label>
              <label><span>Status</span><select id="statusFilter"><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
              <label><span>Sort</span><select id="sortFilter"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Company name</option></select></label>
            </div>
          </section>
          <div class="data-notice" id="dataNotice"><span>${icons.alert}</span><p><strong>Loading employers</strong><small>Fetching current company records…</small></p></div>
          <section class="panel employer-list-panel"><div class="employer-list-head"><span>Employer</span><span>Team</span><span>Active jobs</span><span>Verification</span><span>Status</span><span></span></div><div id="employerList"><div class="empty-state">Loading employer accounts…</div></div></section>
        </div>
      </div>
      <div id="employerDrawer"></div>
    </section>`;
  }

  function metricCard(key, title, note, icon, value) {
    return `<article class="metric-card"><div class="metric-icon metric-icon--${icon}">${icons[icon]}</div><div class="metric-copy"><span>${escapeHtml(title)}</span><strong data-metric="${key}">${formatMetric(key, value)}</strong><small>${escapeHtml(note)}</small></div></article>`;
  }

  function emptyChart() {
    return '<div class="chart-empty"><span class="chart-line"></span><p>Trend data will appear here when available.</p></div>';
  }

  function coverageItems() {
    return [
      ['Accounts', 'Role, verification, registration'], ['Employers', 'Companies and team members'],
      ['Jobs', 'Draft, published, expired'], ['Applications', 'Volume and hiring status'],
      ['Interviews', 'Schedules and video answers'], ['Billing', 'Plans, invoices, successful payments']
    ].map(([title, text]) => `<div class="coverage-item"><span class="coverage-check">✓</span><div><strong>${title}</strong><small>${text}</small></div></div>`);
  }

  async function renderDashboard() {
    const session = readSession();
    if (!session || !session.token) {
      location.hash = '#/signin';
      renderSignIn('Sign in with an administrator account to continue.');
      return;
    }
    document.title = 'Dashboard | GetHired Admin';
    document.getElementById('app').innerHTML = dashboardShell(session);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('refreshButton').addEventListener('click', loadDashboard);
    document.getElementById('rangeSelect').addEventListener('change', loadDashboard);
    document.getElementById('menuButton').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('sidebar--open'));
    await loadDashboard();
  }

  async function renderEmployers() {
    const session = readSession();
    if (!session || !session.token) { location.hash = '#/signin'; renderSignIn('Sign in with an administrator account to continue.'); return; }
    document.title = 'Employers | GetHired Admin';
    document.getElementById('app').innerHTML = employersShell(session);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('menuButton').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('sidebar--open'));
    document.getElementById('refreshButton').addEventListener('click', loadEmployers);
    ['verificationFilter','statusFilter','sortFilter'].forEach(id => document.getElementById(id).addEventListener('change', loadEmployers));
    let searchTimer;
    document.getElementById('employerSearch').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadEmployers, 250); });
    await loadEmployers();
  }

  async function loadEmployers() {
    const button = document.getElementById('refreshButton');
    if (button) { button.disabled = true; button.textContent = 'Refreshing…'; }
    const query = new URLSearchParams({
      search: document.getElementById('employerSearch').value.trim(),
      verification: document.getElementById('verificationFilter').value,
      status: document.getElementById('statusFilter').value,
      sort: document.getElementById('sortFilter').value
    });
    try {
      const response = await api('/admin/employers?' + query.toString());
      const data = response && response.data || {};
      Object.entries(data.summary || {}).forEach(([key,value]) => { const el=document.querySelector(`[data-employer-metric="${key}"]`); if(el) el.textContent=new Intl.NumberFormat('en-PH').format(Number(value)||0); });
      renderEmployerList(data.employers || []);
      const notice=document.getElementById('dataNotice'); notice.innerHTML='<span class="notice-check">✓</span><p><strong>Live employer data</strong><small>Select any employer to review details and account controls.</small></p>'; notice.classList.remove('data-notice--warning');
    } catch (error) {
      document.getElementById('employerList').innerHTML=`<div class="empty-state">${escapeHtml(error.message)}</div>`;
      const notice=document.getElementById('dataNotice'); notice.classList.add('data-notice--warning'); notice.innerHTML=`<span>${icons.alert}</span><p><strong>Employer data unavailable</strong><small>${escapeHtml(error.message)}</small></p>`;
      if (/unauthorized|expired|token|forbidden/i.test(error.message)) logout('Your admin session has expired. Please sign in again.');
    } finally { if(button){button.disabled=false;button.textContent='Refresh data';} }
  }

  function renderEmployerList(employers) {
    const root=document.getElementById('employerList');
    if (!employers.length) { root.innerHTML='<div class="empty-state">No employers match these filters.</div>'; return; }
    root.innerHTML=employers.map(company => `<button class="employer-row" type="button" data-company-id="${escapeHtml(company.companyId)}">
      <span class="employer-identity"><span class="company-avatar">${company.logoUrl ? `<img src="${escapeHtml(company.logoUrl)}" alt="">` : escapeHtml((company.companyName||'?').charAt(0).toUpperCase())}</span><span><strong>${escapeHtml(company.companyName || 'Unnamed employer')}</strong><small>${escapeHtml(company.email || 'No company email')}</small></span></span>
      <span>${Number(company.teamMembers)||0}</span><span>${Number(company.activeJobs)||0}</span>
      <span><em class="account-badge ${company.isVerified ? 'verified' : 'neutral'}">${company.isVerified ? '✓ Verified' : 'Unverified'}</em></span>
      <span><em class="account-badge ${company.isArchived ? 'archived' : 'active'}">${company.isArchived ? 'Archived' : 'Active'}</em></span><span class="row-arrow">›</span>
    </button>`).join('');
    root.querySelectorAll('.employer-row').forEach(row => row.addEventListener('click', () => openEmployer(row.dataset.companyId)));
  }

  async function openEmployer(companyId) {
    const root=document.getElementById('employerDrawer');
    root.innerHTML='<div class="drawer-backdrop"><aside class="employer-drawer"><div class="empty-state">Loading employer details…</div></aside></div>';
    root.querySelector('.drawer-backdrop').addEventListener('click', e => { if(e.target===e.currentTarget) root.innerHTML=''; });
    try {
      const response=await api('/admin/employers/'+encodeURIComponent(companyId)); const c=response.data || {};
      root.querySelector('.employer-drawer').innerHTML=`<button class="drawer-close" type="button" aria-label="Close">×</button>
        <div class="drawer-company"><span class="company-avatar company-avatar--large">${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" alt="">` : escapeHtml((c.companyName||'?').charAt(0).toUpperCase())}</span><div><span class="eyebrow">Employer details</span><h2>${escapeHtml(c.companyName||'Unnamed employer')}</h2><p>${escapeHtml(c.email||'No company email')}</p></div></div>
        <div class="drawer-badges"><em class="account-badge ${c.isVerified?'verified':'neutral'}">${c.isVerified?'✓ Verified':'Unverified'}</em><em class="account-badge ${c.isArchived?'archived':'active'}">${c.isArchived?'Archived':'Active'}</em></div>
        <div class="detail-metrics"><div><strong>${Number(c.teamMembers)||0}</strong><span>Team members</span></div><div><strong>${Number(c.activeJobs)||0}</strong><span>Active jobs</span></div><div><strong>${Number(c.applications)||0}</strong><span>Applications</span></div></div>
        <dl class="company-details"><div><dt>Industry</dt><dd>${escapeHtml(c.industryName||'Not provided')}</dd></div><div><dt>Location</dt><dd>${escapeHtml([c.city,c.country].filter(Boolean).join(', ')||'Not provided')}</dd></div><div><dt>Contact</dt><dd>${escapeHtml(c.contactNumber||'Not provided')}</dd></div><div><dt>Joined</dt><dd>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-PH') : 'Unknown'}</dd></div></dl>
        <p class="company-description">${escapeHtml(c.details||'No company description has been added.')}</p>
        <div class="drawer-actions"><button class="primary-button" id="verifyEmployer" type="button">${c.isVerified?'Remove verification':'Verify employer'}</button><button class="secondary-danger" id="archiveEmployer" type="button">${c.isArchived?'Restore employer':'Archive employer'}</button></div>`;
      root.querySelector('.drawer-close').addEventListener('click',()=>root.innerHTML='');
      root.querySelector('#verifyEmployer').addEventListener('click',()=>updateEmployer(companyId,'verification',{verified:!c.isVerified}));
      root.querySelector('#archiveEmployer').addEventListener('click',()=>updateEmployer(companyId,'archive',{archived:!c.isArchived}));
    } catch(error){root.querySelector('.employer-drawer').innerHTML=`<button class="drawer-close" type="button" aria-label="Close">×</button><div class="empty-state">${escapeHtml(error.message)}</div>`;root.querySelector('.drawer-close').addEventListener('click',()=>root.innerHTML='');}
  }

  async function updateEmployer(companyId, action, payload) {
    const buttons=document.querySelectorAll('.drawer-actions button'); buttons.forEach(button=>button.disabled=true);
    try { await api(`/admin/employers/${encodeURIComponent(companyId)}/${action}`,{method:'PATCH',body:JSON.stringify(payload)}); await loadEmployers(); await openEmployer(companyId); }
    catch(error){ alert(error.message); buttons.forEach(button=>button.disabled=false); }
  }

  async function loadDashboard() {
    const button = document.getElementById('refreshButton');
    if (button) { button.disabled = true; button.textContent = 'Refreshing…'; }
    try {
      const range = document.getElementById('rangeSelect').value;
      const response = await api('/admin/dashboard?range=' + encodeURIComponent(range));
      updateDashboard(normalizeDashboard(response), true);
    } catch (error) {
      updateDashboard(normalizeDashboard({}), false, error.message);
      if (/unauthorized|expired|token|forbidden/i.test(error.message)) logout('Your admin session has expired. Please sign in again.');
    } finally {
      if (button) { button.disabled = false; button.textContent = 'Refresh data'; }
    }
  }

  function updateDashboard(data, connected, errorMessage) {
    metricDefinitions.forEach(([key]) => {
      const element = document.querySelector(`[data-metric="${key}"]`);
      if (element) element.textContent = formatMetric(key, data[key]);
    });
    const notice = document.getElementById('dataNotice');
    notice.classList.toggle('data-notice--warning', !connected);
    notice.innerHTML = connected
      ? '<span class="notice-check">✓</span><p><strong>Live GetHired data</strong><small>Metrics refreshed from the admin analytics service.</small></p>'
      : `<span>${icons.alert}</span><p><strong>Analytics aggregate unavailable</strong><small>${escapeHtml(errorMessage || 'No totals were returned. Metrics remain blank rather than showing sample data.')}</small></p>`;
    if (data.recentActivity.length) {
      document.getElementById('activityList').innerHTML = data.recentActivity.slice(0, 6).map(item => `<div class="activity-row"><span class="activity-dot"></span><div><strong>${escapeHtml(item.title || item.type || 'Portal activity')}</strong><small>${escapeHtml(item.detail || item.description || '')}</small></div><time>${escapeHtml(item.time || item.createdAt || '')}</time></div>`).join('');
    }
    if (data.trend.length) renderTrend(data.trend);
  }

  function renderTrend(points) {
    const values = points.map(point => Number(point.value || point.count || 0));
    const max = Math.max(1, ...values);
    document.getElementById('trendChart').innerHTML = `<div class="bars">${points.slice(-12).map((point, index) => `<div class="bar-column"><div class="bar" style="height:${Math.max(5, values[index] / max * 100)}%" title="${escapeHtml(point.label || point.date)}: ${values[index]}"></div><span>${escapeHtml(point.label || point.date || '')}</span></div>`).join('')}</div>`;
  }

  function logout(message) {
    sessionStorage.removeItem(SESSION_KEY);
    location.hash = '#/signin';
    renderSignIn(typeof message === 'string' ? message : '');
  }

  function route() {
    const path = location.hash.replace(/^#/, '') || '/signin';
    if (path === '/dashboard') renderDashboard();
    else if (path === '/employers') renderEmployers();
    else renderSignIn();
  }

  window.addEventListener('hashchange', route);
  window.GetHiredAdmin = { normalizeDashboard, formatMetric, API_BASE };
  route();
})();
