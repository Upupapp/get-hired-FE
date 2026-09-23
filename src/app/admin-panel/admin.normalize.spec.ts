import { Dashboard } from './admin.model';
import {
  buildAdminQuery,
  isPublishedStatus,
  jobStatusLabel,
  normalizeCompany,
  normalizeDashboard,
  normalizeJob,
  normalizePage,
  normalizeUser,
  profileFields,
  readHttpError,
  roleLabel,
} from './admin.normalize';

describe('admin response normalizers', () => {
  it('reads dashboard KPIs from the data envelope and from camelCase', () => {
    const fromEnvelope = normalizeDashboard({
      data: {
        users_total: 10,
        jobseekers_total: 6,
        employers_total: 3,
        admins_total: 1,
        jobs_active: 4,
        jobs_total: 8,
        applications_7d: 2,
        applications_30d: 9,
        companies_total: 3,
      }
    });
    expect(fromEnvelope).toEqual({
      usersTotal: 10,
      jobseekersTotal: 6,
      employersTotal: 3,
      adminsTotal: 1,
      jobsActive: 4,
      jobsTotal: 8,
      applications7d: 2,
      applications30d: 9,
      companiesTotal: 3,
    } as Dashboard);

    expect(normalizeDashboard({ usersTotal: 0, jobsActive: 1 }).usersTotal).toBe(0);
    expect(normalizeDashboard({ data: {} })).toBeNull();
    expect(normalizeDashboard(null)).toBeNull();
  });

  it('maps user, job, and company rows from snake_case or camelCase', () => {
    expect(normalizeUser({
      uid: 'U1',
      email: 'a@b.com',
      role: 3,
      first_name: 'Ada',
      last_name: 'Lovelace',
      created_at: '2026-01-02',
    })).toEqual(jasmine.objectContaining({
      uid: 'U1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 3,
    }));

    const job = normalizeJob({
      job_id: 'JB-1',
      title: 'Chef',
      company_name: 'Acme',
      status: 2,
      applicant_count: 4,
    });
    expect(job.jobId).toBe('JB-1');
    expect(job.statusLabel).toBe('Published');
    expect(job.applicantCount).toBe(4);
    expect(isPublishedStatus(job.status)).toBeTrue();
    expect(isPublishedStatus('draft')).toBeFalse();
    expect(jobStatusLabel(4)).toBe('Archived');

    expect(normalizeCompany({
      company_id: 'CO-1',
      company_name: 'Acme',
      slug: 'acme',
      open_jobs_count: 2,
    })).toEqual(jasmine.objectContaining({
      companyId: 'CO-1',
      openJobsCount: 2,
    }));
  });

  it('normalizes a paged payload and a bare page', () => {
    const page = normalizePage(
      { data: { items: [{ email: 'a@b.com', role: '2' }], total: 40, page: 2, pageSize: 25 } },
      normalizeUser,
      1,
      25
    );
    expect(page.total).toBe(40);
    expect(page.page).toBe(2);
    expect(page.items[0].email).toBe('a@b.com');
    expect(roleLabel(page.items[0].role)).toBe('Employer');

    const bare = normalizePage([{ companyName: 'Solo' }], normalizeCompany, 1, 25);
    expect(bare.items.length).toBe(1);
    expect(bare.total).toBe(1);
  });

  it('hides secrets when flattening a user profile', () => {
    const fields = profileFields({
      email: 'a@b.com',
      role: 1,
      password: 'nope',
      refreshToken: 'nope',
      profile: { city: 'Manila' },
    });
    const labels = fields.map(field => field.label);
    expect(labels).toContain('Email');
    expect(labels).toContain('Role');
    expect(labels).toContain('Profile city');
    expect(labels.some(label => /password|token/i.test(label))).toBeFalse();
    expect(fields.find(field => field.label === 'Role').value).toBe('Admin');
  });

  it('builds query strings and reads http errors', () => {
    expect(buildAdminQuery({ q: 'a b', role: '', page: 1, pageSize: 25 }))
      .toBe('?q=a%20b&page=1&pageSize=25');
    expect(readHttpError({ error: { error: 'Not allowed' } }, 'fallback')).toBe('Not allowed');
    expect(readHttpError({ status: 0 }, 'fallback')).toBe('Could not reach the server.');
    expect(readHttpError({}, 'fallback')).toBe('fallback');
  });
});
