import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface SearchParams {
  q?: string;
  scope?: 'jobs' | 'companies' | 'all';
  location?: string;
  workSetup?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: 'relevance' | 'newest' | 'salary_high';
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

export interface AutocompleteSuggestion {
  type: 'job_title' | 'company' | 'location' | 'shortcut';
  label: string;
  url: string;
  icon?: string;
}

export interface AutocompleteResponse {
  query: string;
  suggestions: AutocompleteSuggestion[];
}

export interface EmployerSearchParams {
  q?: string;
  scope?: 'jobs' | 'applicants';
  status?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private searchUrl = `${environment.api_url}/search`;

  constructor(private http: HttpClient) {}

  searchPublic(params: SearchParams): Observable<SearchResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.scope) httpParams = httpParams.set('scope', params.scope);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.workSetup) httpParams = httpParams.set('workSetup', params.workSetup);
    if (params.employmentType) httpParams = httpParams.set('employmentType', params.employmentType);
    if (params.salaryMin != null) httpParams = httpParams.set('salaryMin', String(params.salaryMin));
    if (params.salaryMax != null) httpParams = httpParams.set('salaryMax', String(params.salaryMax));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<SearchResponse>(`${this.searchUrl}/public`, { params: httpParams }).pipe(
      catchError(() => of({ query: params.q || '', scope: params.scope || 'all', results: [], pagination: { page: 1, limit: 20, total: 0, hasMore: false, nextPage: null } }))
    );
  }

  autocomplete(q: string): Observable<AutocompleteResponse> {
    if (!q || q.trim().length < 2) {
      return of({ query: q, suggestions: [] });
    }
    const httpParams = new HttpParams().set('q', q.trim());
    return this.http.get<AutocompleteResponse>(`${this.searchUrl}/autocomplete`, { params: httpParams }).pipe(
      catchError(() => of({ query: q, suggestions: [] }))
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
