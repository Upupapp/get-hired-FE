import { PublicJobNormalizerService } from './public-job-normalizer.service';

describe('PublicJobNormalizerService salary currency', () => {
  const service = new PublicJobNormalizerService();

  it('preserves PHP and renders it instead of a dollar sign', () => {
    const job = service.normalize({ jobId: 'JB-1', jobTitle: 'QA role', jobCountry: 'Philippines', salaryMinimum: 25000, salaryMaximum: 30000, salaryCurrency: 'PHP' });
    expect(job.salaryCurrency).toBe('PHP');
    expect(job.salaryDisplay).toBe('PHP 25,000 - 30,000');
  });

  it('repairs historical Philippine jobs whose currency was stored as null', () => {
    const job = service.normalize({ jobId: 'JB-2', jobTitle: 'Legacy role', job_country: 'PH', salary_minimum: 25000, salary_maximum: 30000, salary_currency: null });
    expect(job.salaryCurrency).toBe('PHP');
    expect(job.salaryDisplay).toBe('PHP 25,000 - 30,000');
  });
});
