import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface SearchParams {
  q?: string;
  type?: 'all' | 'jobs' | 'companies';
  scope?: 'jobs' | 'companies' | 'all';
  location?: string;
  workSetup?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchJobResult {
  type: 'job';
  jobId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  companySlug: string | null;
  hasPublicProfile?: boolean;
  location: string;
  workSetup: string | null;
  employmentType: string | null;
  salary: { isPublic: boolean; min: number | null; max: number | null; currency: string } | null;
  postedAt: string | null;
  updatedAt: string | null;
  jobBanner: string | null;
}

export interface SearchCompanyResult {
  type: 'company';
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companySlug: string;
  industry: string | null;
  location: string;
  openJobsCount: number;
}

export interface SearchGroup<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface CompanySpotlightTopJob {
  jobId: string;
  title: string;
  location: string;
  workSetup: string | null;
  employmentType: string | null;
}

export interface CompanySpotlight {
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  companySlug: string;
  industry: string | null;
  location: string;
  openJobsCount: number;
  topJobs: CompanySpotlightTopJob[];
}

export interface SearchCounts {
  all: number;
  jobs: number;
  companies: number;
}

export interface EmptyRecovery {
  type: 'jobs_missing' | 'companies_missing' | 'empty';
  message: string;
}

export interface LowResultRecovery {
  enabled: boolean;
  title: string;
  suggestions: string[];
}

export interface FederatedSearchResponse {
  query: string;
  type: string;
  counts: SearchCounts;
  groups: {
    jobs: SearchGroup<SearchJobResult> | null;
    companies: SearchGroup<SearchCompanyResult> | null;
  };
  companySpotlight: CompanySpotlight | null;
  appliedFilters: {
    location: string | null;
    workSetup: string | null;
    employmentType: string | null;
    salary: { min: number | null; max: number | null };
    sort: string;
  };
  emptyRecovery: EmptyRecovery | null;
  lowResultRecovery: LowResultRecovery | null;
  latencyMs?: number;
}

export type SearchResult = SearchJobResult | SearchCompanyResult;

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

export interface SearchResponse {
  query: string;
  scope: string;
  results: SearchResult[];
  pagination: SearchPagination;
  latencyMs?: number;
}

export interface AutocompleteSuggestionGroup {
  type: 'job_title' | 'company' | 'location' | 'shortcut';
  label: string;
  sublabel?: string | null;
  logoUrl?: string | null;
  url: string;
  icon?: string;
  slug?: string | null;
}

// Backwards-compat alias used by SearchAutocompleteComponent
export type AutocompleteSuggestion = AutocompleteSuggestionGroup;

export interface AutocompleteGroups {
  jobs: AutocompleteSuggestionGroup[];
  companies: AutocompleteSuggestionGroup[];
  locations: AutocompleteSuggestionGroup[];
}

export interface AutocompleteResponse {
  query: string;
  groups?: AutocompleteGroups;
  suggestions: AutocompleteSuggestionGroup[];
}

export interface EmployerSearchParams {
  q?: string;
  scope?: 'jobs' | 'applicants';
  status?: number;
  page?: number;
  limit?: number;
}

const EMPTY_FEDERATED: FederatedSearchResponse = {
  query: '',
  type: 'all',
  counts: { all: 0, jobs: 0, companies: 0 },
  groups: { jobs: null, companies: null },
  companySpotlight: null,
  appliedFilters: { location: null, workSetup: null, employmentType: null, salary: { min: null, max: null }, sort: 'relevance' },
  emptyRecovery: null,
  lowResultRecovery: null,
};

@Injectable({ providedIn: 'root' })
export class SearchService {
  private searchUrl = `${environment.api_url}/search`;

  constructor(private http: HttpClient) {}

  searchPublic(params: SearchParams): Observable<FederatedSearchResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    // type is the new FE param, scope is the BE param — send both for max compat
    const scopeVal = params.type || params.scope || 'all';
    httpParams = httpParams.set('type', scopeVal);
    httpParams = httpParams.set('scope', scopeVal);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.workSetup) httpParams = httpParams.set('workSetup', params.workSetup);
    if (params.employmentType) httpParams = httpParams.set('employmentType', params.employmentType);
    if (params.salaryMin != null) httpParams = httpParams.set('salaryMin', String(params.salaryMin));
    if (params.salaryMax != null) httpParams = httpParams.set('salaryMax', String(params.salaryMax));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<FederatedSearchResponse>(`${this.searchUrl}/public`, { params: httpParams }).pipe(
      catchError(() => of({ ...EMPTY_FEDERATED, query: params.q || '' }))
    );
  }

  autocomplete(q: string): Observable<AutocompleteResponse> {
    if (!q || q.trim().length < 2) {
      return of({ query: q, suggestions: [], groups: { jobs: [], companies: [], locations: [] } });
    }
    const httpParams = new HttpParams().set('q', q.trim());
    return this.http.get<AutocompleteResponse>(`${this.searchUrl}/autocomplete`, { params: httpParams }).pipe(
      catchError(() => of({ query: q, suggestions: [], groups: { jobs: [], companies: [], locations: [] } }))
    );
  }

  searchEmployer(params: EmployerSearchParams): Observable<SearchResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.scope) httpParams = httpParams.set('scope', params.scope);
    if (params.status != null) httpParams = httpParams.set('status', String(params.status));
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<SearchResponse>(`${this.searchUrl}/employer`, { params: httpParams }).pipe(
      catchError(() => of({ query: '', scope: 'jobs', results: [], pagination: { page: 1, limit: 20, total: 0, hasMore: false, nextPage: null } }))
    );
  }

  searchApplicant(params: SearchParams): Observable<SearchResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.scope) httpParams = httpParams.set('scope', params.scope);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<SearchResponse>(`${this.searchUrl}/applicant`, { params: httpParams }).pipe(
      catchError(() => of({ query: '', scope: 'jobs', results: [], pagination: { page: 1, limit: 20, total: 0, hasMore: false, nextPage: null } }))
    );
  }
}
